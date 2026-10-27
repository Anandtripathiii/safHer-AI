"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, PhoneCall, Radio, Siren, Timer, UsersRound, Wifi, WifiOff } from "lucide-react";
import { TYPE_ICON, TYPE_TINT } from "@/components/eventMeta";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { SafeEvent } from "@/lib/seed";
import { Switch } from "@/components/ui/switch";
import Coordination from "@/components/Coordination";
import { ago, cn, fmtClock } from "@/lib/utils";
import { useNow } from "@/lib/hooks";

// Seeded last-7-days delivery rates per channel (%). Weak network drops push/in-app hard; SMS holds up.
const CHANNELS = {
  normal: [
    { name: "SMS", rate: 99, days: [98, 99, 100, 99, 97, 99, 100], note: "Fallback channel" },
    { name: "Push", rate: 95, days: [93, 96, 94, 97, 95, 92, 96], note: "Primary" },
    { name: "In-app", rate: 97, days: [96, 98, 97, 99, 95, 97, 98], note: "When the app is open" },
  ],
  weak: [
    { name: "SMS", rate: 96, days: [98, 99, 100, 99, 97, 99, 88], note: "Taking over as fallback" },
    { name: "Push", rate: 41, days: [93, 96, 94, 97, 95, 92, 41], note: "3 queued · retrying" },
    { name: "In-app", rate: 22, days: [96, 98, 97, 99, 95, 97, 22], note: "4 queued · waiting for signal" },
  ],
};
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function Stat({ icon: I, label, value, hint, tone }: { icon: typeof Siren; label: string; value: string | number; hint: string; tone?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <I size={20} className={tone ?? "text-pink-strong"} />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

export default function Dashboard() {
  const { journey, events, contacts, weakNetwork, sos, risk, checkin, set, resolveSOS, respondRisk, answerCheckin } = useApp();
  const now = useNow(1000);
  const today = new Date(now).toDateString();
  const alertsToday = events.filter((e) => (e.type === "alert" || e.type === "sos") && new Date(e.ts).toDateString() === today).length + (risk ? 1 : 0);
  const channels = CHANNELS[weakNetwork ? "weak" : "normal"];
  const active = sos ? { title: `SOS active — ${sos.source}`, since: sos.startedAt, cancel: () => { resolveSOS(true); toast("False alarm cancelled", { description: "Contacts told you're safe." }); } }
    : risk ? { title: `Risk alert — ${risk.title} (${risk.score})`, since: risk.at, cancel: () => respondRisk("safe") }
    : checkin?.phase === "escalating" ? { title: "Missed check-in — escalation running", since: checkin.since, cancel: answerCheckin }
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-28 md:pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Emergency dashboard</h1>
          <p className="text-sm text-muted">Everything SafeHer is doing for you, live.</p>
        </div>
        <label className={cn("flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm", weakNetwork ? "border-warning bg-warning/15" : "border-line bg-surface")}>
          {weakNetwork ? <WifiOff size={18} className="text-[#9a6a0c] dark:text-warning" /> : <Wifi size={18} className="text-success" />}
          Weak network
          <Switch checked={weakNetwork} onCheckedChange={(v) => { set({ weakNetwork: v }); toast(v ? "Simulating weak network" : "Network back to normal", { description: v ? "New alerts will queue and fall back to SMS." : undefined }); }} />
        </label>
      </header>

      <AnimatePresence>
        {active && (
          <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex flex-wrap items-center gap-3 rounded-card border border-danger/30 bg-danger/10 p-4">
            <Siren size={20} className="text-danger" />
            <div className="flex-1">
              <p className="font-semibold">{active.title}</p>
              <p className="text-xs text-muted">Running for {fmtClock((now - active.since) / 1000)}</p>
            </div>
            <button className="btn-secondary h-10 text-sm" onClick={active.cancel}>Cancel false alarm</button>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Activity} label="Active journeys" value={journey ? 1 : 0} hint={journey ? `${Math.round(journey.progress * 100)}% complete` : "None right now"} />
        <Stat icon={AlertTriangle} label="Alerts today" value={alertsToday} hint="Risk alerts + SOS" tone="text-[#c48a1d]" />
        <Stat icon={UsersRound} label="Contacts on standby" value={contacts.length} hint={contacts.map((c) => c.name.split(" ")[0]).join(", ")} tone="text-success" />
        <Stat icon={Timer} label="Avg response time" value="52s" hint="First acknowledgement · last 30 days" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent activity</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted"><Radio size={14} className="text-danger" /> live</span>
          </div>
          <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-line">
            {events.slice(0, 10).map((e) => <TimelineItem key={e.id} e={e} now={now} />)}
          </ol>
        </section>

        <div className="space-y-6">
          {sos && <section className="card p-5"><Coordination /></section>}

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Delivery status</h2>
              <span className="text-xs text-muted">last 7 days</span>
            </div>
            <ul className="mt-4 space-y-5">
              {channels.map((c) => (
                <li key={c.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name} <span className="font-normal text-muted">· {c.note}</span></span>
                    <span className={cn("font-semibold tabular-nums", c.rate < 60 ? "text-danger" : "text-ink")}>{c.rate}%</span>
                  </div>
                  <div className="mt-2 flex h-12 items-end gap-1.5" role="img" aria-label={`${c.name} delivery rate by day`}>
                    {c.days.map((d, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <motion.div className={cn("w-full rounded-md", d < 60 ? "bg-danger/70" : i === 6 ? "bg-pink-strong" : "bg-pink-soft")} initial={false} animate={{ height: `${(d / 100) * 36}px` }} transition={{ duration: 0.25 }} />
                        <span className="text-[10px] text-muted">{DAYS[i]}</span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            {weakNetwork && <p className="mt-4 rounded-xl bg-warning/15 p-3 text-xs">Poor connectivity: 7 messages queued. SOS alerts automatically retry over SMS, which needs the least signal.</p>}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Standby contacts</h2>
            <ul className="mt-3 space-y-3">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white" style={{ background: c.color }}>{c.initials}</span>
                  <span className="flex-1 text-sm"><b className="font-medium">{c.name}</b> <span className="text-muted">· {c.escalation ? "escalation" : c.relation}</span></span>
                  <PhoneCall size={16} className="text-muted" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

function TimelineItem({ e, now }: { e: SafeEvent; now: number }) {
  const I = TYPE_ICON[e.type];
  return (
    <motion.li layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
      <span className={cn("relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full", TYPE_TINT[e.type])}><I size={18} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="text-sm font-medium">{e.title}</p>
          {e.status === "active" && <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">live</span>}
          {e.status === "false-alarm" && <span className="rounded-full bg-line px-1.5 py-0.5 text-[10px] font-semibold text-muted">false alarm</span>}
          {e.status === "escalated" && <span className="rounded-full bg-warning/25 px-1.5 py-0.5 text-[10px] font-semibold text-[#9a6a0c] dark:text-warning">escalated</span>}
        </div>
        <p className="text-xs text-muted">{e.detail}</p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted">{ago(e.ts, now)}</span>
    </motion.li>
  );
}

