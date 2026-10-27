import { Coffee, Pill, ShieldCheck, TrainFront } from "lucide-react";
import type { HelpKind } from "@/lib/seed";

// Kept out of LiveMap so pages can use it without pulling Leaflet into the server bundle.
export const HELP_KINDS = {
  police: { icon: ShieldCheck, color: "#2F6FD6", label: "Police" },
  metro: { icon: TrainFront, color: "#7A5AC8", label: "Metro" },
  pharmacy: { icon: Pill, color: "#2E9E77", label: "Pharmacy" },
  cafe: { icon: Coffee, color: "#C2793A", label: "24×7 café" },
} satisfies Record<HelpKind, { icon: typeof Pill; color: string; label: string }>;
