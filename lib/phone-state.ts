"use client";
// State for the /phone-demo simulation. Persisted separately from the main app store.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_SAFE_PLACES, HELP_POINTS, PHONE_CONTACTS, RISK_SCENARIOS, TELEPORTS,
  type Contact, type LatLng, type PhoneContact, type RiskScenario, type SafePlace, type TeleportKey,
} from "./seed";
import { defaultRouteKind, distM, pointAt, routeLengthM, routesFor, type RouteKind } from "./simulation";

export type Network = "5G" | "3G" | "none";
export type Tab = "home" | "map" | "sos" | "contacts" | "profile";
export type PhoneJourney = {
  destName: string;
  destPos: LatLng;
  kind: RouteKind;
  route: LatLng[];
  startedAt: number;
  progress: number;
  durationSec: number;
  flagged: boolean;
  inCab: boolean;
  cabChecked: boolean;
};
export type PhoneSOS = { startedAt: number; source: string; silent: boolean };
export type PhoneNote = { id: string; at: number; title: string; body: string };

export const MAX_FAVOURITES = 5;
export const MINIMIZE_SECONDS = 10;
const uid = () => Math.random().toString(36).slice(2, 9);

type State = {
  battery: number;
  network: Network;
  night: boolean;
  dnd: boolean;
  osDark: boolean;
  locked: boolean;
  disguise: boolean;
  revealed: boolean;
  locPerm: "unasked" | "once" | "while" | "denied";
  contactsPerm: "unasked" | "asking" | "granted" | "denied";
  favourites: string[];
  safePlaces: SafePlace[];
  here: LatLng;
  hereLabel: string;
  hereAt: number;
  inside: string[];
  tab: Tab;
  minimizeAt: number | null;
  minimized: boolean;
  journey: PhoneJourney | null;
  sos: PhoneSOS | null;
  decoy: boolean;
  risk: (RiskScenario & { at: number }) | null;
  followed: { startedAt: number; target: string } | null;
  cab: { phase: "prompt" | "camera" | "sent"; at: number } | null;
  report: { destName: string } | null;
  toast: { text: string; tone: "info" | "ok" | "warn" | "danger"; at: number } | null;
  pulse: number;
  notes: PhoneNote[];
  planTo: { name: string; pos: LatLng } | null; // destination whose route sheet is open
};

type Actions = {
  set: (p: Partial<State>) => void;
  say: (text: string, tone?: NonNullable<State["toast"]>["tone"]) => void;
  note: (title: string, body: string) => void;
  teleport: (k: TeleportKey) => void;
  toggleFavourite: (id: string) => void;
  startJourney: (destName: string, destPos: LatLng, kind?: RouteKind) => void;
  endJourney: (arrived: boolean) => void;
  fireSOS: (source: string, silent?: boolean) => void;
  resolveSOS: () => void;
  beingFollowed: () => void;
  resetPermissions: () => void;
  addSafePlace: (p: Omit<SafePlace, "id">) => void;
  removeSafePlace: (id: string) => void;
  reset: () => void;
};

const initial = (): State => ({
  battery: 76,
  network: "5G",
  night: false,
  dnd: false,
  osDark: false,
  locked: false,
  disguise: false,
  revealed: false,
  locPerm: "unasked",
  contactsPerm: "unasked",
  favourites: [],
  safePlaces: DEFAULT_SAFE_PLACES,
  here: TELEPORTS.market.pos,
  hereLabel: TELEPORTS.market.note,
  hereAt: Date.now(),
  inside: [],
  tab: "home",
  minimizeAt: null,
  minimized: false,
  journey: null,
  sos: null,
  decoy: false,
  risk: null,
  followed: null,
  cab: null,
  report: null,
  toast: null,
  pulse: 0,
  notes: [],
  planTo: null,
});

export const placesAt = (places: SafePlace[], p: LatLng) => places.filter((s) => distM(s.pos, p) <= s.radius).map((s) => s.id);

/** Where the phone is right now: along the journey, or wherever it was teleported. */
export const phonePosition = (s: Pick<State, "journey" | "here">) => (s.journey ? pointAt(s.journey.route, s.journey.progress) : s.here);

/** Nearest well-lit public place with people around — where "I'm being followed" sends you. */
export function nearestRefuge(p: LatLng) {
  return HELP_POINTS.filter((h) => h.kind !== "pharmacy" || h.hours === "Open 24 hours")
    .map((h) => ({ h, d: distM(h.pos, p) }))
    .sort((a, b) => a.d - b.d)[0];
}

