"use client";
// The one place timers live. Each tick reads the store, advances the simulation and writes back.
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CHECKIN_REPLY_WINDOW, ESCALATION_SECONDS, FALL_SECONDS, useApp, zonesAt, landmark, notifyNames, alertChain,
} from "@/lib/store";
import { pointAt } from "@/lib/simulation";
import { alertChime } from "@/lib/sound";

export default function Engine() {
  const router = useRouter();
  const path = usePathname();
  const pathRef = useRef(path);
  pathRef.current = path;
  const sos = useApp((s) => s.sos);

  // SOS side effects: sound, toast, jump to live tracking.
  // Only for fresh alerts, so restoring a saved SOS after a refresh stays quiet.
  useEffect(() => {
    if (sos && Date.now() - sos.startedAt < 3000) {
      const n = alertChain(useApp.getState().contacts).filter((c) => !c.escalation).length;
      alertChime();
      navigator.vibrate?.([200, 100, 200]);
      toast.success(`Alert sent to ${n} contacts`, { description: "Live location shared · recording started" });
      if (pathRef.current !== "/map") setTimeout(() => router.push("/map"), 900);
    }
  }, [sos?.id, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      const s = useApp.getState();

      if (s.journey) {
        const j = s.journey;
        const speed = s.demoMode ? 10 : 1;
        const progress = Math.min(1, j.progress + (dt * speed) / (j.etaMin * 60));
        const pos = pointAt(j.route, progress);

        // Safe-zone enter/leave → automatic update to contacts.
        const inside = zonesAt(s.zones, pos);
        const notified = notifyNames(s.contacts, j.notify);
        for (const z of s.zones) {
          const was = j.zonesInside.includes(z.id), is = inside.includes(z.id);
          if (was === is) continue;
          const msg = is ? `Anand reached ${z.name} ✓` : `Anand left ${z.name}`;
          toast(msg, { description: `Auto-update sent to ${notified.join(", ") || "your contacts"}` });
          s.log({ type: "zone", title: is ? `Reached ${z.name}` : `Left ${z.name}`, detail: `Auto-update: “${msg}”`, status: "completed", notified });
        }

        let next = { ...j, progress, zonesInside: inside };
        const busy = s.risk || s.sos || s.checkin || s.fall || s.call;

        // Up to three automatic risk signals per journey, 10–15s apart. The demo panel can fire more.
        if (!busy && j.riskIdx < 3 && now >= j.nextRiskAt) {
          s.set({ journey: next });
          s.triggerRisk();
          return;
        }
        if (!busy && now >= j.nextCheckinAt) s.set({ checkin: { phase: "prompt", since: now } });

        if (progress >= 1) {
          s.set({ journey: next });
          s.endJourney(true);
          toast.success(`Arrived at ${landmark(j.toId).name}`, { description: "Contacts notified · location sharing stopped" });
          return;
        }
        s.set({ journey: next });
      }

      if (s.checkin) {
        const age = now - s.checkin.since;
        if (s.checkin.phase === "prompt" && age > CHECKIN_REPLY_WINDOW) {
          s.missCheckin();
          s.log({ type: "checkin", title: "Missed check-in", detail: "No reply in 30s · 60s escalation countdown started", status: "escalated", notified: [] });
        } else if (s.checkin.phase === "escalating" && age >= ESCALATION_SECONDS * 1000) {
          s.fireSOS("Missed check-in");
        }
      }

      if (s.fall && now - s.fall.since >= FALL_SECONDS * 1000) s.fireSOS("Possible fall — no response");

      if (s.fakeCallAt && now >= s.fakeCallAt) s.set({ fakeCallAt: null, call: { phase: "ringing", since: now } });

      if (s.sharing && !s.sos && !s.journey && now - s.sharing.startedAt > s.sharing.minutes * 60000) {
        s.stopSharing();
        toast("Location sharing ended", { description: "Your sharing window ran out." });
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Global keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
      const s = useApp.getState();
      const k = e.key.toLowerCase();
      if (k === "s") { e.preventDefault(); s.fireSOS("Keyboard shortcut"); }
      else if (k === "d") { e.preventDefault(); s.set({ demoMode: !s.demoMode }); toast(`Demo mode ${!s.demoMode ? "on" : "off"}`); }
      else if (k === "x") {
        e.preventDefault();
        if (s.sos) { s.resolveSOS(true); toast("False alarm cancelled", { description: "Contacts told you're safe." }); }
        else if (s.risk) s.respondRisk("safe");
        else if (s.checkin) s.answerCheckin();
      } else if (k === "f") { e.preventDefault(); s.set({ call: { phase: "ringing", since: Date.now() } }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
