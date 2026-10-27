"use client";
// Hands-free walkthrough for judges. Every step drives the existing phone simulation (lib/phone-state).
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import { usePhone } from "@/lib/phone-state";
import { RISK_SCENARIOS } from "@/lib/seed";
import { unlockAudio } from "@/lib/sound";
import Logo from "./Logo";

export const AUTO_DEMO_EVENT = "safeher:auto-demo";

const p = () => usePhone.getState();
const home = () => p().safePlaces.find((s) => s.name === "Home") ?? p().safePlaces[0];

const STEPS: { caption: string; ms: number; run?: () => void }[] = [
  { caption: "Meet SafeHer — a calm safety companion. Watch Anand's walk home at night.", ms: 4000, run: () => {
    if (p().sos) p().resolveSOS();
    p().set({ risk: null, cab: null, report: null, decoy: false, locked: false, minimized: false, minimizeAt: null, revealed: true, followed: null,
      journey: null, planTo: null, favourites: [], network: "5G", battery: 76, locPerm: "while", hereAt: Date.now(), tab: "home", inside: [] });
  } },
  { caption: "It's night. Anand is on a dark, empty lane off Outer Ring Road.", ms: 4500, run: () => { p().set({ night: true }); p().teleport("unsafe"); } },
  { caption: "She picks Home. Two routes: Fastest is poorly lit at night, so SafeHer suggests Safer.", ms: 6000, run: () => p().set({ planTo: { name: home().name, pos: home().pos } }) },
  { caption: "Safe Journey started on the Safer route. Mom and Priya watch her blue dot live.", ms: 6000, run: () => { p().set({ planTo: null }); p().startJourney(home().name, home().pos, "safer"); } },
  { caption: "Risk detected — unusual stop near a low-foot-traffic area (score 84).", ms: 5000, run: () => { const j = p().journey; p().set({ risk: { ...RISK_SCENARIOS[2], at: Date.now() }, journey: j ? { ...j, flagged: true } : j, pulse: p().pulse + 1 }); } },
  { caption: "SafeHer asks first: verify or cancel. No answer in 3 seconds…", ms: 3000 },
  { caption: "SOS sent. Mom: delivered → viewed → acknowledged “On my way”. Recording started.", ms: 12000, run: () => p().fireSOS(`Risk alert (score ${RISK_SCENARIOS[2].score})`) },
  { caption: "Priya hasn't answered in 20 seconds — escalating to Campus Security, who dispatch a guard.", ms: 20000 },
  { caption: "Battery drops to 15% — power-saver kicks in and SafeHer keeps tracking.", ms: 5000, run: () => { p().resolveSOS(); p().set({ battery: 15, tab: "home" }); } },
  { caption: "She reaches Home, a safe place. Contacts are told, and SafeHer minimises to save battery.", ms: 13000, run: () => { p().set({ inside: [], journey: null }); p().teleport("home"); } },
  { caption: "Demo complete — SafeHer AI, Problem Statement 4.", ms: 0 },
];

/** Starts from `/phone-demo?auto=1` or the AUTO_DEMO_EVENT. Esc or a click outside the caption bar exits. */
export default function AutoDemo() {
  const [step, setStep] = useState(-1);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = step >= 0;

  const exit = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setStep(-1);
    setPaused(false);
    if (window.location.search.includes("auto=1")) window.history.replaceState(null, "", "/phone-demo");
  }, []);
  const start = useCallback(() => { unlockAudio(); setPaused(false); setStep(0); }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("auto") === "1") start();
    window.addEventListener(AUTO_DEMO_EVENT, start);
    return () => window.removeEventListener(AUTO_DEMO_EVENT, start);
  }, [start]);

  // Run each step's action once when it begins.
  useEffect(() => { if (active) STEPS[step].run?.(); }, [step, active]);

  // Auto-advance; pausing holds the current step, resume restarts its timer.
  useEffect(() => {
    if (!active || paused || !STEPS[step].ms) return;
    timer.current = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), STEPS[step].ms);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [step, paused, active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && exit();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit]);

  if (!active) return null;
  const last = step === STEPS.length - 1;

  return (
    <>
      {/* Click-catcher: the phone is driven by the script; clicking anywhere outside the bar exits. */}
      <button aria-label="Exit auto demo" onClick={exit} className="fixed inset-0 z-[1180] cursor-default bg-transparent" />
      {last && (
        <div className="fixed inset-0 z-[1185] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-8 text-center">
            <Logo className="text-[34px]" />
            <h2 className="mt-4 text-2xl font-semibold">Demo complete</h2>
            <p className="mt-1 text-muted">SafeHer AI — Problem Statement 4. All data shown is synthetic.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button className="btn-primary" onClick={start}><RotateCcw size={18} /> Replay</button>
              <button className="btn-secondary" onClick={exit}>Explore yourself</button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-x-3 bottom-4 z-[1190] mx-auto max-w-3xl" role="status" aria-live="polite">
        <div className="flex items-center gap-3 rounded-2xl bg-ink/95 p-3 pl-4 text-white shadow-md">
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tabular-nums">{step + 1}/{STEPS.length}</span>
          <p className="min-w-0 flex-1 text-[15px] font-medium leading-snug">{STEPS[step].caption}</p>
          {!last && (
            <>
              <button onClick={() => setPaused((x) => !x)} aria-label={paused ? "Resume" : "Pause"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
              <button onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))} aria-label="Skip to next step" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25"><SkipForward size={18} /></button>
            </>
          )}
          <button onClick={exit} aria-label="Exit auto demo (Esc)" className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-white/15"><X size={18} /></button>
        </div>
      </div>
    </>
  );
}
