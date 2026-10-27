"use client";
import { useState } from "react";
import { MapPin, PhoneIncoming, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { LANDMARKS } from "@/lib/seed";
import { LANGS } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function Group({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="py-8 first:pt-0">
      <h2 className="text-lg font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-[15px] font-medium">{label}</p>{hint && <p className="text-sm text-muted">{hint}</p>}</div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const s = useApp();
  const [word, setWord] = useState(s.safeWord);
  const [zoneName, setZoneName] = useState("");
  const [zonePlace, setZonePlace] = useState("np");
  const [zoneRadius, setZoneRadius] = useState(300);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveWord = () => {
    if (word.trim().length < 3) return toast.error("Use at least 3 characters");
    s.set({ safeWord: word.trim() });
    toast.success("Safe word updated");
  };
  const addZone = () => {
    if (!zoneName.trim()) return toast.error("Give the zone a name, like “Gym” or “Nani's house”");
    s.addZone({ name: zoneName.trim(), pos: LANDMARKS.find((l) => l.id === zonePlace)!.pos, radius: zoneRadius });
    toast.success(`${zoneName.trim()} added`, { description: "It now shows on your map as a pink circle." });
    setZoneName("");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-28 md:pb-16">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="card mt-6 flex items-center gap-4 p-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink-soft to-pink-strong font-semibold text-white">AN</span>
        <div><p className="font-semibold">Anand Tripathi</p><p className="text-sm text-muted">Delhi NCR · sample profile, no login needed</p></div>
      </div>

      <div className="mt-6 divide-y divide-line/70">
        <Group title="Safety" desc="How SafeHer listens for trouble.">
          <div>
            <label htmlFor="sw" className="text-[15px] font-medium">Safe word</label>
            <p className="text-sm text-muted">Say it with Voice SOS on to send an alert. Also unlocks your Evidence Vault.</p>
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); saveWord(); }}>
              <input id="sw" className="input" value={word} onChange={(e) => setWord(e.target.value)} />
              <button className="btn-secondary shrink-0" disabled={word.trim() === s.safeWord}>Save</button>
            </form>
          </div>
          <Row label="Fall detection (beta)" hint="Asks “Are you okay?” after a sudden impact. Adds a “Simulate fall” button on Journey.">
            <Switch checked={s.fallDetection} onCheckedChange={(v) => s.set({ fallDetection: v })} aria-label="Fall detection" />
          </Row>
          <Row label="Simulate weak network" hint="Alerts queue and fall back to SMS.">
            <Switch checked={s.weakNetwork} onCheckedChange={(v) => s.set({ weakNetwork: v })} aria-label="Weak network" />
          </Row>
        </Group>

        <Group title="Safe zones" desc="Entering or leaving one during a journey tells your contacts automatically.">
          <ul className="space-y-2">
            {s.zones.map((z) => (
              <li key={z.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-sm">
                <span className="h-4 w-4 rounded-full border-2 border-pink-strong bg-pink-soft" />
                <span className="flex-1"><b className="font-medium">{z.name}</b> <span className="text-sm text-muted">· {z.radius} m radius</span></span>
                <button className="btn-ghost h-9 w-9 px-0 text-danger" aria-label={`Remove ${z.name}`} onClick={() => { s.removeZone(z.id); toast(`${z.name} removed`, { action: { label: "Undo", onClick: () => s.addZone(z) } }); }}><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
          <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]" onSubmit={(e) => { e.preventDefault(); addZone(); }}>
            <input className="input" placeholder="Zone name, e.g. Gym" value={zoneName} onChange={(e) => setZoneName(e.target.value)} aria-label="Zone name" />
            <div className="relative">
              <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pink-strong" />
              <select className="input pl-9" value={zonePlace} onChange={(e) => setZonePlace(e.target.value)} aria-label="Zone location">
                {LANDMARKS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <select className="input w-auto" value={zoneRadius} onChange={(e) => setZoneRadius(+e.target.value)} aria-label="Radius">
              {[200, 300, 500, 800].map((r) => <option key={r} value={r}>{r} m</option>)}
            </select>
            <button className="btn-primary">Add zone</button>
          </form>
        </Group>

        <Group title="Fake call" desc="A believable incoming call when you need a reason to leave.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="caller">Caller name</label><input id="caller" className="input mt-1.5" value={s.fakeCaller} onChange={(e) => s.set({ fakeCaller: e.target.value || "Mom" })} /></div>
            <div>
              <label className="label" htmlFor="delay">Ring after</label>
              <select id="delay" className="input mt-1.5" value={s.fakeCallDelay} onChange={(e) => s.set({ fakeCallDelay: +e.target.value })}>
                {[10, 30, 60].map((d) => <option key={d} value={d}>{d} seconds</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => { s.set({ fakeCallAt: Date.now() + s.fakeCallDelay * 1000 }); toast(`${s.fakeCaller} will call in ${s.fakeCallDelay} seconds`); }}><PhoneIncoming size={18} /> Schedule call</button>
            <button className="btn-ghost" onClick={() => s.set({ call: { phase: "ringing", since: Date.now() } })}>Ring now</button>
          </div>
        </Group>

        <Group title="Language & appearance">
          <Row label="Language" hint="Used by the Safety Assistant and navigation labels.">
            <select className="input w-auto" value={s.lang} onChange={(e) => s.set({ lang: e.target.value as typeof s.lang })} aria-label="Language">
              {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </Row>
          <Row label="Dark mode">
            <Switch checked={s.theme === "dark"} onCheckedChange={(v) => s.set({ theme: v ? "dark" : "light" })} aria-label="Dark mode" />
          </Row>
          <Row label="Demo mode" hint="Journeys run 10× faster and the presenter panel appears.">
            <Switch checked={s.demoMode} onCheckedChange={(v) => s.set({ demoMode: v })} aria-label="Demo mode" />
          </Row>
        </Group>

        <Group title="Demo data" desc="Everything is stored in this browser only.">
          <button
            className={cn(confirmReset ? "btn-danger" : "btn-secondary")}
            onClick={() => {
              if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); return; }
              s.reset();
              setWord("blue umbrella");
              setConfirmReset(false);
              toast.success("Demo data reset", { description: "Contacts, history and reports are back to the sample set." });
            }}
          >
            <RotateCcw size={18} /> {confirmReset ? "Tap again to reset everything" : "Reset & reseed demo data"}
          </button>
        </Group>
      </div>
    </main>
  );
}
