"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BatteryWarning, EyeOff, Star } from "lucide-react";
import { usePhone, sosChain } from "@/lib/phone-state";
import { useApp } from "@/lib/store";
import { useHold, useNow } from "@/lib/hooks";
import { coordinationAt, coordinationScript } from "@/lib/simulation";
import { speak } from "@/lib/sound";
import { cn, fmtClock } from "@/lib/utils";
import { StatusPill } from "../Coordination";
import { Waveform } from "../Overlays";
import { BatteryBanner, LocationOffBanner } from "../SafetyBanners";
import { Avatar, pbtn } from "./ui";

/** Live status of everyone alerted, favourites first. Shared by the SOS screen and Mom's view. */
export function usePhoneCoordination() {
  const { sos, favourites, network } = usePhone();
  const contacts = useApp((s) => s.contacts);
  const now = useNow(500);
  if (!sos) return null;
  const chain = sosChain(contacts, favourites);
  const elapsed = (now - sos.startedAt) / 1000;
  const primary = chain.filter((c) => !c.escalation);
  const r = coordinationAt(coordinationScript(chain, network !== "5G"), primary.map((c) => c.id), elapsed);
  return { ...r, rows: chain.filter((c) => !c.escalation || r.status[c.id]), elapsed, primaryCount: primary.length };
}

export default function SosScreen() {
  const s = usePhone();
  const now = useNow(1000);
  const coord = usePhoneCoordination();
  const safeWord = useApp((x) => x.safeWord);
  const hold = useHold(() => s.fireSOS("Hold-to-confirm"));
  const spokenFor = useRef<number | null>(null);

  // Audio confirmation for a normal (not silent) SOS.
  useEffect(() => {
    if (!s.sos || s.sos.silent || !coord || spokenFor.current === s.sos.startedAt) return;
    spokenFor.current = s.sos.startedAt;
    navigator.vibrate?.([200, 100, 200]);
    speak(`Alert sent to ${coord.primaryCount} people. You are being recorded and tracked.`);
  }, [s.sos, coord]);

  if (s.sos) {
    const elapsed = (now - s.sos.startedAt) / 1000;
    return (
      <div className="min-h-full bg-[#1a1220] px-4 pb-6 pt-2 text-white">
        <div className="flex items-center gap-3">
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="grid h-14 w-14 place-items-center rounded-full bg-danger text-[15px] font-black">SOS</motion.span>
          <div>
            <p className="text-[22px] font-bold leading-tight">{s.sos.silent ? "Silent alert active" : "Alert sent"}</p>
            <p className="text-[14px] text-white/60">{s.sos.source} · {fmtClock(elapsed)}</p>
          </div>
        </div>
        <BatteryBanner level={s.battery} className="mt-4" />
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.08] px-4 py-3 text-[15px] font-semibold">
          <span className="h-3 w-3 animate-pulse rounded-full bg-danger" /> Recording {fmtClock(elapsed)}
          <Waveform bars={12} className="ml-auto h-6 text-white/70" />
        </div>
        {s.network !== "5G" && <p className="mt-2 rounded-xl bg-warning/25 px-3 py-2 text-[14px] font-semibold">{s.network === "none" ? "No signal — alerts queued, will send by SMS as soon as any bar appears" : "Weak network — sending by SMS"}</p>}
        <ul className="mt-4 space-y-2">
          {coord?.rows.map((c) => {
            const fav = s.favourites.includes(c.id);
            return (
              <li key={c.id} className="flex min-h-[60px] items-center gap-3 rounded-2xl bg-white/[0.06] px-3 py-2">
                <Avatar initials={c.initials} color={c.color} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold">{c.name}</span>
                  {fav ? <span className="inline-flex items-center gap-1 rounded-full bg-[#7c5cd6] px-2 py-0.5 text-[11px] font-bold"><Star size={11} className="fill-current" />Favourite</span>
                    : <span className="text-[12px] text-white/50">{c.escalation ? "Escalation" : c.relation}</span>}
                </span>
                <StatusPill s={coord.status[c.id] ?? "pending"} />
              </li>
            );
          })}
        </ul>
        {coord?.escalated && <p className="mt-3 rounded-xl bg-warning/25 px-3 py-2 text-[15px] font-bold">No response — escalating</p>}
        <div className="mt-5 space-y-2">
          <button className={cn(pbtn.danger, "bg-white text-[#1a1220]")} onClick={s.resolveSOS}>I'm safe now</button>
          <button className={cn(pbtn.secondary, "border-white/25 bg-transparent text-white active:bg-white/10")} onClick={() => s.set({ decoy: true })}>
            <EyeOff size={20} /> Show fake “phone dying” screen
          </button>
          <p className="text-center text-[12px] text-white/50">The decoy keeps recording and sharing. Hold the screen for 2s to come back.</p>
        </div>
      </div>
    );
  }

  const r = 124, c = 2 * Math.PI * r;
  return (
    <div className="flex min-h-full flex-col items-center bg-[#1a1220] px-4 pb-6 pt-4 text-white">
      {s.locPerm === "denied" && <LocationOffBanner className="mb-3 w-full bg-white/10 text-white" />}
      {s.battery < 10 && <p className="mb-3 flex w-full items-center gap-2 rounded-2xl bg-danger px-4 py-3 text-[15px] font-bold"><BatteryWarning size={22} />Critical battery — your last location will auto-send</p>}
      <h2 className="text-center text-[24px] font-bold leading-tight">Press and hold<br />for 2 seconds</h2>
      <p className="mt-2 text-center text-[15px] text-white/60">Release to cancel</p>
      <p className="mt-3 rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold">Listening for: “{safeWord}”</p>
      <div className="relative mt-6 grid h-[288px] w-[288px] place-items-center">
        <svg width="288" height="288" className="absolute -rotate-90" aria-hidden>
          <circle cx="144" cy="144" r={r} fill="none" stroke="rgb(255 255 255 / .08)" strokeWidth="12" />
          <circle cx="144" cy="144" r={r} fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - hold.p)} />
        </svg>
        <motion.button
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); hold.down(); }}
          onPointerUp={hold.up}
          onPointerCancel={hold.up}
          onContextMenu={(e) => e.preventDefault()}
          animate={{ scale: hold.p > 0 ? 0.95 : 1 }}
          aria-label="SOS — press and hold for 2 seconds"
          className="grid h-[224px] w-[224px] touch-none select-none place-items-center rounded-full bg-danger shadow-[0_0_0_12px_rgb(217_55_92/0.2)]"
        >
          <span className="text-center">
            <span className="block text-[56px] font-black tracking-wider">SOS</span>
            <span className="block text-[18px] font-bold tabular-nums text-white/85">{hold.p > 0 ? `${((1 - hold.p) * 2).toFixed(1)}s` : "hold"}</span>
          </span>
        </motion.button>
      </div>
      <div className="mt-6 w-full space-y-2 text-[15px]">
        <p className="rounded-2xl bg-white/[0.06] px-4 py-3"><b>Silent SOS:</b> triple-tap anywhere, or hold the side button for 2s. No sound, nothing on screen.</p>
        <p className="rounded-2xl bg-white/[0.06] px-4 py-3"><b>Who gets alerted:</b> your starred favourites first, then Mom, Dad, Priya — Campus Security if nobody answers.</p>
      </div>
    </div>
  );
}
