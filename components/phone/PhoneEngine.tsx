"use client";
// Timers for the phone simulation. Mirrors components/Engine.tsx but drives lib/phone-state.
import { useEffect } from "react";
import { usePhone, phonePosition, placesAt, MINIMIZE_SECONDS } from "@/lib/phone-state";

export default function PhoneEngine() {
  useEffect(() => {
    let last = Date.now();
    let lastLocationSent = false;
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      const s = usePhone.getState();
      const locOn = s.locPerm === "once" || s.locPerm === "while";

      if (s.journey) {
        const j = s.journey;
        const speed = j.inCab ? 3 : 1;
        const progress = Math.min(1, j.progress + (dt * speed) / j.durationSec);
        s.set({ journey: { ...j, progress } });
        // A sudden jump in speed means she's probably in a vehicle.
        if (j.inCab && !j.cabChecked && !s.cab && now - j.startedAt > 1500) {
          s.set({ cab: { phase: "prompt", at: now }, journey: { ...j, progress, cabChecked: true } });
        }
        if (progress >= 1) {
          s.endJourney(true);
          s.say(`Arrived at ${j.destName}. Contacts notified ✓`, "ok");
        }
      }

      // Safe places: arriving minimises the app to save battery; leaving brings it back.
      const st = usePhone.getState();
      const inside = placesAt(st.safePlaces, phonePosition(st));
      const entered = inside.find((id) => !st.inside.includes(id));
      const left = st.inside.find((id) => !inside.includes(id));
      if (entered || left) {
        st.set({ inside });
        if (entered && !st.sos) {
          const p = st.safePlaces.find((x) => x.id === entered)!;
          st.say(`You've reached ${p.name} — app will minimize in ${MINIMIZE_SECONDS}s to save battery`, "ok");
          st.note(`Reached ${p.name} ✓`, "Your favourites were told automatically");
          st.set({ minimizeAt: now + MINIMIZE_SECONDS * 1000 });
        } else if (left) {
          const p = st.safePlaces.find((x) => x.id === left);
          st.set({ minimized: false, minimizeAt: null });
          if (p) { st.say(`You left ${p.name} — SafeHer is active`, "warn"); st.note(`Left ${p.name}`, "SafeHer is watching your trip again"); }
        }
      }
      if (st.minimizeAt && now >= st.minimizeAt) st.set({ minimized: true, minimizeAt: null, revealed: false });

      // Keeps the "Updated 2s ago" pill honest while location is on.
      if (locOn && now - st.hereAt >= 2000) st.set({ hereAt: now });

      if (st.battery <= 2 && !lastLocationSent) {
        lastLocationSent = true;
        st.note("Last location sent", "Battery almost empty — favourites got your last known location");
        st.say("Battery almost empty — last location sent to your favourites", "danger");
      }
      if (st.battery > 2) lastLocationSent = false;
    }, 500);
    return () => clearInterval(id);
  }, []);
  return null;
}
