"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Keyboard, Mic, MicOff, Smartphone, Vibrate } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { useHold, useNow } from "@/lib/hooks";
import { fmtClock } from "@/lib/utils";
import { Waveform } from "@/components/Overlays";
import { useCoordination, StatusPill } from "@/components/Coordination";
import { useT } from "@/lib/i18n";

type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };

export default function SosPage() {
  const { sos, safeWord, fireSOS, resolveSOS } = useApp();
  const now = useNow(1000);
  const coord = useCoordination();
  const tr = useT();
  const hold = useHold(() => fireSOS("Hold-to-confirm button"));
  const [shakeOn, setShakeOn] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [heard, setHeard] = useState("");

  // Shake: three hard jolts within 1.5 seconds.
  useEffect(() => {
    if (!shakeOn) return;
    let peaks: number[] = [];
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const g = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      if (g < 25) return;
      const t = Date.now();
      peaks = [...peaks.filter((x) => t - x < 1500), t];
      if (peaks.length >= 3) { peaks = []; fireSOS("Shake gesture"); }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [shakeOn, fireSOS]);

  const enableShake = async () => {
    if (shakeOn) return setShakeOn(false);
    const DM = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
    if (!DM) return toast("Shake isn't available on this device", { description: "Use “Simulate shake” instead." });
    if (DM.requestPermission && (await DM.requestPermission().catch(() => "denied")) !== "granted") return toast.error("Motion permission was declined");
    setShakeOn(true);
    toast.success("Shake-to-SOS is on", { description: "Shake your phone hard three times." });
  };

  // Voice: listen for "help me" or the safe word while this screen is open.
  useEffect(() => {
    if (!voiceOn) return;
    const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) { toast("Voice SOS needs Chrome or Edge", { description: "Your browser doesn't support speech recognition." }); setVoiceOn(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    let alive = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ").toLowerCase();
      setHeard(text.slice(-60));
      if (text.includes("help me") || (safeWord && text.includes(safeWord.toLowerCase()))) { alive = false; rec.stop(); setVoiceOn(false); fireSOS("Voice — trigger phrase heard"); }
    };
    rec.onerror = (e) => { if (e.error === "not-allowed") { alive = false; setVoiceOn(false); toast.error("Microphone access was declined"); } };
    rec.onend = () => { if (alive) try { rec.start(); } catch {} };
    try { rec.start(); } catch {}
    return () => { alive = false; rec.stop(); };
  }, [voiceOn, safeWord, fireSOS]);

  const r = 118, c = 2 * Math.PI * r;

  return (
    <main className="min-h-dvh bg-[#120e18] px-5 pb-32 pt-28 text-white md:pb-16">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {!sos ? (
          <>
            <h1 className="text-center text-2xl font-semibold">{tr("holdSos")}</h1>
            <p className="mt-2 text-center text-sm text-white/60">Your trusted contacts get your live location. Release to cancel.</p>

            <div className="relative mt-10 grid h-[272px] w-[272px] place-items-center">
              <motion.span className="absolute inset-6 rounded-full bg-danger/25" animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
              <svg width="272" height="272" className="absolute -rotate-90">
                <circle cx="136" cy="136" r={r} fill="none" stroke="rgb(255 255 255 / .08)" strokeWidth="10" />
                <circle cx="136" cy="136" r={r} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - hold.p)} />
              </svg>
              <motion.button
                onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); hold.down(); }}
                onPointerUp={hold.up}
                onPointerCancel={hold.up}
                onPointerLeave={hold.up}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); hold.down(); } }}
                onKeyUp={hold.up}
                onContextMenu={(e) => e.preventDefault()}
                animate={{ scale: hold.p > 0 ? 0.96 : 1 }}
                className="relative grid h-[210px] w-[210px] touch-none select-none place-items-center rounded-full bg-danger text-white shadow-[0_0_0_10px_rgb(217_55_92/0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                aria-label="Send SOS. Press and hold for 2 seconds."
              >
                <span className="text-center">
                  <span className="block text-5xl font-bold tracking-wider">SOS</span>
                  <span className="mt-1 block text-sm tabular-nums text-white/80">{hold.p > 0 ? `${((1 - hold.p) * 2).toFixed(1)}s` : "hold"}</span>
                </span>
              </motion.button>
            </div>

            <div className="mt-12 grid w-full gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4">
                <Vibrate size={20} className="text-pink-soft" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Shake to SOS</p>
                  <p className="text-xs text-white/50">{shakeOn ? "Listening for three hard shakes" : "Off"}</p>
                </div>
                <button onClick={enableShake} className="rounded-full border border-white/20 px-3 py-1.5 text-xs">{shakeOn ? "Turn off" : "Turn on"}</button>
                <button onClick={() => fireSOS("Shake gesture (simulated)")} className="rounded-full bg-white/10 px-3 py-1.5 text-xs">Simulate shake</button>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4">
                {voiceOn ? <Mic size={20} className="text-danger" /> : <MicOff size={20} className="text-pink-soft" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Voice SOS</p>
                  <p className="truncate text-xs text-white/50">{voiceOn ? (heard ? `Heard: “${heard}”` : `Say “help me” or “${safeWord}”`) : "Off · mic only used on this screen"}</p>
                </div>
                {voiceOn && <Waveform bars={8} className="h-5 text-danger" />}
                <button onClick={() => setVoiceOn(!voiceOn)} className="rounded-full border border-white/20 px-3 py-1.5 text-xs">{voiceOn ? "Stop" : "Listen"}</button>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 text-sm">
                <Keyboard size={20} className="text-pink-soft" />
                <span className="flex-1">From any page</span>
                <kbd className="rounded-lg bg-white/10 px-2 py-1 text-xs">Ctrl + Shift + S</kbd>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-white/40">Prototype: alerts go to sample contacts only. For real emergencies dial 112.</p>
          </>
        ) : (
          <>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid h-40 w-40 place-items-center rounded-full bg-danger">
              <span className="text-4xl font-bold">SOS</span>
            </motion.div>
            <h1 className="mt-6 text-2xl font-semibold">{tr("alertSentTitle")}</h1>
            <p className="mt-1 text-sm text-white/60">Started {fmtClock((now - sos.startedAt) / 1000)} ago · {sos.source}</p>
            <div className="mt-6 flex items-center gap-3 rounded-full bg-white/[0.08] px-4 py-2 text-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" /> Recording evidence {fmtClock((now - sos.startedAt) / 1000)}
              <Waveform bars={14} className="h-5 text-white/70" />
            </div>
            <ul className="mt-8 w-full space-y-2">
              {coord?.rows.map((ct) => (
                <li key={ct.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold" style={{ background: ct.color }}>{ct.initials}</span>
                  <span className="flex-1 text-sm">{ct.name}</span>
                  <StatusPill s={coord.status[ct.id] ?? "pending"} />
                </li>
              ))}
            </ul>
            <div className="mt-8 grid w-full gap-2">
              <Link href="/map" className="btn h-12 bg-white font-semibold text-[#120e18] hover:bg-white/90"><Smartphone size={18} /> {tr("openLiveTracking")}</Link>
              <button className="btn h-14 border border-white/25 text-lg font-bold text-white hover:bg-white/10" onClick={() => { resolveSOS(false); toast.success(tr("alertResolved"), { description: tr("recordingSaved") }); }}>{tr("imSafeNow")}</button>
              <button className="btn h-11 text-sm text-white/70 hover:bg-white/10" onClick={() => { resolveSOS(true); toast(tr("falseAlarmCancelled"), { description: tr("contactsToldSafe") }); }}>{tr("cancelFalseAlarm")}</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
