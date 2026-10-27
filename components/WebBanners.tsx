"use client";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { useDeviceBattery } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { BatteryBanner } from "./SafetyBanners";

/** Website versions of the phone's safety banners, pinned under the navbar. */
export default function WebBanners() {
  const path = usePathname();
  const sos = useApp((s) => s.sos);
  const battery = useDeviceBattery();
  const lowBattery = battery && !battery.charging && battery.level < 20;
  if (path === "/phone-demo" || !lowBattery) return null;
  return (
    <div className={cn("fixed inset-x-3 z-[985] mx-auto max-w-5xl space-y-2", sos && path !== "/sos" ? "top-[140px]" : "top-[88px]")}>
      {lowBattery && <BatteryBanner level={battery.level} className="shadow-md" />}
    </div>
  );
}
