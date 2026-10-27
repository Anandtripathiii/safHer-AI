"use client";
import { BatteryLow, BatteryWarning, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Same copy and thresholds on the phone demo and the website. */
export function BatteryBanner({ level, className }: { level: number; className?: string }) {
  if (level >= 20) return null;
  const critical = level < 10;
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold", critical ? "bg-danger text-white" : "bg-warning/25 text-[#7a5408]", className)}>
      {critical ? <BatteryWarning size={22} className="mt-0.5 shrink-0" /> : <BatteryLow size={22} className="mt-0.5 shrink-0" />}
      <span>{critical ? "Critical — SOS will auto-send your last location before shutdown" : "Low battery — switching to power saver"} <span className="font-normal opacity-80">({level}%)</span></span>
    </div>
  );
}

export function LocationOffBanner({ className, action }: { className?: string; action?: React.ReactNode }) {
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-2xl bg-danger/10 px-4 py-3 text-[15px] font-semibold text-danger", className)}>
      <MapPinOff size={22} className="mt-0.5 shrink-0" />
      <span className="flex-1">Location off — SOS cannot share your location.</span>
      {action}
    </div>
  );
}
