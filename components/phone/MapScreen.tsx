"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Car, Flag, Footprints, ShieldCheck, Zap } from "lucide-react";
import { usePhone, phonePosition } from "@/lib/phone-state";
import { densify } from "@/lib/simulation";
import { cn } from "@/lib/utils";
import { pbtn } from "./ui";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-pink-soft/20" /> });

export default function MapScreen() {
  const s = usePhone();
  const me = phonePosition(s);
  const j = s.journey;
  const zones = s.safePlaces.map((p) => ({ id: p.id, name: p.name, pos: p.pos, radius: p.radius }));
  const fit = useMemo(() => (j ? densify(j.route, 2) : [[me[0] - 0.006, me[1] - 0.006], [me[0] + 0.006, me[1] + 0.006]] as [number, number][]), [j?.route, j ? 0 : me[0], j ? 0 : me[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = j ? Math.max(0, Math.ceil(((1 - j.progress) * j.durationSec) / (j.inCab ? 3 : 1))) : 0;

  return (
    // isolate: keeps Leaflet's z-index 400+ panes below the phone's own overlays.
    <div className="relative isolate h-full">
      <LiveMap
        routes={j ? [{ id: "pj", points: j.route, color: j.kind === "safer" ? "#E195AB" : "#7FA7E0", active: true }] : []}
        me={me}
        destination={j?.destPos}
        zones={zones}
        fitTo={fit}
        padTop={40}
      />
      <div className="absolute inset-x-3 bottom-3 z-[500] rounded-3xl bg-surface p-4 shadow-md">
        {j ? (
          <>
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              {s.followed ? <span className="rounded-full bg-[#3b1f33] px-2 py-0.5 text-white">Being followed mode</span>
                : j.kind === "safer" ? <span className="flex items-center gap-1 text-pink-strong"><ShieldCheck size={16} />Safer route</span>
                : <span className="flex items-center gap-1 text-[#5d86c9]"><Zap size={16} />Fastest route</span>}
              {j.inCab && <span className="flex items-center gap-1 text-muted"><Car size={16} />in a vehicle</span>}
            </div>
            <p className="mt-1 flex items-center gap-2 text-[18px] font-bold"><Flag size={18} className="text-danger" />{j.destName}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-pink-strong transition-[width] duration-500" style={{ width: `${j.progress * 100}%` }} /></div>
            <p className="mt-2 text-[14px] text-muted">{Math.round(j.progress * 100)}% · arriving in ~{left}s (demo time) · shared with your favourites</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className={pbtn.secondary} onClick={() => { s.endJourney(true); s.say(`Marked as arrived at ${j.destName}`, "ok"); }}>I've arrived</button>
              <button className={cn(pbtn.secondary, "border-line")} onClick={() => s.endJourney(false)}>End trip</button>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-[17px] font-bold"><Footprints size={20} className="text-pink-strong" />{s.hereLabel}</p>
            <p className="mt-1 text-[14px] text-muted">Pink circles are your safe places. Pick a destination on Home to start a Safe Journey.</p>
            <button className={cn(pbtn.primary, "mt-3")} onClick={() => s.set({ tab: "home" })}>Where to?</button>
          </>
        )}
      </div>
    </div>
  );
}
