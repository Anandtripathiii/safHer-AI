"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Footprints, Lightbulb, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { usePhone, phonePosition } from "@/lib/phone-state";
import { defaultRouteKind, etaMinutes, routeScores, routesFor, type RouteKind } from "@/lib/simulation";
import type { LatLng } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { PSheet, pbtn } from "./ui";

export function ScoreChips({ s }: { s: ReturnType<typeof routeScores> }) {
  const chip = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium";
  const tone = (v: number) => (v >= 70 ? "bg-success/15 text-success" : v >= 45 ? "bg-warning/20 text-[#7a5408]" : "bg-danger/10 text-danger");
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <span className={cn(chip, tone(s.lighting))}><Lightbulb size={14} />Light {s.lighting}</span>
      <span className={cn(chip, tone(s.footTraffic))}><Footprints size={14} />People {s.footTraffic}</span>
      <span className={cn(chip, s.incidents30d <= 2 ? "bg-success/15 text-success" : "bg-danger/10 text-danger")}><ShieldAlert size={14} />{s.incidents30d} incidents · 30d</span>
    </div>
  );
}

/** "Plan your journey to X": Fastest vs Safer, then Start Safe Journey. */
export default function RouteSheet({ dest, onClose }: { dest: { name: string; pos: LatLng } | null; onClose: () => void }) {
  const s = usePhone();
  const [kind, setKind] = useState<RouteKind>(defaultRouteKind(s.night));
  useEffect(() => setKind(defaultRouteKind(s.night)), [s.night, dest?.name]);

  const scores = useMemo(() => {
    if (!dest) return null;
    const r = routesFor(phonePosition(s), dest.pos);
    const fast = etaMinutes(r.fastest);
    return { fastest: routeScores("fastest", s.night, fast), safer: routeScores("safer", s.night, fast) };
  }, [dest, s.night, s.here, s.journey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PSheet open={!!dest} onClose={onClose}>
      {dest && scores && (
        <>
          <h2 className="text-[20px] font-bold leading-tight">Plan your journey to {dest.name}</h2>
          <p className="mt-1 text-[14px] text-muted">{s.night ? "Night mode: we're favouring well-lit streets." : "Daytime: both routes are reasonable."}</p>
          <div className="mt-4 space-y-3">
            {(["fastest", "safer"] as RouteKind[]).map((k) => {
              const sc = scores[k];
              const on = kind === k;
              return (
                <button key={k} onClick={() => setKind(k)} aria-pressed={on}
                  className={cn("w-full rounded-3xl border-2 p-4 text-left active:scale-[0.99]", on ? "border-pink-strong bg-pink-soft/40" : "border-line bg-surface")}>
                  <div className="flex items-center gap-2">
                    {k === "fastest" ? <Zap size={20} className="text-[#5d86c9]" /> : <ShieldCheck size={20} className="text-pink-strong" />}
                    <span className="text-[17px] font-bold">{k === "fastest" ? `Fastest ${sc.minutes} min` : `Safer ${sc.minutes} min`}</span>
                    {k === defaultRouteKind(s.night) && <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-surface">Suggested</span>}
                  </div>
                  {k === "safer" && <p className="mt-1 text-[14px] text-muted">Well-lit, more foot traffic · {sc.helpPoints} help points</p>}
                  {sc.warning && <p className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-danger"><AlertTriangle size={16} />{sc.warning}</p>}
                  <ScoreChips s={sc} />
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[12px] text-muted">Based on sample data — verify with local sources.</p>
          <button className={cn(pbtn.primary, "mt-3 h-16 text-[18px]")} onClick={() => { s.startJourney(dest.name, dest.pos, kind); onClose(); }}>
            Start Safe Journey
          </button>
        </>
      )}
    </PSheet>
  );
}
