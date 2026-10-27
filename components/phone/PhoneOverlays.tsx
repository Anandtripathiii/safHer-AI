"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellOff, Camera, Car, CheckCircle2, Instagram, MessageCircle, ShieldHalf, X } from "lucide-react";
import { usePhone, favouriteContacts, phonePosition } from "@/lib/phone-state";
import { useApp } from "@/lib/store";
import { LANDMARKS } from "@/lib/seed";
import { calculate, REVEAL_CODE } from "@/lib/calc";
import { distM } from "@/lib/simulation";
import { useHold, useNow } from "@/lib/hooks";
import { ago, cn } from "@/lib/utils";
import { Ring, riskTone, TONE_PILL } from "../Overlays";
import StatusBar, { istTime } from "../StatusBar";
import { PSheet, pbtn } from "./ui";

const istDate = (ts: number) => new Date(ts).toLocaleDateString("en-IN", { timeZone: "Asia/Calcutta", weekday: "long", day: "numeric", month: "long" });

/** Disguise: a working calculator. Typing 911= opens SafeHer. */
export function DisguiseCalculator() {
  const { disguise, revealed, locked, minimized, set } = usePhone();
  const [st, setSt] = useState({ expr: "", shown: "0", reveal: false });
  useEffect(() => {
    if (!st.reveal) return;
    setSt({ expr: "", shown: "0", reveal: false });
    set({ revealed: true });
  }, [st.reveal, set]);
  if (!disguise || revealed || locked || minimized) return null;
  const shown = st.shown;

  // Functional updates so fast taps never read a stale display.
  const press = (k: string) => setSt((p) => {
    if (k === "C") return { expr: "", shown: "0", reveal: false };
    if (k === "=") {
      if (p.expr === REVEAL_CODE) return { ...p, reveal: true };
      const r = calculate(p.expr);
      if (r === null) return p;
      return Number.isNaN(r) ? { expr: "", shown: "Error", reveal: false } : { expr: String(r), shown: String(r), reveal: false };
    }
    const next = (p.expr === "" && /[+−×÷]/.test(k) ? p.shown : p.expr) + k;
    return { expr: next, shown: next, reveal: false };
  });
  const keys = ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "="];

  return (
    <div data-no-tripletap className="absolute inset-0 z-[74] flex flex-col bg-black text-white">
      <StatusBar light />
      <div className="flex flex-1 items-end justify-end px-7 pb-4 text-right text-[76px] font-light leading-none tabular-nums" aria-live="polite">
        <span className="max-w-full truncate">{shown}</span>
      </div>
      <div className="grid grid-cols-4 gap-3 px-5 pb-12">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => (k === "±" || k === "%" ? undefined : press(k))}
            className={cn(
              "grid h-[78px] place-items-center rounded-full text-[32px] active:brightness-125",
              k === "0" ? "col-span-2 justify-start pl-8" : "",
              /[÷×−+=]/.test(k) ? "bg-[#ff9f0a]" : /[C±%]/.test(k) ? "bg-[#a5a5a5] text-black" : "bg-[#333333]",
            )}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Screen off → lock screen with time, latest alerts and a hold-for-SOS button. */
