"use client";
import { useState } from "react";
import { Calculator, House, Lock, MapPin, Moon, Plus, RotateCcw, Trash2, BellOff } from "lucide-react";
import { usePhone } from "@/lib/phone-state";
import { LANDMARKS } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { FavouritesDialer } from "./ContactsScreen";
import { Avatar, pbtn } from "./ui";

function Row({ icon: I, label, hint, children }: { icon: typeof Moon; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[64px] items-center gap-3 px-4 py-2">
      <I size={22} className="shrink-0 text-pink-strong" />
      <span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold">{label}</span>{hint && <span className="block text-[13px] leading-snug text-muted">{hint}</span>}</span>
      {children}
    </div>
  );
}

/** Address autocomplete over the seeded Delhi NCR places. */
function AddSafePlace() {
  const { addSafePlace, say } = usePhone();
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<(typeof LANDMARKS)[number] | null>(null);
  const matches = q && !pick ? LANDMARKS.filter((l) => `${l.name} ${l.area}`.toLowerCase().includes(q.toLowerCase())).slice(0, 4) : [];
  const save = () => {
    if (!name.trim()) return say("Name the place, like “Gym” or “Nani's house”", "warn");
    if (!pick) return say("Pick an address from the list", "warn");
    addSafePlace({ name: name.trim(), landmarkId: pick.id, pos: pick.pos, radius: 250 });
    say(`${name.trim()} added as a safe place`, "ok");
    setName(""); setQ(""); setPick(null);
  };
  return (
    <div className="space-y-2 border-t border-line/70 p-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name, e.g. Gym" aria-label="Safe place name" className="h-12 w-full rounded-2xl bg-bg px-4 text-[16px] outline-none focus:ring-2 focus:ring-pink-strong" />
      <div className="relative">
        <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-strong" />
        <input value={pick ? pick.name : q} onChange={(e) => { setPick(null); setQ(e.target.value); }} placeholder="Search address in Delhi NCR" aria-label="Safe place address" className="h-12 w-full rounded-2xl bg-bg pl-11 pr-4 text-[16px] outline-none focus:ring-2 focus:ring-pink-strong" />
        {matches.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl bg-surface shadow-md ring-1 ring-line">
            {matches.map((l) => (
              <li key={l.id}><button onClick={() => { setPick(l); setQ(""); }} className="flex h-12 w-full items-center justify-between px-4 text-left text-[15px] active:bg-pink-soft/50"><span className="font-medium">{l.name}</span><span className="text-[12px] text-muted">{l.area}</span></button></li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={save} className={pbtn.secondary}><Plus size={20} /> Add safe place</button>
    </div>
  );
}

export default function ProfileScreen() {
  const s = usePhone();
  const permLabel = { unasked: "Not asked", asking: "Asking…", once: "Allowed once", while: "While using", granted: "Allowed", denied: "Denied" } as const;

  return (
    <div className="space-y-5 px-4 pb-6 pt-1">
      <div className="flex items-center gap-3 px-1">
        <Avatar initials="AN" color="#E195AB" size={56} />
        <div><p className="text-[20px] font-bold">Anand Tripathi</p><p className="text-[13px] text-muted">Delhi NCR · sample profile</p></div>
      </div>

      <section>
        <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wider text-muted">Safe places</h2>
        <div className="mt-2 overflow-hidden rounded-3xl bg-surface shadow-sm">
          {s.safePlaces.map((p, i) => (
            <div key={p.id} className={cn("flex min-h-[60px] items-center gap-3 pl-4 pr-1", i > 0 && "border-t border-line/70")}>
              <House size={22} className="text-pink-strong" />
              <span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold">{p.name}</span><span className="block truncate text-[13px] text-muted">{LANDMARKS.find((l) => l.id === p.landmarkId)?.name} · {p.radius} m</span></span>
              {s.inside.includes(p.id) && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[12px] font-semibold text-success">You're here</span>}
              <button aria-label={`Remove ${p.name}`} onClick={() => s.removeSafePlace(p.id)} className="grid h-12 w-12 place-items-center text-muted active:text-danger"><Trash2 size={20} /></button>
            </div>
          ))}
          <AddSafePlace />
        </div>
        <p className="mt-2 px-1 text-[13px] text-muted">Arriving at a safe place minimises SafeHer to save battery. Leaving brings it back.</p>
      </section>

      <FavouritesDialer />
      {!s.favourites.length && (
        <button onClick={() => s.set({ tab: "contacts" })} className={pbtn.secondary}>Choose favourite contacts</button>
      )}

      <section className="overflow-hidden rounded-3xl bg-surface shadow-sm">
        <Row icon={BellOff} label="Do Not Disturb" hint="SafeHer alerts always come through">
          <Switch checked={s.dnd} onCheckedChange={(v) => s.set({ dnd: v })} aria-label="Do not disturb" />
        </Row>
        <div className="border-t border-line/70" />
        <Row icon={Moon} label="Dark mode" hint="For this phone only">
          <Switch checked={s.osDark} onCheckedChange={(v) => s.set({ osDark: v })} aria-label="Phone dark mode" />
        </Row>
        <div className="border-t border-line/70" />
        <Row icon={Calculator} label="Disguise as Calculator" hint="Opens a real calculator. Type 911= to get to SafeHer.">
          <Switch checked={s.disguise} onCheckedChange={(v) => { s.set({ disguise: v, revealed: true }); if (v) s.say("Disguise on — lock or minimise to see it", "ok"); }} aria-label="Disguise as calculator" />
        </Row>
      </section>

      <section className="overflow-hidden rounded-3xl bg-surface shadow-sm">
        <Row icon={MapPin} label="Location" hint={permLabel[s.locPerm]}><span /></Row>
        <div className="border-t border-line/70" />
        <Row icon={RotateCcw} label="Contacts" hint={permLabel[s.contactsPerm]}>
          <button onClick={s.resetPermissions} className="h-11 rounded-full bg-bg px-4 text-[14px] font-semibold active:bg-pink-soft/50">Reset prompts</button>
        </Row>
      </section>

      <button onClick={() => s.set({ locked: true, revealed: false })} className={pbtn.secondary}><Lock size={20} /> Lock phone</button>
    </div>
  );
}
