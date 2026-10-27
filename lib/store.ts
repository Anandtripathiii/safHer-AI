"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  CONTACTS, DEFAULT_ZONES, LANDMARKS, MISSED_CHECKIN as MISSED, RISK_SCENARIOS, seedEvents, seedPosts,
  type Contact, type EventStatus, type Lang, type LatLng, type Post, type RiskScenario, type SafeEvent, type SafeZone,
} from "./seed";
import { coordinationAt, coordinationScript, distM, etaMinutes, routeScores, routesFor, type RouteKind } from "./simulation";
import { sosChain, usePhone } from "./phone-state";
import { syncedStorage } from "./supabase";

/** Who an SOS goes to, in order: starred favourites, then trusted contacts. */
export const alertChain = (contacts: Contact[]) => sosChain(contacts, usePhone.getState().favourites);

export type Journey = {
  id: string;
  fromId: string;
  toId: string;
  startedAt: number;
  etaMin: number;
  arriveBy: string;
  notify: string[];
  route: LatLng[];
  progress: number;
  nextCheckinAt: number;
  nextRiskAt: number;
  riskIdx: number;
  zonesInside: string[];
};
export type SOS = { id: string; startedAt: number; source: string; weak: boolean };
export type Evidence = { id: string; ts: number; durationSec: number; source: string };
export type Risk = RiskScenario & { at: number };
export type WebLocation = { status: "idle" | "asking" | "granted" | "denied"; lat?: number; lng?: number; acc?: number; at?: number };

export const CHECKIN_EVERY = 120_000;
export const CHECKIN_REPLY_WINDOW = 30_000;
export const ESCALATION_SECONDS = 60;
export const FALL_SECONDS = 15;
export const SHARE_MINUTES = 60;
export const riskGap = () => 10_000 + Math.random() * 5_000;

type State = {
  lang: Lang;
  theme: "light" | "dark";
  demoMode: boolean;
  safeWord: string;
  fallDetection: boolean;
  weakNetwork: boolean;
  fakeCaller: string;
  fakeCallDelay: number;

  contacts: Contact[];
  events: SafeEvent[];
  posts: Post[];
  zones: SafeZone[];
  evidence: Evidence[];

  journey: Journey | null;
  risk: Risk | null;
  lastRisk: Risk | null;
  checkin: { phase: "prompt" | "escalating"; since: number } | null;
  sos: SOS | null;
  sharing: { startedAt: number; minutes: number } | null;
  fall: { since: number } | null;
  fakeCallAt: number | null;
  call: { phase: "ringing" | "answered"; since: number } | null;
  webLoc: WebLocation;
  // Arriving at a safe-place destination collapses the navbar to a bubble after a countdown.
  minimizeAt: number | null;
  minimized: boolean;
};

type Actions = {
  set: (p: Partial<State>) => void;
  log: (e: Omit<SafeEvent, "id" | "ts"> & { ts?: number }) => string;
  updateEvent: (id: string, p: Partial<SafeEvent>) => void;
  startJourney: (p: { fromId: string; toId: string; arriveBy: string; notify: string[]; kind?: RouteKind }) => void;
  endJourney: (arrived: boolean) => void;
  triggerRisk: (s?: RiskScenario) => void;
  respondRisk: (r: "safe" | "sos" | "watch") => void;
  answerCheckin: () => void;
  missCheckin: () => void;
  fireSOS: (source: string) => void;
  resolveSOS: (falseAlarm: boolean) => void;
  startSharing: () => void;
  stopSharing: () => void;
  saveContact: (c: Contact) => void;
  removeContact: (id: string) => void;
  addPost: (p: Omit<Post, "id" | "ts" | "helpful">) => void;
  markHelpful: (id: string) => void;
  addZone: (z: Omit<SafeZone, "id">) => void;
  removeZone: (id: string) => void;
  requestLocation: () => void;
  reset: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 9);
export const landmark = (id: string) => LANDMARKS.find((l) => l.id === id) ?? LANDMARKS[0];
export const zonesAt = (zones: SafeZone[], p: LatLng) => zones.filter((z) => distM(z.pos, p) <= z.radius).map((z) => z.id);

