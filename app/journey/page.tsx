"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpDown, Clock, Flag, Footprints, Lightbulb, Map as MapIcon, Moon, PersonStanding, ShieldAlert, ShieldCheck, Timer, Zap } from "lucide-react";
import { toast } from "sonner";
import { journeyOptions, landmark, useApp } from "@/lib/store";
import { usePhone } from "@/lib/phone-state";
import { defaultRouteKind, densify, pointAt, type RouteKind, type RouteScore } from "@/lib/simulation";
import { useNow } from "@/lib/hooks";
import { cn, fmtClock } from "@/lib/utils";
import PlacePicker from "@/components/PlacePicker";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-pink-soft/20" /> });

/** After 7 PM (or the Judge "Night" toggle on /phone-demo) the Safer route becomes the default. */
const isNight = (ts: number) => { const h = new Date(ts).getHours(); return h >= 19 || h < 6; };

function Chips({ s }: { s: RouteScore }) {
  const tone = (v: number) => (v >= 70 ? "bg-success/15 text-success" : v >= 45 ? "bg-warning/20 text-[#7a5408] dark:text-warning" : "bg-danger/10 text-danger");
  const chip = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold";
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <span className={cn(chip, tone(s.lighting))} title="Lighting score"><Lightbulb size={12} />{s.lighting}</span>
      <span className={cn(chip, tone(s.footTraffic))} title="Foot traffic score"><Footprints size={12} />{s.footTraffic}</span>
      <span className={cn(chip, s.incidents30d <= 2 ? "bg-success/15 text-success" : "bg-danger/10 text-danger")} title="Incidents in the last 30 days"><ShieldAlert size={12} />{s.incidents30d} in 30d</span>
    </div>
  );
}

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export default function JourneyPage() {
  const { journey, contacts, zones, fallDetection, demoMode, startJourney, endJourney, set } = useApp();
  const now = useNow(1000);
  const [fromId, setFrom] = useState("hkm");
  const [toId, setTo] = useState("iiitd");
  const [arriveBy, setArriveBy] = useState("");
  const [notify, setNotify] = useState<string[]>(["mom", "priya"]);
  const [expanded, setExpanded] = useState(true);
  const judgeNight = usePhone((p) => p.night);
  const night = judgeNight || isNight(now);
  const [kind, setKind] = useState<RouteKind>("safer");
  useEffect(() => setKind(defaultRouteKind(night)), [night, fromId, toId]);

  useEffect(() => {
    const to = new URLSearchParams(window.location.search).get("to");
    if (to && to !== "hkm") setTo(to);
  }, []);

  const options = useMemo(() => journeyOptions(fromId, toId, night), [fromId, toId, night]);
  const preview = { route: options[kind].route, eta: options[kind].minutes };
  useEffect(() => setArriveBy(hhmm(new Date(Date.now() + (preview.eta + 5) * 60000))), [preview.eta]);

  const route = journey?.route ?? preview.route;
  const me = journey ? pointAt(journey.route, journey.progress) : landmark(fromId).pos;
  const dest = landmark(journey?.toId ?? toId);
  const fit = useMemo(() => densify(route, 2), [route]);

  const start = () => {
    if (!notify.length) return toast.error("Pick at least one person to notify");
    startJourney({ fromId, toId, arriveBy, notify, kind });
    toast.success("Journey started", { description: `Sharing live location with ${contacts.filter((c) => notify.includes(c.id)).map((c) => c.name).join(", ")}` });
  };

  return (
    <main className="fixed inset-0">
      <LiveMap
        routes={journey
          ? [{ id: "r", points: route, color: "#E195AB", active: true }]
          : (["fastest", "safer"] as RouteKind[]).map((k) => ({ id: k, points: options[k].route, color: k === "safer" ? "#E195AB" : "#7FA7E0", active: kind === k, dashed: kind !== k, onClick: () => setKind(k), label: `${k === "safer" ? "Safer" : "Fastest"} · ${options[k].minutes} min` }))}
        me={me} destination={dest.pos} zones={zones} fitTo={fit} padTop={120}
      />

      <motion.section
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 z-[900] mx-auto max-h-[78vh] max-w-lg overflow-y-auto rounded-t-3xl border border-line/70 bg-surface px-5 pb-24 pt-3 shadow-md md:bottom-6 md:left-6 md:right-auto md:max-h-[calc(100vh-128px)] md:w-[460px] md:rounded-3xl md:pb-5"
      >
        <button onClick={() => setExpanded(!expanded)} className="mx-auto block h-6 w-full" aria-label={expanded ? "Collapse panel" : "Expand panel"}>
          <span className="mx-auto block h-1.5 w-12 rounded-full bg-line" />
        </button>

        {!journey ? (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Plan a safe journey</h1>
              <span className="rounded-full bg-pink-soft/60 px-2.5 py-1 text-xs font-medium">~{preview.eta} min</span>
            </div>
            {expanded && (
              <div className="mt-4 space-y-4">
                <div className="relative space-y-3">
                  <PlacePicker label="From" value={fromId} onChange={setFrom} exclude={toId} />
                  <button onClick={() => { setFrom(toId); setTo(fromId); }} aria-label="Swap from and to" className="absolute right-2 top-[60px] z-10 grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-muted hover:text-ink">
                    <ArrowUpDown size={16} />
                  </button>
                  <PlacePicker label="To" value={toId} onChange={setTo} exclude={fromId} />
                </div>
                <fieldset>
                  <legend className="flex w-full items-center justify-between">
                    <span className="label">Route</span>
                    {night && <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-surface"><Moon size={12} />Night routing</span>}
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["fastest", "safer"] as RouteKind[]).map((k) => {
                      const o = options[k];
                      const on = kind === k;
                      return (
                        <button key={k} type="button" aria-pressed={on} onClick={() => setKind(k)}
                          className={cn("rounded-2xl border-2 p-3 text-left transition", on ? "border-pink-strong bg-pink-soft/40" : "border-line hover:bg-bg")}>
                          <span className="flex items-center gap-1.5 text-sm font-semibold">
                            {k === "fastest" ? <Zap size={16} className="text-[#5d86c9]" /> : <ShieldCheck size={16} className="text-pink-strong" />}
                            {k === "fastest" ? `Fastest ${o.minutes} min` : `Safer ${o.minutes} min`}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{k === "safer" ? "Well-lit, more foot traffic" : "Shortest way there"}</span>
                          {o.warning && <span className="mt-1.5 flex items-start gap-1 rounded-lg bg-danger/10 px-1.5 py-1 text-[11px] font-semibold leading-tight text-danger"><AlertTriangle size={12} className="mt-px shrink-0" />{o.warning}</span>}
                          <Chips s={o} />
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted">Scores from sample data — verify with local sources.</p>
                </fieldset>
                <div>
                  <label htmlFor="arrive" className="label">Expected arrival</label>
                  <input id="arrive" type="time" className="input mt-1.5" value={arriveBy} onChange={(e) => setArriveBy(e.target.value)} />
                </div>
                <fieldset>
                  <legend className="label">Who should know?</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {contacts.map((c) => {
                      const on = notify.includes(c.id);
                      return (
                        <button key={c.id} type="button" aria-pressed={on} onClick={() => setNotify(on ? notify.filter((x) => x !== c.id) : [...notify, c.id])}
                          className={cn("chip border", on ? "border-pink-strong bg-pink-soft" : "border-transparent bg-bg")}>
                          <span className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: c.color }}>{c.initials}</span>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            )}
            <button className="btn-primary mt-5 w-full" onClick={start}><ShieldCheck size={20} /> Start journey</button>
            <p className="mt-3 text-center text-xs text-muted">We'll check in every 2 minutes. {demoMode && "Demo mode: trip runs 10× faster."}</p>
          </>
        ) : (
          <ActiveJourney now={now} expanded={expanded} onFall={() => set({ fall: { since: Date.now() } })} fallDetection={fallDetection} onEnd={(arrived) => { endJourney(arrived); toast(arrived ? "Marked as arrived" : "Journey ended"); }} />
        )}
      </motion.section>
    </main>
  );
}

function ActiveJourney({ now, expanded, fallDetection, onFall, onEnd }: { now: number; expanded: boolean; fallDetection: boolean; onFall: () => void; onEnd: (arrived: boolean) => void }) {
  const { journey, contacts, demoMode } = useApp();
  if (!journey) return null;
  const pct = Math.round(journey.progress * 100);
  const left = Math.max(0, Math.ceil(journey.etaMin * (1 - journey.progress) / (demoMode ? 10 : 1)));
  const notifyList = contacts.filter((c) => journey.notify.includes(c.id));
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Journey in progress
          </p>
          <h1 className="mt-1 truncate text-lg font-semibold">{landmark(journey.fromId).name} → {landmark(journey.toId).name}</h1>
        </div>
        <span className="shrink-0 text-2xl font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line/70" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full rounded-full bg-pink-strong" animate={{ width: `${pct}%` }} transition={{ duration: 0.25 }} />
      </div>
      {expanded && (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Timer, label: "Time left", value: `${left} min` },
              { icon: Flag, label: "Arrive by", value: journey.arriveBy },
              { icon: Clock, label: "Next check-in", value: fmtClock((journey.nextCheckinAt - now) / 1000) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-bg px-2 py-3">
                <s.icon size={18} className="mx-auto text-pink-strong" />
                <dd className="mt-1 font-semibold tabular-nums">{s.value}</dd>
                <dt className="text-xs text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <div className="flex -space-x-1.5">
              {notifyList.map((c) => <span key={c.id} className="grid h-7 w-7 place-items-center rounded-full border-2 border-surface text-[10px] font-bold text-white" style={{ background: c.color }}>{c.initials}</span>)}
            </div>
            {notifyList.map((c) => c.name).join(", ")} can see your trip
          </div>
        </>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="btn-primary" onClick={() => onEnd(true)}>I've arrived</button>
        <button className="btn-secondary" onClick={() => onEnd(false)}>End journey</button>
      </div>
      <div className="mt-2 flex gap-2">
        <Link href="/map" className="btn-ghost h-10 flex-1 text-sm"><MapIcon size={18} /> Live map</Link>
        {fallDetection && <button className="btn-ghost h-10 flex-1 text-sm" onClick={onFall}><PersonStanding size={18} /> Simulate fall</button>}
      </div>
    </>
  );
}
