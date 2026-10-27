"use client";
// OS-level pieces of the phone: toasts, permission prompts and the minimised home screen.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Calendar, Camera, CheckCircle2, Info, MapPin, MessageCircle, Music, ShieldHalf, AlertTriangle, Siren } from "lucide-react";
import { usePhone, MINIMIZE_SECONDS } from "@/lib/phone-state";
import { useHold, useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import StatusBar from "../StatusBar";

const TONE = {
  info: { cls: "bg-ink text-surface", icon: Info },
  ok: { cls: "bg-success text-white", icon: CheckCircle2 },
  warn: { cls: "bg-warning text-[#3d2a03]", icon: AlertTriangle },
  danger: { cls: "bg-danger text-white", icon: Siren },
};

export function PhoneToast() {
  const { toast, set, minimizeAt, disguise, revealed } = usePhone();
  const now = useNow(250);
  const hidden = disguise && !revealed; // a SafeHer toast over the fake calculator would give the disguise away
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => set({ toast: null }), minimizeAt ? MINIMIZE_SECONDS * 1000 : 3800);
    return () => clearTimeout(t);
  }, [toast, set, minimizeAt]);
  const tone = toast ? TONE[toast.tone] : TONE.info;
  return (
    <AnimatePresence>
      {toast && !hidden && (
        <motion.div key={toast.at} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-x-3 top-[54px] z-[75]">
          <div role="status" className={cn("flex items-start gap-2.5 rounded-2xl px-4 py-3 text-[15px] font-semibold shadow-md", tone.cls)}>
            <tone.icon size={20} className="mt-0.5 shrink-0" />
            <span className="flex-1">{toast.text}</span>
            {minimizeAt && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/25 text-[14px] font-bold tabular-nums">{Math.max(0, Math.ceil((minimizeAt - now) / 1000))}</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** iOS-style location prompt shown on first open. */
export function LocationPrompt() {
  const { locPerm, set, say } = usePhone();
  if (locPerm !== "unasked") return null;
  const choose = (v: "once" | "while" | "denied") => {
    set({ locPerm: v, hereAt: Date.now() });
    if (v !== "denied") say("Location on — your contacts can find you in an SOS", "ok");
  };
  return (
    <div className="absolute inset-0 z-[78] grid place-items-center bg-black/45 px-8">
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} role="alertdialog" aria-label="Location permission" className="w-full overflow-hidden rounded-[22px] bg-surface/95 text-center backdrop-blur">
        <div className="px-5 pb-4 pt-5">
          <MapPin size={28} className="mx-auto text-pink-strong" />
          <p className="mt-2 text-[17px] font-semibold leading-snug">Allow “SafeHer” to access your location?</p>
          <p className="mt-1.5 text-[13px] leading-snug text-muted">Your location is shared only with people you choose, and only during a journey or an SOS.</p>
        </div>
        {([["once", "Allow Once"], ["while", "Allow While Using App"], ["denied", "Don't Allow"]] as const).map(([v, label]) => (
          <button key={v} onClick={() => choose(v)} className="block h-12 w-full border-t border-line text-[17px] text-[#2F7BF6] active:bg-bg">{label}</button>
        ))}
      </motion.div>
    </div>
  );
}

const APPS = [
  { name: "Messages", icon: MessageCircle, bg: "#34C759" },
  { name: "Camera", icon: Camera, bg: "#8E8E93" },
  { name: "Calendar", icon: Calendar, bg: "#FF3B30" },
  { name: "Music", icon: Music, bg: "#FF2D55" },
];

/** Phone home screen shown while SafeHer is minimised, with the floating "running" bubble. */
export function Springboard() {
  const { minimized, set, disguise } = usePhone();
  if (!minimized) return null;
  const open = () => set({ minimized: false });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="absolute inset-0 z-[72] flex flex-col bg-gradient-to-b from-[#c9b6e4] via-[#e9b7cb] to-[#f5d7c4]">
      <StatusBar />
      <div className="grid grid-cols-4 gap-y-6 px-6 pt-8">
        {APPS.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-1.5">
            <span className="grid h-[60px] w-[60px] place-items-center rounded-[16px] text-white shadow-sm" style={{ background: a.bg }}><a.icon size={28} /></span>
            <span className="text-[11px] font-medium text-[#2a1f33]">{a.name}</span>
          </div>
        ))}
        <button onClick={open} className="flex flex-col items-center gap-1.5">
          {disguise
            ? <span className="grid h-[60px] w-[60px] place-items-center rounded-[16px] bg-[#1c1c1e] text-[#ff9f0a] shadow-sm"><Calculator size={30} /></span>
            : <span className="grid h-[60px] w-[60px] place-items-center rounded-[16px] bg-pink-soft text-pink-strong shadow-sm"><ShieldHalf size={30} /></span>}
          <span className="text-[11px] font-medium text-[#2a1f33]">{disguise ? "Calculator" : "SafeHer"}</span>
        </button>
      </div>
      <motion.button
        onClick={open}
        aria-label="SafeHer running — tap to reopen"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-24 right-4 flex h-14 items-center gap-2 rounded-full bg-surface/95 pl-2 pr-4 text-[14px] font-semibold text-ink shadow-md"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-pink-strong text-white">{disguise ? <Calculator size={20} /> : <ShieldHalf size={20} />}</span>
        {disguise ? "Running" : "SafeHer running"}
      </motion.button>
    </motion.div>
  );
}

/**
 * Decoy: looks like the phone died while SOS keeps recording and sharing.
 * Holding the screen for 2 seconds brings SafeHer back.
 */
export function Decoy() {
  const { decoy, set } = usePhone();
  const [phase, setPhase] = useState<"dying" | "off">("dying");
  const hold = useHold(() => set({ decoy: false }), 2000);
  useEffect(() => {
    if (!decoy) return;
    setPhase("dying");
    const t = setTimeout(() => setPhase("off"), 2600);
    return () => clearTimeout(t);
  }, [decoy]);
  if (!decoy) return null;
  return (
    <div
      className="absolute inset-0 z-[90] grid touch-none select-none place-items-center bg-black text-white"
      onPointerDown={hold.down}
      onPointerUp={hold.up}
      onPointerLeave={hold.up}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Phone appears off. Hold for 2 seconds to return."
    >
      {phase === "dying" && (
        <motion.div initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ duration: 2.6, times: [0, 0.75, 1] }} className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 60 28" className="w-24" aria-hidden><rect x="1" y="1" width="52" height="26" rx="6" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" /><rect x="4" y="4" width="4" height="20" rx="2" fill="#E5484D" /><rect x="55" y="9" width="4" height="10" rx="2" fill="#fff" fillOpacity=".6" /></svg>
          <p className="text-[15px] text-white/70">Shutting down…</p>
        </motion.div>
      )}
      {hold.p > 0 && <span className="absolute bottom-10 h-1 rounded-full bg-white/30" style={{ width: `${hold.p * 120}px` }} />}
    </div>
  );
}
