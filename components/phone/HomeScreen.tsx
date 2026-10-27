"use client";
import { useMemo, useState } from "react";
import { BatteryCharging, Eye, Footprints, House, MapPin, Search, X } from "lucide-react";
import { usePhone, favouriteContacts, phonePosition } from "@/lib/phone-state";
import { LANDMARKS, type LatLng } from "@/lib/seed";
import { useNow } from "@/lib/hooks";
import { distM } from "@/lib/simulation";
import { cn } from "@/lib/utils";
import { BatteryBanner, LocationOffBanner } from "../SafetyBanners";
import { BatteryGlyph } from "../StatusBar";
import RouteSheet from "./RouteSheet";
import Logo from "../Logo";
import { Avatar, pbtn } from "./ui";

export default function HomeScreen() {
  const s = usePhone();
  const now = useNow(1000);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const locOn = s.locPerm === "once" || s.locPerm === "while";
  const here = phonePosition(s);

  const destinations = useMemo(() => [
    ...s.safePlaces.map((p) => ({ name: p.name, sub: LANDMARKS.find((l) => l.id === p.landmarkId)?.name ?? "Safe place", pos: p.pos, safe: true })),
    ...LANDMARKS.map((l) => ({ name: l.name, sub: l.area, pos: l.pos, safe: false })),
  ], [s.safePlaces]);
  const matches = destinations.filter((d) => `${d.name} ${d.sub}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  const pick = (d: { name: string; pos: LatLng }) => { s.set({ planTo: d }); setQ(""); setFocus(false); };
  const favs = favouriteContacts(s.favourites);

  return (
    <div className="space-y-4 px-4 pb-6 pt-1">
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold", locOn ? "bg-surface text-ink shadow-sm" : "bg-line text-muted")}>
          <MapPin size={15} className={locOn ? "text-pink-strong" : ""} />
          {locOn ? <>Delhi NCR • Updated {Math.max(1, Math.round((now - s.hereAt) / 1000))}s ago</> : "Location off"}
        </span>
        <Logo className="text-[20px]" />
      </div>

      {s.locPerm === "denied" && <LocationOffBanner action={<button className="text-[13px] underline" onClick={() => s.set({ locPerm: "unasked" })}>Fix</button>} />}
      <BatteryBanner level={s.battery} />

      <div className="relative">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          placeholder="Where to?"
          aria-label="Where to?"
          className="h-14 w-full rounded-2xl bg-surface pl-12 pr-10 text-[17px] font-medium shadow-sm outline-none ring-pink-strong placeholder:text-muted focus:ring-2"
        />
        {focus && <button aria-label="Close search" onClick={() => { setFocus(false); setQ(""); }} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted"><X size={18} /></button>}
        {focus && (
          <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-surface shadow-md ring-1 ring-line">
            {matches.map((d) => (
              <li key={d.name}>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => pick(d)} className="flex h-14 w-full items-center gap-3 px-4 text-left active:bg-pink-soft/50">
                  {d.safe ? <House size={20} className="text-pink-strong" /> : <MapPin size={20} className="text-muted" />}
                  <span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-medium">{d.name}</span><span className="block truncate text-[12px] text-muted">{d.sub}</span></span>
                  <span className="text-[12px] tabular-nums text-muted">{(distM(here, d.pos) / 1000).toFixed(1)} km</span>
                </button>
              </li>
            ))}
            {!matches.length && <li className="px-4 py-3 text-[14px] text-muted">No matching places in Delhi NCR sample data.</li>}
          </ul>
        )}
      </div>

      {s.journey ? (
        <button onClick={() => s.set({ tab: "map" })} className="flex w-full items-center gap-3 rounded-3xl bg-pink-strong p-4 text-left text-white active:brightness-95">
          <Eye size={24} />
          <span className="flex-1"><span className="block text-[16px] font-bold">On the way to {s.journey.destName}</span><span className="text-[14px] opacity-90">{Math.round(s.journey.progress * 100)}% · tap to see live route</span></span>
        </button>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {s.safePlaces.map((p) => (
            <button key={p.id} onClick={() => pick({ name: p.name, pos: p.pos })} className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-surface px-4 text-[15px] font-semibold shadow-sm active:bg-pink-soft/50">
              <House size={18} className="text-pink-strong" />{p.name}
            </button>
          ))}
        </div>
      )}

      <button onClick={s.beingFollowed} disabled={!!s.followed} className={cn(pbtn.danger, "h-[72px] flex-col gap-0 bg-[#3b1f33] disabled:opacity-70")}>
        <span className="flex items-center gap-2"><Footprints size={24} /> I'm being followed</span>
        <span className="text-[13px] font-medium opacity-80">{s.followed ? `Heading to ${s.followed.target}` : "Quietly alerts contacts · guides you to people"}</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-surface p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted"><BatteryCharging size={16} /> Battery</p>
          <p className={cn("mt-1 flex items-center gap-2 text-[28px] font-bold tabular-nums", s.battery < 10 ? "text-danger" : s.battery < 20 ? "text-[#b07a10]" : "")}>{s.battery}% <BatteryGlyph level={s.battery} className="h-4 w-8 text-ink" /></p>
          <p className="text-[12px] text-muted">{s.battery < 20 ? "Power saver on" : "Enough for ~5 h of tracking"}</p>
        </div>
        <div className="rounded-3xl bg-surface p-4 shadow-sm">
          <p className="text-[13px] font-medium text-muted">Favourites</p>
          {favs.length ? (
            <div className="mt-2 flex -space-x-2">{favs.map((c) => <Avatar key={c.id} initials={c.initials} color={c.color} size={36} className="ring-2 ring-surface" />)}</div>
          ) : (
            <button onClick={() => s.set({ tab: "contacts" })} className="mt-1 text-left text-[14px] font-semibold text-pink-strong">Pick who to alert first →</button>
          )}
          <p className="mt-2 text-[12px] text-muted">First in your SOS chain</p>
        </div>
      </div>

      <RouteSheet dest={s.planTo} onClose={() => s.set({ planTo: null })} />
    </div>
  );
}
