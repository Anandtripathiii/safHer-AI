"use client";
import { BatteryMedium, MapPin, Signal } from "lucide-react";
import { usePhone, type Network } from "@/lib/phone-state";
import { TELEPORTS, type TeleportKey } from "@/lib/seed";
import { distM } from "@/lib/simulation";
import { cn } from "@/lib/utils";

function Group({ icon: I, title, children }: { icon: typeof BatteryMedium; title: string; children: React.ReactNode }) {
  return (
    <section className="py-4 first:pt-0 last:pb-0">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted"><I size={16} className="text-pink-strong" />{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export const seg = (on: boolean) => cn("h-10 flex-1 rounded-full px-3 text-sm font-medium transition", on ? "bg-pink-strong text-white" : "bg-bg text-ink hover:bg-pink-soft/50");

function BatteryGroup() {
  const { battery, set } = usePhone();
  return (
    <Group icon={BatteryMedium} title="Battery">
      <div className="flex items-center gap-3">
        <input type="range" min={0} max={100} value={battery} onChange={(e) => set({ battery: +e.target.value })} aria-label="Battery level" className="h-2 flex-1 accent-[rgb(var(--pink-strong))]" />
        <span className={cn("w-12 text-right font-semibold tabular-nums", battery < 10 ? "text-danger" : battery < 20 ? "text-[#b07a10]" : "")}>{battery}%</span>
      </div>
      <p className="mt-1 text-xs text-muted">Below 20%: power-saver banner. Below 10%: last location auto-sends.</p>
    </Group>
  );
}

function LocationGroup() {
  const { here, journey, teleport } = usePhone();
  const keys = Object.keys(TELEPORTS) as TeleportKey[];
  const current = journey ? "" : keys.find((k) => distM(TELEPORTS[k].pos, here) < 30) ?? "";
  return (
    <Group icon={MapPin} title="Location">
      <select value={current} onChange={(e) => e.target.value && teleport(e.target.value as TeleportKey)} aria-label="Teleport phone to" className="input h-10 text-sm">
        <option value="">{journey ? "Moving along a journey…" : "Choose a place…"}</option>
        {keys.map((k) => <option key={k} value={k}>{TELEPORTS[k].label} — {TELEPORTS[k].note}</option>)}
      </select>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {(["home", "college", "market", "metro"] as TeleportKey[]).map((k) => (
          <button key={k} onClick={() => teleport(k)} className={seg(current === k)}>Teleport to {TELEPORTS[k].label}</button>
        ))}
      </div>
    </Group>
  );
}

function NetworkGroup() {
  const { network, set } = usePhone();
  const opts: [Network, string][] = [["5G", "5G"], ["3G", "3G"], ["none", "No signal"]];
  return (
    <Group icon={Signal} title="Network">
      <div className="flex gap-1.5">{opts.map(([v, l]) => <button key={v} onClick={() => set({ network: v })} className={seg(network === v)}>{l}</button>)}</div>
      <p className="mt-1 text-xs text-muted">{network === "5G" ? "Alerts go out by push instantly." : network === "3G" ? "Push is slow — SOS falls back to SMS." : "Alerts queue and send by SMS as soon as any bar returns."}</p>
    </Group>
  );
}

/** Right-hand panel on /phone-demo: every simulated state, grouped. */
export default function JudgeControls() {
  return (
    <aside className="card w-full max-w-sm divide-y divide-line/70 p-5 lg:sticky lg:top-28">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Judge controls</h2>
        <p className="text-sm text-muted">Change the phone's world. Everything is simulated.</p>
      </div>
      <BatteryGroup />
      <LocationGroup />
      <NetworkGroup />
    </aside>
  );
}