export const usePhone = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),
      set: (p) => set(p),
      say: (text, tone = "info") => set({ toast: { text, tone, at: Date.now() } }),
      note: (title, body) => set((s) => ({ notes: [{ id: uid(), at: Date.now(), title, body }, ...s.notes].slice(0, 12) })),

      teleport: (k) => {
        const t = TELEPORTS[k];
        set({ journey: null, here: t.pos, hereLabel: t.note, hereAt: Date.now() });
      },

      toggleFavourite: (id) => {
        const { favourites, say } = get();
        if (favourites.includes(id)) return set({ favourites: favourites.filter((f) => f !== id) });
        if (favourites.length >= MAX_FAVOURITES) return say(`You can pick up to ${MAX_FAVOURITES} favourites`, "warn");
        set({ favourites: [...favourites, id] });
      },

      startJourney: (destName, destPos, kind) => {
        const s = get();
        const from = phonePosition(s);
        const k = kind ?? defaultRouteKind(s.night);
        const route = routesFor(from, destPos)[k];
        // Demo pacing: roughly 6 seconds per km, at least 30 seconds.
        const durationSec = Math.max(30, Math.round((routeLengthM(route) / 1000) * 6));
        set({ journey: { destName, destPos, kind: k, route, startedAt: Date.now(), progress: 0, durationSec, flagged: false, inCab: false, cabChecked: false }, tab: "map", minimized: false, minimizeAt: null });
        get().note("Journey started", `Sharing your trip to ${destName} with your favourites`);
      },

      endJourney: (arrived) => {
        const j = get().journey;
        if (!j) return;
        const here = arrived ? j.destPos : phonePosition(get());
        set({ journey: null, here, hereLabel: arrived ? j.destName : get().hereLabel, hereAt: Date.now(), followed: null, cab: null, report: j.flagged ? { destName: j.destName } : null });
        if (arrived) get().note("Arrived", `You reached ${j.destName}. Contacts notified.`);
      },

      fireSOS: (source, silent = false) => {
        if (get().sos) return;
        const j = get().journey;
        set({ sos: { startedAt: Date.now(), source, silent }, risk: null, minimized: false, minimizeAt: null, journey: j ? { ...j, flagged: true } : j, pulse: silent ? get().pulse : get().pulse + 1, tab: silent ? get().tab : "sos" });
        if (!silent) get().note("SOS sent", `Alert sent · ${source}`);
      },

      resolveSOS: () => {
        set({ sos: null, decoy: false, followed: null });
        get().say("You're marked safe. Recording saved to your vault.", "ok");
      },

      beingFollowed: () => {
        const s = get();
        const refuge = nearestRefuge(phonePosition(s));
        set({ followed: { startedAt: Date.now(), target: refuge.h.name }, pulse: s.pulse + 1 });
        get().startJourney(refuge.h.name, refuge.h.pos, "safer");
        set({ journey: { ...get().journey!, flagged: true } });
        get().note("Quietly alerted your favourites", `“I think I'm being followed.” Heading to ${refuge.h.name}.`);
        get().say(`Contacts alerted quietly. Walk to ${refuge.h.name} — ${Math.round(refuge.d)} m`, "warn");
      },

      resetPermissions: () => set({ locPerm: "unasked", contactsPerm: "unasked" }),
      addSafePlace: (p) => set((s) => ({ safePlaces: [...s.safePlaces, { ...p, id: uid() }] })),
      removeSafePlace: (id) => set((s) => ({ safePlaces: s.safePlaces.filter((p) => p.id !== id) })),
      reset: () => set(initial()),
    }),
    {
      name: "safeher-phone",
      skipHydration: true,
      // Transient UI (toasts, sheets, lock, decoy) shouldn't survive a refresh.
      partialize: ({ toast, cab, report, locked, decoy, revealed, minimizeAt, pulse, planTo, ...rest }) => rest,
    },
  ),
);

/** Favourites as alert contacts, so they sit at the front of the SOS escalation chain. */
export function favouriteContacts(ids: string[]): Contact[] {
  return ids.map((id) => PHONE_CONTACTS.find((c) => c.id === id)).filter((c): c is PhoneContact => !!c);
}

/** Escalation order everywhere: favourites first, then the trusted contacts list. */
export const sosChain = (contacts: Contact[], favourites: string[]): Contact[] => [...favouriteContacts(favourites), ...contacts];

export { RISK_SCENARIOS };
