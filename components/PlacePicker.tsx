"use client";
import { useId, useState } from "react";
import { MapPin } from "lucide-react";
import { LANDMARKS } from "@/lib/seed";
import { cn } from "@/lib/utils";

/** Autocomplete over the seeded Delhi NCR landmarks. */
export default function PlacePicker({ label, value, onChange, exclude }: { label: string; value: string; onChange: (id: string) => void; exclude?: string }) {
  const id = useId();
  const current = LANDMARKS.find((l) => l.id === value);
  const [q, setQ] = useState<string | null>(null);
  const [hi, setHi] = useState(0);
  const query = q ?? "";
  const options = LANDMARKS.filter((l) => l.id !== exclude && `${l.name} ${l.area}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7);
  const pick = (lid: string) => { onChange(lid); setQ(null); };

  return (
    <div className="relative">
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative mt-1.5">
        <MapPin size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pink-strong" />
        <input
          id={id}
          role="combobox"
          aria-expanded={q !== null}
          aria-controls={`${id}-list`}
          autoComplete="off"
          className="input pl-10"
          value={q ?? current?.name ?? ""}
          placeholder="Search a place"
          onFocus={(e) => { setQ(""); setHi(0); e.target.select(); }}
          onBlur={() => setTimeout(() => setQ(null), 120)}
          onChange={(e) => { setQ(e.target.value); setHi(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(options.length - 1, h + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
            else if (e.key === "Enter" && options[hi]) { e.preventDefault(); pick(options[hi].id); (e.target as HTMLInputElement).blur(); }
            else if (e.key === "Escape") setQ(null);
          }}
        />
      </div>
      {q !== null && options.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-line bg-surface p-1 shadow-md">
          {options.map((l, i) => (
            <li key={l.id} role="option" aria-selected={i === hi}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(l.id)} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm", i === hi ? "bg-pink-soft/60" : "hover:bg-pink-soft/40")}>
                <span className="font-medium">{l.name}</span>
                <span className="text-xs text-muted">{l.area}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
