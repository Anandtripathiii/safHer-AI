"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Phone, PhoneOff, Siren, Eye } from "lucide-react";
import { toast } from "sonner";
import { CHECKIN_REPLY_WINDOW, ESCALATION_SECONDS, FALL_SECONDS, useApp, type Risk } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { fmtClock, cn } from "@/lib/utils";
import { playCallerVoice, startRingtone } from "@/lib/sound";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./ui/sheet";

export function Waveform({ bars = 24, className }: { bars?: number; className?: string }) {
  return (
    <div className={cn("flex h-6 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-current"
          animate={{ height: ["20%", `${30 + ((i * 37) % 70)}%`, "25%"] }}
          transition={{ duration: 0.9 + (i % 5) * 0.15, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.08 }}
        />
      ))}
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 6, color = "rgb(var(--danger))", children }: { value: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))} style={{ transition: "stroke-dashoffset 250ms linear" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export const riskTone = (score: number) => (score >= 70 ? "danger" : score >= 45 ? "warning" : "success");
// Full class names so Tailwind's scanner keeps them.
export const TONE_PILL = { danger: "bg-danger/15 text-danger", warning: "bg-warning/20 text-[#9a6a0c] dark:text-warning", success: "bg-success/15 text-success" };

export function WhyDrawer({ risk, open, onOpenChange }: { risk: Risk | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!risk) return null;
  const hour = new Date(risk.at).getHours();
  const night = hour >= 21 || hour < 5;
  const rows = [
    { label: "Route deviation", value: `${risk.signals.deviation}%`, bar: risk.signals.deviation / 50, fired: risk.signals.deviation >= 15 },
    { label: "Stop duration", value: `${risk.signals.stopMin} min`, bar: risk.signals.stopMin / 5, fired: risk.signals.stopMin >= 3 },
    { label: "Time of day", value: `${new Date(risk.at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}${night ? " · night" : ""}`, bar: night ? 0.8 : 0.3, fired: night },
    { label: "Area safety score", value: `${risk.signals.areaScore}/10`, bar: 1 - risk.signals.areaScore / 10, fired: risk.signals.areaScore < 5 },
    { label: "Missed check-in", value: risk.signals.checkinMissed ? "Yes" : "No", bar: risk.signals.checkinMissed ? 1 : 0, fired: risk.signals.checkinMissed },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetTitle>Why this alert?</SheetTitle>
        <SheetDescription>Risk score {risk.score}/100 · confidence {risk.confidence.toLowerCase()}</SheetDescription>
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", r.fired ? "bg-danger" : "bg-line")} />
                  {r.label}
                </span>
                <span className="font-medium tabular-nums">{r.value}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-line/60">
                <div className={cn("h-2 rounded-full", r.fired ? "bg-danger/80" : "bg-muted/40")} style={{ width: `${Math.min(100, Math.max(4, r.bar * 100))}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-3 rounded-2xl bg-bg p-4 text-sm text-muted">
          <p><b className="text-ink">How the score works:</b> each signal adds weight; red dots are the ones that fired. Night-time and low foot-traffic areas weigh more.</p>
          <p>This is a pattern match, not a certainty. Area scores come from sample data — verify with local sources.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RiskCard() {
  const { risk, respondRisk } = useApp();
  const [why, setWhy] = useState(false);
  const tone = risk ? riskTone(risk.score) : "success";
  return (
    <>
      <AnimatePresence>
        {risk && (
          <motion.div
            key={risk.at}
            role="alertdialog"
            aria-label={risk.title}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-3 top-24 z-[1050] mx-auto max-w-md"
          >
            <div className="card p-5 shadow-md">
              <div className="flex items-start gap-4">
                <Ring value={risk.score / 100} size={60} color={`rgb(var(--${tone}))`}>
                  <span className="text-lg font-bold tabular-nums">{risk.score}</span>
                </Ring>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{risk.title}</h2>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", TONE_PILL[tone])}>
                      {risk.confidence} confidence
                    </span>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-snug text-muted">{risk.reason}</p>
                </div>
              </div>
              {risk.falseAlarm && (
                <p className="mt-3 flex gap-2 rounded-xl bg-success/10 p-3 text-sm">
                  <Info size={18} className="mt-0.5 shrink-0 text-success" />
                  This looks like a false alarm. We're showing it anyway so you can decide — nothing has been sent.
                </p>
              )}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button className="btn-secondary h-10 px-2 text-sm" onClick={() => { respondRisk("safe"); toast.success("Glad you're safe", { description: "We'll keep watching quietly." }); }}>I'm safe</button>
                <button className="btn-danger h-10 px-2 text-sm" onClick={() => respondRisk("sos")}>Send SOS</button>
                <button className="btn-ghost h-10 px-2 text-sm" onClick={() => respondRisk("watch")}>Keep watching</button>
              </div>
              <button onClick={() => setWhy(true)} className="mt-3 text-sm font-medium text-pink-strong underline-offset-4 hover:underline">Why this alert?</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <WhyDrawer risk={risk} open={why && !!risk} onOpenChange={setWhy} />
    </>
  );
}

function CheckIn() {
  const { checkin, answerCheckin } = useApp();
  const now = useNow(250);
  if (!checkin) return null;
  const age = (now - checkin.since) / 1000;
  if (checkin.phase === "prompt") {
    const left = CHECKIN_REPLY_WINDOW / 1000 - age;
    return (
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-3 bottom-24 z-[1050] mx-auto max-w-md md:bottom-6">
        <div className="card flex items-center gap-4 p-4 shadow-md">
          <Ring value={left / 30} size={48} stroke={5} color="rgb(var(--pink-strong))"><span className="text-xs font-semibold tabular-nums">{Math.ceil(left)}</span></Ring>
          <div className="flex-1">
            <p className="font-semibold">Still safe?</p>
            <p className="text-sm text-muted">Tap yes so we don't worry. Routine check-in.</p>
          </div>
          <button className="btn-primary h-11" onClick={answerCheckin}>Yes</button>
        </div>
      </motion.div>
    );
  }
  const left = ESCALATION_SECONDS - age;
  return (
    <div className="fixed inset-x-3 bottom-24 z-[1060] mx-auto max-w-md md:bottom-6" role="alertdialog" aria-label="Escalation countdown">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-card bg-danger p-5 text-white shadow-md">
        <div className="flex items-center gap-4">
          <Ring value={left / ESCALATION_SECONDS} size={72} color="#fff"><span className="text-lg font-bold tabular-nums">{fmtClock(left)}</span></Ring>
          <div>
            <p className="text-lg font-semibold">Missed check-in</p>
            <p className="text-sm text-white/85">SOS will be sent to your trusted contacts when this reaches zero.</p>
          </div>
        </div>
        <button className="btn mt-4 w-full bg-white font-semibold text-danger hover:bg-white/90" onClick={() => { answerCheckin(); toast.success("Escalation cancelled"); }}>
          Cancel — I'm safe
        </button>
      </motion.div>
    </div>
  );
}

function FallCheck() {
  const { fall, set, fireSOS, log } = useApp();
  const now = useNow(250);
  if (!fall) return null;
  const left = FALL_SECONDS - (now - fall.since) / 1000;
  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="alertdialog" aria-label="Are you okay?">
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-sm p-6 text-center">
        <div className="mx-auto w-fit"><Ring value={left / FALL_SECONDS} size={96} stroke={8}><span className="text-2xl font-bold tabular-nums">{Math.ceil(left)}</span></Ring></div>
        <h2 className="mt-4 text-xl font-semibold">Are you okay?</h2>
        <p className="mt-1 text-muted">We noticed a sudden impact. If you don't answer, we'll send an SOS.</p>
        <div className="mt-6 grid gap-2">
          <button className="btn-primary" onClick={() => { set({ fall: null }); log({ type: "fall", title: "Possible fall detected", detail: `Answered “I'm okay” in ${Math.round(FALL_SECONDS - left)}s`, status: "cancelled", notified: [] }); }}>I'm okay</button>
          <button className="btn-danger" onClick={() => fireSOS("Possible fall")}>Send help now</button>
        </div>
      </motion.div>
    </div>
  );
}

function FakeCall() {
  const { call, fakeCaller, set } = useApp();
  const now = useNow(1000);
  useEffect(() => {
    if (call?.phase === "ringing") return startRingtone();
    if (call?.phase === "answered") return playCallerVoice(fakeCaller);
  }, [call?.phase, fakeCaller]);
  if (!call) return null;
  const end = () => set({ call: null });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1300] flex flex-col items-center justify-between bg-gradient-to-b from-[#2a2235] via-[#1c1726] to-[#110e18] px-6 pb-16 pt-24 text-white">
      <div className="text-center">
        <p className="text-sm text-white/60">{call.phase === "ringing" ? "Incoming call · Mobile" : fmtClock((now - call.since) / 1000)}</p>
        <motion.div
          animate={call.phase === "ringing" ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="mx-auto mt-8 grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-pink-soft to-pink-strong text-3xl font-semibold"
        >
          {fakeCaller.slice(0, 2).toUpperCase()}
        </motion.div>
        <h2 className="mt-6 text-3xl font-semibold">{fakeCaller}</h2>
        <p className="mt-1 text-white/60">+91 98110 23457</p>
        {call.phase === "answered" && <Waveform className="mx-auto mt-6 text-white/70" />}
      </div>
      {call.phase === "ringing" ? (
        <div className="flex w-full max-w-xs justify-between">
          <button onClick={end} className="flex flex-col items-center gap-2 text-sm" aria-label="Decline">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e5484d]"><PhoneOff size={24} /></span>Decline
          </button>
          <button onClick={() => set({ call: { phase: "answered", since: Date.now() } })} className="flex flex-col items-center gap-2 text-sm" aria-label="Accept">
            <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="grid h-16 w-16 place-items-center rounded-full bg-[#30a46c]"><Phone size={24} /></motion.span>Accept
          </button>
        </div>
      ) : (
        <button onClick={end} className="flex flex-col items-center gap-2 text-sm" aria-label="End call">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e5484d]"><PhoneOff size={24} /></span>End call
        </button>
      )}
    </motion.div>
  );
}

function SosBar() {
  const { sos, resolveSOS } = useApp();
  const path = usePathname();
  const now = useNow(1000);
  if (!sos || path === "/sos") return null;
  return (
    <div className="fixed inset-x-3 top-[88px] z-[990] mx-auto max-w-5xl">
      <div className="flex items-center gap-3 rounded-2xl bg-danger px-4 py-2.5 text-sm text-white shadow-md">
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}><Siren size={18} /></motion.span>
        <span className="font-semibold">SOS active</span>
        <span className="hidden items-center gap-2 rounded-full bg-white/15 px-2.5 py-0.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-white" /> REC {fmtClock((now - sos.startedAt) / 1000)}
          <Waveform bars={10} className="h-4 text-white/80" />
        </span>
        <span className="tabular-nums sm:hidden">REC {fmtClock((now - sos.startedAt) / 1000)}</span>
        <div className="ml-auto flex items-center gap-1">
          {path !== "/map" && <Link href="/map" className="flex items-center gap-1 rounded-full px-2.5 py-1 hover:bg-white/15"><Eye size={16} /> <span className="hidden sm:inline">Live</span></Link>}
          <button className="rounded-full bg-white px-3 py-1 font-semibold text-danger" onClick={() => { resolveSOS(false); toast.success("Alert resolved", { description: "Recording saved to your Evidence Vault." }); }}>
            <span className="hidden sm:inline">I'm safe now</span><span className="sm:hidden">Safe</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Overlays() {
  return (
    <>
      <SosBar />
      <RiskCard />
      <CheckIn />
      <FallCheck />
      <FakeCall />
    </>
  );
}

