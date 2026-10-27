import { AlertTriangle, BellRing, Footprints, MapPin, Navigation, Siren } from "lucide-react";
import type { EventType } from "@/lib/seed";

export const TYPE_ICON: Record<EventType, typeof Siren> = { journey: Navigation, alert: AlertTriangle, sos: Siren, checkin: BellRing, zone: MapPin, fall: Footprints };
export const TYPE_TINT: Record<EventType, string> = {
  journey: "bg-[#2F7BF6]/12 text-[#2F6FD6] dark:text-[#8db4ff]",
  alert: "bg-warning/20 text-[#9a6a0c] dark:text-warning",
  sos: "bg-danger/15 text-danger",
  checkin: "bg-pink-soft text-[#a24b66] dark:text-pink-strong",
  zone: "bg-success/15 text-success",
  fall: "bg-line text-muted",
};

