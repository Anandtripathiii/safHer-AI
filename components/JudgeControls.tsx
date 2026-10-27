"use client";
import { BatteryMedium, Car, Clapperboard, EyeOff, KeyRound, MapPin, Moon, Route, Signal, Sun, BatteryWarning, House } from "lucide-react";
import { usePhone, type Network } from "@/lib/phone-state";
import { RISK_SCENARIOS, TELEPORTS, type TeleportKey } from "@/lib/seed";
import { useNow } from "@/lib/hooks";
import { fmtClock } from "@/lib/utils";
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

function TimeGroup() {
  const { night, set } = usePhone();
  return (
    <Group icon={night ? Moon : Sun} title="Time">
      <div className="flex gap-1.5">
        <button onClick={() => set({ night: false })} className={seg(!night)}><Sun size={16} className="mr-1 inline" />Day</button>
        <button onClick={() => set({ night: true })} className={seg(night)}><Moon size={16} className="mr-1 inline" />Night</button>
      </div>
      <p className="mt-1 text-xs text-muted">{night ? "Safer route is the default; Fastest shows a warning and its lighting/foot-traffic scores drop." : "Both routes are reasonable; Fastest is suggested."}</p>
    </Group>
  );
}

function PermissionsGroup() {
  const { locPerm, contactsPerm, resetPermissions, say } = usePhone();
  return (
    <Group icon={KeyRound} title="Permissions">
      <p className="text-sm">Location: <b>{locPerm}</b> · Contacts: <b>{contactsPerm}</b></p>
      <button onClick={() => { resetPermissions(); say("Permissions reset — prompts will show again", "info"); }} className={cn(seg(false), "mt-2 w-full")}>Reset all prompts</button>
    </Group>
  );
}

/** Clears anything on screen so a scenario starts from a clean, visible app. */
const clean = { risk: null, cab: null, report: null, decoy: false, locked: false, minimized: false, minimizeAt: null, revealed: true, followed: null } as const;

function ScenarioGroup() {
  const s = usePhone();
  const now = useNow(1000);
  const home = s.safePlaces.find((p) => p.name === "Home") ?? s.safePlaces[0];
  const ensureLocation = () => (s.locPerm === "unasked" || s.locPerm === "denied" ? { locPerm: "while" as const, hereAt: Date.now() } : {});

  const scenarios: { label: string; hint: string; icon: typeof Route; run: () => void }[] = [
    {
      label: "Walk home at night", hint: "Night + unsafe area + Safe Journey to Home", icon: Moon,
      run: () => {
        if (s.sos) s.resolveSOS();
        s.set({ ...clean, ...ensureLocation(), night: true, inside: [] });
        s.teleport("unsafe");
        s.startJourney(home.name, home.pos, "safer");
        s.say("Night walk started — Safer route chosen automatically", "info");
      },
    },
    {
      label: "Low battery emergency", hint: "Battery 8% + SOS", icon: BatteryWarning,
      run: () => { s.set({ ...clean, ...ensureLocation(), battery: 8 }); if (s.sos) s.resolveSOS(); setTimeout(() => usePhone.getState().fireSOS("Low battery emergency"), 50); },
    },
    {
      label: "Reach home safely", hint: "Teleport to Home → auto-minimise in 10s", icon: House,
      run: () => { s.set({ ...clean, ...ensureLocation(), inside: [], journey: null }); s.teleport("home"); },
    },
    {
      label: "Lost route", hint: "Triggers risk detection", icon: Route,
      run: () => { s.set({ ...clean, tab: s.journey ? "map" : s.tab, journey: s.journey ? { ...s.journey, flagged: true } : null }); s.set({ risk: { ...RISK_SCENARIOS[2], at: Date.now() }, pulse: s.pulse + 1 }); },
    },
    {
      label: "Took a cab", hint: "Sudden speed jump → number-plate scan", icon: Car,
      run: () => {
        s.set({ ...clean, ...ensureLocation() });
        if (!usePhone.getState().journey) s.startJourney("College", s.safePlaces.find((p) => p.name === "College")?.pos ?? TELEPORTS.college.pos, "fastest");
        const j = usePhone.getState().journey!;
        s.set({ journey: { ...j, inCab: true, cabChecked: false, startedAt: Date.now() } });
      },
    },
    {
      label: "Silent SOS", hint: "Same as holding the side button — nothing shows on the phone", icon: EyeOff,
      run: () => { s.set({ ...ensureLocation() }); s.fireSOS("Side button held", true); },
    },
  ];

  return (
    <Group icon={Clapperboard} title="Scenarios">
      <div className="grid gap-1.5">
        {scenarios.map((x) => (
          <button key={x.label} onClick={x.run} className="flex min-h-12 items-center gap-3 rounded-2xl border border-line px-3 py-2 text-left transition hover:bg-pink-soft/40 hover:shadow-sm">
            <x.icon size={20} className="shrink-0 text-pink-strong" />
            <span><span className="block text-sm font-semibold">{x.label}</span><span className="block text-xs text-muted">{x.hint}</span></span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-bg p-3 text-xs" aria-live="polite">
        <p className="font-semibold uppercase tracking-wider text-muted">Live state</p>
        <p className="mt-1">
          {s.sos ? <span className="font-semibold text-danger">{s.sos.silent ? "Silent SOS" : "SOS"} active · {fmtClock((now - s.sos.startedAt) / 1000)}{s.decoy ? " · decoy screen on (still recording)" : ""}</span> : "No SOS"}
          {" · "}{s.journey ? `Journey to ${s.journey.destName} ${Math.round(s.journey.progress * 100)}%${s.journey.inCab ? " (in cab)" : ""}` : "No journey"}
          {s.minimized && " · App minimised"}
          {s.followed && ` · Being-followed mode → ${s.followed.target}`}
        </p>
        {s.sos && <button onClick={s.resolveSOS} className="mt-2 font-semibold text-pink-strong underline-offset-2 hover:underline">End SOS</button>}
      </div>
    </Group>
  );
}

/** Right-hand panel on /phone-demo: every simulated state, grouped. */
export default function JudgeControls() {
  return (
    <aside className="card w-full divide-y divide-line/70 p-5">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Judge controls</h2>
        <p className="text-sm text-muted">Change the phone's world. Everything is simulated.</p>
      </div>
      <BatteryGroup />
      <LocationGroup />
      <NetworkGroup />
      <TimeGroup />
      <PermissionsGroup />
      <ScenarioGroup />
    </aside>
  );
}
