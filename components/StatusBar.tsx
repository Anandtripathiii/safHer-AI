"use client";
import { Moon, Navigation, Wifi, WifiOff } from "lucide-react";
import { usePhone } from "@/lib/phone-state";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export const istTime = (ts: number) => new Date(ts).toLocaleTimeString("en-GB", { timeZone: "Asia/Calcutta", hour: "2-digit", minute: "2-digit" });

export function BatteryGlyph({ level, className }: { level: number; className?: string }) {
  const color = level < 10 ? "#E5484D" : level < 20 ? "#F2B23D" : "currentColor";
  return (
    <svg viewBox="0 0 27 13" className={cn("h-[12px] w-[25px]", className)} aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <rect x="2" y="2" width={Math.max(1.5, (20 * level) / 100)} height="9" rx="2" fill={color} />
      <path d="M25 4.5v4c.8-.3 1.5-1 1.5-2s-.7-1.7-1.5-2Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

function Bars({ n }: { n: number }) {
  return (
    <span className="flex h-[11px] items-end gap-[2px]" aria-hidden>
      {[4, 6, 8, 11].map((h, i) => <span key={i} className="w-[3px] rounded-[1px] bg-current" style={{ height: h, opacity: i < n ? 1 : 0.25 }} />)}
    </span>
  );
}

/** iOS-style status bar. Everything here is driven by the Judge controls. */
export default function StatusBar({ light, onPull }: { light?: boolean; onPull?: () => void }) {
  const { battery, network, dnd, locPerm } = usePhone();
  const now = useNow(1000);
  const bars = network === "5G" ? 4 : network === "3G" ? 2 : 0;
  return (
    <button
      type="button"
      onClick={onPull}
      aria-label="Open notifications"
      className={cn("relative z-[60] flex h-[50px] w-full shrink-0 items-center justify-between px-8 pt-3 text-[15px] font-semibold", light ? "text-white" : "text-ink")}
    >
      {/* The clock differs from the build-time HTML by design; it re-renders every second. */}
      <span className="flex w-20 items-center gap-1 tabular-nums" suppressHydrationWarning>
        {istTime(now)}
        {(locPerm === "once" || locPerm === "while") && <Navigation size={11} className="fill-current" />}
      </span>
      <span className="flex w-24 items-center justify-end gap-1.5 text-[12px]">
        {dnd && <Moon size={12} className="fill-current" aria-label="Do not disturb" />}
        <Bars n={bars} />
        {network === "none" ? <span className="text-[11px] font-medium">No service</span> : <span>{network}</span>}
        {network === "none" ? <WifiOff size={14} /> : <Wifi size={14} strokeWidth={2.6} />}
        <span className="text-[12px] tabular-nums">{battery}</span>
        <BatteryGlyph level={battery} />
      </span>
    </button>
  );
}