const initial = (): State => {
  const now = Date.now();
  return {
    lang: "en",
    theme: "light",
    demoMode: false,
    safeWord: "pineapple", // default until she sets her own in Settings
    fallDetection: false,
    weakNetwork: false,
    fakeCaller: "Mom",
    fakeCallDelay: 30,
    contacts: CONTACTS,
    events: seedEvents(now),
    posts: seedPosts(now),
    zones: DEFAULT_ZONES,
    evidence: [{ id: "ev-seed", ts: now - 12 * 86400_000, durationSec: 214, source: "Shake gesture" }],
    journey: null,
    risk: null,
    lastRisk: { ...RISK_SCENARIOS[1], at: now - 3 * 86400_000 },
    checkin: null,
    sos: null,
    sharing: null,
    fall: null,
    fakeCallAt: null,
    call: null,
    webLoc: { status: "idle" },
    minimizeAt: null,
    minimized: false,
  };
};

export const useApp = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),
      set: (p) => set(p),

      log: (e) => {
        const id = uid();
        set((s) => ({ events: [{ ts: Date.now(), ...e, id }, ...s.events] }));
        return id;
      },
      updateEvent: (id, p) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...p } : e)) })),

      startJourney: ({ fromId, toId, arriveBy, notify, kind = "safer" }) => {
        const from = landmark(fromId), to = landmark(toId);
        const { route, minutes } = journeyOptions(fromId, toId)[kind];
        const now = Date.now();
        set({
          journey: {
            id: uid(), fromId, toId, startedAt: now, arriveBy, notify, route, progress: 0,
            etaMin: minutes,
            nextCheckinAt: now + CHECKIN_EVERY, nextRiskAt: now + riskGap(), riskIdx: 0,
            zonesInside: zonesAt(get().zones, route[0]),
          },
          sharing: get().sharing ?? { startedAt: now, minutes: SHARE_MINUTES },
        });
        get().log({ type: "journey", title: `${from.name} → ${to.name}`, detail: "Journey started · live location shared", status: "active", notified: notifyNames(get().contacts, notify) });
      },

      endJourney: (arrived) => {
        const j = get().journey;
        if (!j) return;
        const mins = Math.max(1, Math.round((Date.now() - j.startedAt) / 60000));
        const ev = get().events.find((e) => e.type === "journey" && e.status === "active");
        if (ev) get().updateEvent(ev.id, { status: arrived ? "completed" : "cancelled", detail: arrived ? `Arrived safely · ${mins} min` : `Stopped early after ${mins} min` });
        set({ journey: null, risk: null, checkin: null, fall: null, sharing: get().sos ? get().sharing : null });
      },

      triggerRisk: (s) => {
        const j = get().journey;
        const scenario = s ?? RISK_SCENARIOS[(j?.riskIdx ?? 0) % RISK_SCENARIOS.length];
        const risk = { ...scenario, at: Date.now() };
        set({ risk, lastRisk: risk, journey: j && !s ? { ...j, riskIdx: j.riskIdx + 1 } : j });
      },

      respondRisk: (r) => {
        const risk = get().risk;
        if (!risk) return;
        const j = get().journey;
        set({ risk: null, journey: j ? { ...j, nextRiskAt: Date.now() + riskGap() } : j });
        if (r === "sos") return get().fireSOS(`Risk alert (score ${risk.score})`);
        if (r === "safe") get().log({ type: "alert", title: risk.title, detail: `Risk ${risk.score} · ${risk.falseAlarm ? "confirmed false alarm" : "you replied “I'm safe”"}`, status: risk.falseAlarm ? "false-alarm" : "resolved", notified: [] });
      },

      answerCheckin: () => {
        const { checkin, journey } = get();
        if (checkin?.phase === "escalating") get().log({ type: "checkin", title: "Escalation cancelled", detail: "You confirmed you're safe before the countdown ended", status: "cancelled", notified: [] });
        set({ checkin: null, journey: journey ? { ...journey, nextCheckinAt: Date.now() + CHECKIN_EVERY } : null });
      },

      missCheckin: () => {
        set({ checkin: { phase: "escalating", since: Date.now() }, lastRisk: { ...MISSED, at: Date.now() } });
      },

      fireSOS: (source) => {
        if (get().sos) return;
        const now = Date.now();
        const contacts = alertChain(get().contacts);
        set({
          sos: { id: uid(), startedAt: now, source, weak: get().weakNetwork },
          sharing: get().sharing ?? { startedAt: now, minutes: SHARE_MINUTES },
          risk: null, checkin: null, fall: null, minimized: false, minimizeAt: null,
        });
        const evId = get().log({ type: "sos", title: `SOS — ${source}`, detail: "Alert in progress · recording started", status: "active", notified: contacts.filter((c) => !c.escalation).map((c) => c.name), battery: usePhone.getState().battery });
        // Prefer the real device battery when the browser exposes it.
        (navigator as Navigator & { getBattery?: () => Promise<{ level: number }> }).getBattery?.()
          .then((b) => get().updateEvent(evId, { battery: Math.round(b.level * 100) }))
          .catch(() => {});
      },

      resolveSOS: (falseAlarm) => {
        const { sos, journey } = get();
        if (!sos) return;
        const contacts = alertChain(get().contacts);
        const elapsed = (Date.now() - sos.startedAt) / 1000;
        const primary = contacts.filter((c) => !c.escalation);
        const { status, escalated } = coordinationAt(coordinationScript(contacts, sos.weak), primary.map((c) => c.id), elapsed);
        const acked = contacts.filter((c) => status[c.id] === "acknowledged").map((c) => c.name);
        const notified = [...primary.map((c) => c.name), ...(escalated ? contacts.filter((c) => c.escalation).map((c) => c.name) : [])];
        const ev = get().events.find((e) => e.type === "sos" && e.status === "active");
        const st: EventStatus = falseAlarm ? "false-alarm" : escalated ? "escalated" : "resolved";
        const detail = falseAlarm
          ? "Cancelled as a false alarm · contacts told you're safe"
          : `${acked.length ? `${acked.join(", ")} acknowledged` : "No acknowledgements yet"}${escalated ? " · escalated" : ""} · resolved by you`;
        if (ev) get().updateEvent(ev.id, { status: st, detail, notified });
        set((s) => ({
          sos: null,
          sharing: journey ? s.sharing : null,
          evidence: [{ id: uid(), ts: sos.startedAt, durationSec: Math.round(elapsed), source: sos.source }, ...s.evidence],
        }));
      },

      startSharing: () => set({ sharing: { startedAt: Date.now(), minutes: SHARE_MINUTES } }),
      stopSharing: () => set({ sharing: null }),

      saveContact: (c) => set((s) => ({ contacts: s.contacts.some((x) => x.id === c.id) ? s.contacts.map((x) => (x.id === c.id ? c : x)) : [...s.contacts, c] })),
      removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      addPost: (p) => set((s) => ({ posts: [{ ...p, id: uid(), ts: Date.now(), helpful: 0 }, ...s.posts] })),
      markHelpful: (id) => set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, helpful: p.helpful + 1 } : p)) })),

      addZone: (z) => set((s) => ({ zones: [...s.zones, { ...z, id: uid() }] })),
      removeZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),

      // One reading on request. No background tracking.
      requestLocation: () => {
        if (!("geolocation" in navigator)) return set({ webLoc: { status: "denied" } });
        set({ webLoc: { ...get().webLoc, status: "asking" } });
        navigator.geolocation.getCurrentPosition(
          (p) => set({ webLoc: { status: "granted", lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy), at: Date.now() } }),
          (e) => set({ webLoc: { status: e.code === e.PERMISSION_DENIED ? "denied" : "idle" } }),
          { enableHighAccuracy: true, timeout: 10_000 },
        );
      },

      reset: () => set({ ...initial(), theme: get().theme }),
    }),
    {
      name: "safeher",
      storage: createJSONStorage(() => syncedStorage),
      skipHydration: true,
      // Never write real coordinates to storage; only whether permission was granted or denied.
      // Minimised state is per-visit: a refresh always shows the full navbar.
      partialize: (s) => ({ ...s, webLoc: { status: s.webLoc.status === "asking" ? "idle" : s.webLoc.status }, minimized: false, minimizeAt: null }),
    },
  ),
);

/** Both route options between two landmarks, with sample scores. The demo pair is fixed at 12 vs 15 minutes. */
export function journeyOptions(fromId: string, toId: string, night = false) {
  const routes = routesFor(landmark(fromId).pos, landmark(toId).pos, fromId, toId);
  const fastestMin = fromId === "hkm" && toId === "iiitd" ? 12 : etaMinutes(routes.fastest);
  const build = (k: RouteKind) => ({ route: routes[k], ...routeScores(k, night, fastestMin) });
  return { fastest: build("fastest"), safer: build("safer") };
}

export const notifyNames = (contacts: Contact[], ids: string[]) => contacts.filter((c) => ids.includes(c.id)).map((c) => c.name);

