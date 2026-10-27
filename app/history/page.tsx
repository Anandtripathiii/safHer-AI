"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Lock, LockOpen, Mic } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { EventType, SafeEvent } from "@/lib/seed";
import { TYPE_ICON, TYPE_TINT } from "@/components/eventMeta";
import { Waveform } from "@/components/Overlays";
import { cn, fmtClock, fmtDate, fmtTime } from "@/lib/utils";
import { useMounted } from "@/lib/hooks";

const TYPES: { id: EventType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "journey", label: "Journeys" },
  { id: "alert", label: "Alerts" },
  { id: "sos", label: "SOS" },
  { id: "checkin", label: "Check-ins" },
  { id: "zone", label: "Safe zones" },
  { id: "fall", label: "Falls" },
];
const STATUS_CLS: Record<string, string> = {
  completed: "bg-success/15 text-success",
  resolved: "bg-success/15 text-success",
  "false-alarm": "bg-line text-muted",
  escalated: "bg-warning/25 text-[#9a6a0c] dark:text-warning",
  active: "bg-danger text-white",
  cancelled: "bg-line text-muted",
};
const monthKey = (ts: number) => new Date(ts).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export default function HistoryPage() {
  const { events, evidence, safeWord, contacts, weakNetwork } = useApp();
  const [making, setMaking] = useState<string | null>(null);
  // Absolute times depend on the visitor's clock and timezone; the page was pre-rendered on a UTC machine.
  const mounted = useMounted();
  const when = (ts: number, sep: string) => (mounted ? `${fmtDate(ts)}${sep}${fmtTime(ts)}` : "");

  const policeReport = async (e: SafeEvent) => {
    setMaking(e.id);
    try {
      // Recording length comes from the matching Evidence Vault entry when there is one.
      const ev = evidence.find((x) => Math.abs(x.ts - e.ts) < 5000);
      const { downloadPoliceReport } = await import("@/lib/police-report");
      const r = await downloadPoliceReport({ event: e, durationSec: ev?.durationSec ?? 60, contacts, network: weakNetwork ? "weak" : "good" });
      toast.success(`Report ${r.reportNo} downloaded`, { description: "Sample document — review it before using it for a real complaint." });
    } catch {
      toast.error("Couldn't create the report. Please try again.");
    } finally {
      setMaking(null);
    }
  };
  const [type, setType] = useState<EventType | "all">("all");
  const [month, setMonth] = useState("all");
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [word, setWord] = useState("");
  const [open, setOpen] = useState<string[]>([]);

  const months = useMemo(() => [...new Set(events.map((e) => monthKey(e.ts)))], [events]);
  const shown = events.filter((e) => (type === "all" || e.type === type) && (month === "all" || monthKey(e.ts) === month));

  const unlock = (id: string) => {
    if (word.trim().toLowerCase() !== safeWord.toLowerCase()) return toast.error("That's not your safe word");
    setOpen([...open, id]);
    setUnlocking(null);
    setWord("");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-32 pt-28 md:pb-16">
      <h1 className="text-2xl font-semibold">Safety history</h1>
      <p className="mt-1 text-sm text-muted">Every journey, alert and SOS — with who was told.</p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-semibold"><Lock size={18} className="text-pink-strong" /> Evidence vault</h2>
        <p className="text-sm text-muted">Recordings made automatically during an SOS. Opens only with your safe word.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {evidence.map((ev) => {
            const isOpen = open.includes(ev.id);
            return (
              <div key={ev.id} className={cn("rounded-card p-4", isOpen ? "bg-surface shadow-sm" : "bg-[#1d1726] text-white")}>
                <div className="flex items-center gap-3">
                  <span className={cn("grid h-10 w-10 place-items-center rounded-xl", isOpen ? "bg-pink-soft text-pink-strong" : "bg-white/10")}>
                    {isOpen ? <Mic size={20} /> : <Lock size={20} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Audio · {fmtClock(ev.durationSec)}</p>
                    <p className={cn("truncate text-xs", isOpen ? "text-muted" : "text-white/60")}>{when(ev.ts, ", ")} · {ev.source}</p>
                  </div>
                </div>
                {isOpen ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                    <Waveform bars={32} className="h-10 text-pink-strong" />
                    <p className="mt-2 text-xs text-muted">Encrypted on this device · sample recording, no real audio was captured.</p>
                  </motion.div>
                ) : unlocking === ev.id ? (
                  <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); unlock(ev.id); }}>
                    <input autoFocus type="password" value={word} onChange={(e) => setWord(e.target.value)} placeholder="Safe word" aria-label="Safe word"
                      className="h-10 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-pink-strong" />
                    <button className="btn-primary h-10 px-4 text-sm">Unlock</button>
                  </form>
                ) : (
                  <button onClick={() => { setUnlocking(ev.id); setWord(""); }} className="mt-4 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                    <LockOpen size={16} /> Unlock with safe word
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">Hint for the demo: the safe word is set in Settings → Safety.</p>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => setType(t.id)} className={cn("chip shrink-0", type === t.id ? "bg-pink-strong text-white hover:bg-pink-strong" : "bg-surface")}>{t.label}</button>
            ))}
          </div>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="input h-9 w-auto rounded-full py-0 text-sm" aria-label="Filter by month">
            <option value="all">All months</option>
            {months.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
          {shown.map((e, i) => {
            const I = TYPE_ICON[e.type];
            return (
              <div key={e.id} className={cn("grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 p-4 sm:grid-cols-[auto_1fr_auto]", i > 0 && "border-t border-line")}>
                <span className={cn("row-span-2 grid h-9 w-9 place-items-center rounded-full", TYPE_TINT[e.type])}><I size={18} /></span>
                <div className="min-w-0">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted">{e.detail}</p>
                </div>
                <div className="col-start-2 flex flex-wrap items-center gap-2 text-xs sm:col-start-3 sm:row-span-2 sm:flex-col sm:items-end">
                  <span className="tabular-nums text-muted">{when(e.ts, " · ")}</span>
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold capitalize", STATUS_CLS[e.status])}>{e.status.replace("-", " ")}</span>
                </div>
                <p className="col-start-2 text-xs text-muted">{e.notified.length ? `Notified: ${e.notified.join(", ")}` : "No one was notified"}</p>
                {e.type === "sos" && e.status !== "active" && (
                  <button onClick={() => policeReport(e)} disabled={making === e.id} className="col-start-2 mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:bg-pink-soft/40 disabled:opacity-60">
                    {making === e.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} className="text-pink-strong" />} Police report (PDF)
                  </button>
                )}
              </div>
            );
          })}
          {!shown.length && <p className="p-6 text-center text-sm text-muted">Nothing for this filter. Try “All months”.</p>}
        </div>
      </section>
    </main>
  );
}
