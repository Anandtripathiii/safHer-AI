"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Eye, Info, Lightbulb, MapPinned, ShieldAlert, Footprints, Radio } from "lucide-react";
import { toast } from "sonner";
import { landmark, useApp } from "@/lib/store";
import { HELP_POINTS, ROUTE_INFO, ROUTE_WAYPOINTS } from "@/lib/seed";
import { densify, lastViewedSec, pointAt } from "@/lib/simulation";
import { useNow } from "@/lib/hooks";
import { cn, fmtClock } from "@/lib/utils";
import Coordination from "@/components/Coordination";
import { HELP_KINDS } from "@/components/helpKinds";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-pink-soft/20" /> });

type RouteKey = keyof typeof ROUTE_INFO;
const COLORS: Record<RouteKey, string> = { fastest: "#7FA7E0", safer: "#E195AB" };

function Score({ icon: I, label, value, good }: { icon: typeof Lightbulb; label: string; value: string; good: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted"><I size={16} />{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-line/70">
        <div className={cn("h-full rounded-full", good >= 0.7 ? "bg-success" : good >= 0.45 ? "bg-warning" : "bg-danger")} style={{ width: `${Math.max(6, good * 100)}%` }} />
      </div>
    </div>
  );
}

export default function MapPage() {
  const { journey, sharing, sos, contacts, zones, stopSharing, startSharing } = useApp();
  const now = useNow(1000);
  const [sel, setSel] = useState<RouteKey>("safer");
  const [panel, setPanel] = useState(true);

  // Where the blue dot is: on the journey, or walking the Safer route while sharing.
  const shareElapsed = sharing ? (now - sharing.startedAt) / 1000 : 0;
  const me = journey ? pointAt(journey.route, journey.progress) : sharing ? pointAt(ROUTE_WAYPOINTS.safer, Math.min(1, shareElapsed / 240)) : ROUTE_WAYPOINTS.safer[0];
  const tracking = !!(journey || sharing);

  const routes = journey
    ? [{ id: "j", points: journey.route, color: COLORS.safer, active: true }]
    : (Object.keys(ROUTE_INFO) as RouteKey[]).map((k) => ({ id: k, points: ROUTE_WAYPOINTS[k], color: COLORS[k], active: sel === k, onClick: () => setSel(k), label: `${ROUTE_INFO[k].label} · ${ROUTE_INFO[k].minutes} min` }));
  const fit = useMemo(() => densify(journey?.route ?? [...ROUTE_WAYPOINTS.fastest, ...ROUTE_WAYPOINTS.safer], 1), [journey?.route]);
  const info = ROUTE_INFO[sel];
  const viewers = contacts.filter((c) => !c.escalation);
  const remaining = sharing ? sharing.minutes * 60 - shareElapsed : 0;

  return (
    <main className="fixed inset-0">
      <LiveMap routes={routes} me={me} destination={journey ? landmark(journey.toId).pos : ROUTE_WAYPOINTS.safer.at(-1)} zones={zones} fitTo={fit} padTop={sos ? 260 : 220} />

      {/* Route comparison — floats under the navbar when not on a trip. */}
      {!journey && !sos && (
        <section className="absolute inset-x-3 top-[92px] z-[900] mx-auto max-w-5xl md:right-auto md:w-[380px]">
          <div className="card p-4">
            <p className="text-xs text-muted">Hauz Khas Metro → IIIT-Delhi</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(ROUTE_INFO) as RouteKey[]).map((k) => (
                <button key={k} onClick={() => setSel(k)} aria-pressed={sel === k}
                  className={cn("rounded-2xl border-2 p-3 text-left transition", sel === k ? "border-pink-strong bg-pink-soft/40" : "border-line hover:bg-bg")}>
                  <span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[k] }} />{ROUTE_INFO[k].label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{ROUTE_INFO[k].minutes} min · {ROUTE_INFO[k].km} km</span>
                </button>
              ))}
            </div>
            {panel && (
              <motion.div key={sel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className="mt-4 space-y-3">
                <p className="text-sm">{sel === "safer" ? "Safer (15 min — well-lit, more foot traffic)" : "Fastest (12 min)"} — {info.note}</p>
                <Score icon={Lightbulb} label="Lighting" value={`${info.lighting}/100`} good={info.lighting / 100} />
                <Score icon={Footprints} label="Foot traffic" value={`${info.footTraffic}/100`} good={info.footTraffic / 100} />
                <Score icon={ShieldAlert} label="Past incidents (90 days)" value={`${info.incidents}`} good={1 - info.incidents / 8} />
                <Score icon={MapPinned} label="Help points nearby" value={`${info.helpPoints}`} good={info.helpPoints / 10} />
                <p className="flex gap-2 text-xs text-muted"><Info size={14} className="mt-0.5 shrink-0" /> Based on sample data — verify with local sources.</p>
                <Link href="/journey" className="btn-primary h-10 w-full text-sm">Start journey on this route</Link>
              </motion.div>
            )}
            <button onClick={() => setPanel(!panel)} className="mx-auto mt-2 flex items-center gap-1 text-xs text-muted">
              <ChevronUp size={14} className={cn("transition", !panel && "rotate-180")} /> {panel ? "Hide breakdown" : "Show breakdown"}
            </button>
          </div>
        </section>
      )}

      {/* Sharing + coordination panel */}
      <aside className={cn("absolute inset-x-0 bottom-0 z-[900] mx-auto max-h-[58vh] max-w-lg overflow-y-auto rounded-t-3xl border border-line/70 bg-surface p-5 pb-24 shadow-md md:inset-x-auto md:bottom-6 md:right-6 md:top-[96px] md:max-h-none md:w-[380px] md:rounded-3xl md:pb-5", sos && "md:top-[150px]", !tracking && "md:top-auto")}>
        {tracking ? (
          <>
            <div className="flex items-center justify-between">
              <h1 className="flex items-center gap-2 font-semibold"><Radio size={20} className="text-danger" /> Live location on</h1>
              <span className="text-sm tabular-nums text-muted">auto-stops in {fmtClock(remaining)}</span>
            </div>
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Shared with</h2>
            <ul className="mt-2 space-y-2">
              {viewers.map((c, i) => {
                const s = lastViewedSec(shareElapsed, i);
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <span className="relative grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white" style={{ background: c.color }}>
                      {c.initials}
                      {s < 4 && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />}
                    </span>
                    <span className="flex-1 text-sm font-medium">{c.name}</span>
                    <span className="flex items-center gap-1 text-xs tabular-nums text-muted"><Eye size={14} />{s < 4 ? "viewing now" : `last viewed ${s}s ago`}</span>
                  </li>
                );
              })}
            </ul>
            {sos && <Coordination className="mt-5 border-t border-line pt-4" />}
            <button className="btn-danger mt-5 w-full" onClick={() => { stopSharing(); toast("Location sharing stopped"); }} disabled={!!sos} title={sos ? "End the SOS first" : undefined}>
              Stop sharing
            </button>
            {sos && <p className="mt-2 text-center text-xs text-muted">Sharing stays on while an SOS is active.</p>}
          </>
        ) : (
          <>
            <h1 className="font-semibold">Help points nearby</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(HELP_KINDS).map(([k, v]) => (
                <span key={k} className="chip bg-bg"><v.icon size={14} style={{ color: v.color }} />{v.label} · {HELP_POINTS.filter((h) => h.kind === k).length}</span>
              ))}
            </div>
            <button className="btn-secondary mt-4 w-full" onClick={() => { startSharing(); toast.success("Sharing live location for 60 min"); }}>Share my live location</button>
          </>
        )}
      </aside>
    </main>
  );
}