export function LockScreen() {
  const { locked, notes, set, fireSOS } = usePhone();
  const [awake, setAwake] = useState(false);
  const now = useNow(1000);
  const hold = useHold(() => { set({ locked: false }); fireSOS("Lock screen SOS"); }, 2000);
  useEffect(() => { if (locked) setAwake(false); }, [locked]);
  if (!locked) return null;
  if (!awake) return <button aria-label="Screen off — tap to wake" onClick={() => setAwake(true)} className="absolute inset-0 z-[85] bg-black" />;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[85] flex flex-col bg-gradient-to-b from-[#2b2140] via-[#3a2442] to-[#1b1424] text-white">
      <StatusBar light />
      <div className="mt-8 text-center">
        <p className="text-[18px] font-medium text-white/80">{istDate(now)}</p>
        <p className="text-[84px] font-semibold leading-none tracking-tight tabular-nums">{istTime(now)}</p>
      </div>
      <div className="mt-8 space-y-2 px-4">
        {notes.slice(0, 2).map((n) => (
          <div key={n.id} className="flex gap-3 rounded-[20px] bg-white/15 p-3 backdrop-blur">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink-soft text-pink-strong"><ShieldHalf size={20} /></span>
            <span className="min-w-0 flex-1"><span className="flex justify-between text-[14px] font-semibold">SafeHer <span className="font-normal text-white/60">{ago(n.at, now)}</span></span><span className="block truncate text-[14px] text-white/85">{n.title} — {n.body}</span></span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-4 pb-12">
        <button
          onPointerDown={hold.down}
          onPointerUp={hold.up}
          onPointerLeave={hold.up}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Hold for SOS"
          className="relative grid h-24 w-24 touch-none select-none place-items-center rounded-full bg-danger text-[20px] font-black shadow-[0_0_0_8px_rgb(217_55_92/0.25)]"
        >
          <span className="absolute inset-0"><Ring value={hold.p} size={96} stroke={5} color="#fff" /></span>
          SOS
        </button>
        <p className="text-[14px] text-white/70">Hold SOS for 2s — no unlock needed</p>
        <button onClick={() => set({ locked: false })} className="h-14 rounded-full bg-white/15 px-8 text-[17px] font-semibold backdrop-blur active:bg-white/25">Tap to unlock</button>
      </div>
    </motion.div>
  );
}

/** Pull-down notifications. SafeHer alerts bypass Do Not Disturb; other apps don't. */
export function NotificationShade({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notes, dnd } = usePhone();
  const now = useNow(5000);
  const others = [
    { app: "WhatsApp", icon: MessageCircle, color: "#25D366", title: "Mom", body: "Reached? Call me once you're in the auto", at: now - 4 * 60000 },
    { app: "Instagram", icon: Instagram, color: "#E1306C", title: "priya.s", body: "liked your story", at: now - 23 * 60000 },
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(_, i) => i.offset.y < -60 && onClose()}
          className="absolute inset-0 z-[88] flex flex-col bg-[#120e18]/90 px-3 text-white backdrop-blur-md"
        >
          <div className="flex items-end justify-between px-3 pt-14">
            <div><p className="text-[44px] font-semibold leading-none tabular-nums">{istTime(now)}</p><p className="mt-1 text-[15px] text-white/70">{istDate(now)}</p></div>
            {dnd && <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold"><BellOff size={14} />Do Not Disturb</span>}
          </div>
          <div className="no-scrollbar mt-5 flex-1 space-y-2 overflow-y-auto pb-4">
            {notes.slice(0, 5).map((n) => (
              <div key={n.id} className="rounded-[20px] bg-white/15 p-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold"><span className="grid h-6 w-6 place-items-center rounded-md bg-pink-soft text-pink-strong"><ShieldHalf size={14} /></span>SafeHer<span className="ml-auto font-normal text-white/60">{ago(n.at, now)}</span></p>
                <p className="mt-1 text-[15px] font-semibold">{n.title}</p>
                <p className="text-[14px] text-white/80">{n.body}</p>
                {dnd && <p className="mt-1 text-[12px] font-semibold text-pink-soft">Delivered through Do Not Disturb</p>}
              </div>
            ))}
            {!notes.length && <p className="rounded-[20px] bg-white/10 p-3 text-[14px] text-white/70">No SafeHer alerts yet. Start a journey to see them here.</p>}
            {dnd ? (
              <p className="rounded-[20px] bg-white/10 p-3 text-[14px] text-white/70">{others.length} notifications from other apps silenced by Do Not Disturb</p>
            ) : others.map((o) => (
              <div key={o.app} className="rounded-[20px] bg-white/15 p-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold"><span className="grid h-6 w-6 place-items-center rounded-md text-white" style={{ background: o.color }}><o.icon size={14} /></span>{o.app}<span className="ml-auto font-normal text-white/60">{ago(o.at, now)}</span></p>
                <p className="mt-1 text-[15px]"><b>{o.title}</b> {o.body}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="mx-auto mb-6 h-12 rounded-full bg-white/15 px-6 text-[15px] font-semibold">Swipe up or tap to close</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PhoneRiskCard() {
  const { risk, set, fireSOS, journey, say } = usePhone();
  if (!risk) return null;
  const tone = riskTone(risk.score);
  const close = () => set({ risk: null });
  return (
    <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} role="alertdialog" aria-label={risk.title} className="absolute inset-x-3 top-[54px] z-[76] rounded-3xl bg-surface p-4 shadow-md ring-1 ring-line">
      <div className="flex items-start gap-3">
        <Ring value={risk.score / 100} size={60} color={`rgb(var(--${tone}))`}><span className="text-[18px] font-bold tabular-nums">{risk.score}</span></Ring>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold leading-tight">{risk.title}</p>
          <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold", TONE_PILL[tone])}>{risk.confidence} confidence</span>
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-snug text-muted">{risk.reason}</p>
      <div className="mt-3 grid gap-2">
        <button className={pbtn.danger} onClick={() => fireSOS(`Risk alert (score ${risk.score})`)}>Send SOS</button>
        <div className="grid grid-cols-2 gap-2">
          <button className={pbtn.secondary} onClick={() => { close(); say("Glad you're safe. Still watching quietly.", "ok"); }}>I'm safe</button>
          <button className={cn(pbtn.secondary, "border-line")} onClick={() => { close(); if (journey) set({ journey: { ...journey, flagged: true } }); }}>Keep watching</button>
        </div>
      </div>
    </motion.div>
  );
}

const PLATE = "DL 1C AB 4471";

/** Speed jump → "did you take a cab?" → mock camera → plate sent to a favourite. */
export function CabScan() {
  const { cab, set, favourites, note, say } = usePhone();
  const mainContacts = useApp((s) => s.contacts);
  const [flash, setFlash] = useState(false);
  const to = favouriteContacts(favourites)[0]?.name ?? mainContacts[0]?.name ?? "your contacts";
  useEffect(() => {
    if (cab?.phase !== "sent") return;
    const t = setTimeout(() => set({ cab: null }), 3500);
    return () => clearTimeout(t);
  }, [cab?.phase, set]);
  if (!cab) return null;

  if (cab.phase === "prompt") {
    return (
      <PSheet open onClose={() => set({ cab: null })}>
        <Car size={32} className="text-pink-strong" />
        <p className="mt-2 text-[20px] font-bold leading-tight">You're moving faster than walking — did you take a cab?</p>
        <p className="mt-1 text-[15px] text-muted">32 km/h detected. Scan the number plate and we'll send it to {to}.</p>
        <button className={cn(pbtn.primary, "mt-4 h-16")} onClick={() => set({ cab: { phase: "camera", at: Date.now() } })}><Camera size={22} /> Scan number plate</button>
        <button className={cn(pbtn.ghost, "mt-1")} onClick={() => set({ cab: null })}>No, I'm fine</button>
      </PSheet>
    );
  }
  if (cab.phase === "camera") {
    return (
      <div className="absolute inset-0 z-[86] flex flex-col bg-black text-white">
        <div className="flex items-center justify-between px-5 pt-14">
          <button aria-label="Close camera" onClick={() => set({ cab: null })} className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><X size={22} /></button>
          <span className="rounded-full bg-black/50 px-3 py-1 text-[13px] font-semibold">Point at the number plate</span>
          <span className="w-12" />
        </div>
        {/* Mock viewfinder: the rear of a cab under a streetlight. */}
        <div className="relative mx-4 mt-6 flex-1 overflow-hidden rounded-3xl bg-gradient-to-b from-[#1d2430] via-[#2a2f3a] to-[#14161b]">
          <div className="absolute left-1/2 top-[22%] h-40 w-64 -translate-x-1/2 rounded-t-[60px] bg-gradient-to-b from-[#f2c94c] to-[#c99a1e]" />
          <div className="absolute left-1/2 top-[44%] h-24 w-72 -translate-x-1/2 rounded-2xl bg-[#b8891a]" />
          <span className="absolute left-[18%] top-[47%] h-6 w-12 rounded bg-[#ff4d4d] shadow-[0_0_20px_#ff4d4d]" />
          <span className="absolute right-[18%] top-[47%] h-6 w-12 rounded bg-[#ff4d4d] shadow-[0_0_20px_#ff4d4d]" />
          <div className="absolute left-1/2 top-[52%] -translate-x-1/2 rounded-md border-2 border-black bg-white px-3 py-1 font-mono text-[22px] font-bold tracking-wider text-black">{PLATE}</div>
          <div className="absolute left-1/2 top-[49%] h-20 w-60 -translate-x-1/2 rounded-xl border-[3px] border-dashed border-white/80" />
          {flash && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 bg-white" />}
        </div>
        <div className="flex justify-center pb-12 pt-6">
          <button
            aria-label="Capture"
            onClick={() => {
              setFlash(true);
              setTimeout(() => {
                setFlash(false);
                set({ cab: { phase: "sent", at: Date.now() } });
                note("Cab details sent", `Plate ${PLATE} + photo sent to ${to}`);
                say(`Plate ${PLATE} sent to ${to}`, "ok");
              }, 380);
            }}
            className="grid h-[76px] w-[76px] place-items-center rounded-full border-4 border-white"
          >
            <span className="h-[60px] w-[60px] rounded-full bg-white active:scale-90" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <PSheet open onClose={() => set({ cab: null })}>
      <CheckCircle2 size={36} className="text-success" />
      <p className="mt-2 text-[20px] font-bold">Sent to {to}</p>
      <p className="mt-1 text-[15px] text-muted">Plate <b className="font-mono text-ink">{PLATE}</b>, photo, time and your live location.</p>
    </PSheet>
  );
}

/** One tap after a flagged journey. Uncomfortable/dangerous reports feed the Community page. */
export function IncidentReport() {
  const s = usePhone();
  const addPost = useApp((x) => x.addPost);
  if (!s.report) return null;
  const here = phonePosition(s);
  const near = [...LANDMARKS].sort((a, b) => distM(a.pos, here) - distM(b.pos, here))[0];
  const answer = (kind: "false" | "uncomfortable" | "dangerous") => {
    if (kind !== "false") {
      addPost({
        author: "Anonymous",
        area: near.name,
        tone: "negative",
        text: kind === "dangerous" ? `Felt in danger on the way to ${s.report!.destName}. Avoid this stretch after dark if you can.` : `Felt uncomfortable walking near here on the way to ${s.report!.destName} — stay alert.`,
      });
    }
    s.set({ report: null });
    s.say(kind === "false" ? "Thanks — we'll tune alerts for this route" : "Added anonymously to the community map. Thank you.", "ok");
  };
  return (
    <PSheet open onClose={() => s.set({ report: null })}>
      <p className="text-[20px] font-bold leading-tight">How was your journey to {s.report.destName}?</p>
      <p className="mt-1 text-[15px] text-muted">One tap. Reports are anonymous and help others near {near.name}.</p>
      <div className="mt-4 space-y-2">
        <button className={pbtn.secondary} onClick={() => answer("false")}>False alarm — all fine</button>
        <button className={cn(pbtn.secondary, "border-warning")} onClick={() => answer("uncomfortable")}>Uncomfortable</button>
        <button className={pbtn.danger} onClick={() => answer("dangerous")}>Dangerous</button>
      </div>
    </PSheet>
  );
}
