"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { RISK_SCENARIOS } from "@/lib/seed";
import { cn } from "@/lib/utils";

/** Presenter controls. Only visible while Demo mode is on. */
export default function DemoPanel() {
  const s = useApp();
  const path = usePathname();
  // Collapsed by default and after every trigger, so it never sits on top of the page's own controls.
  const [open, setOpen] = useState(false);
  if (!s.demoMode || path === "/phone-demo") return null;

  const btn = "rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-pink-soft/60";
  const actions: [string, () => void][] = [
    ["Trigger risk", () => s.triggerRisk(RISK_SCENARIOS[2])],
    ["False alarm", () => s.triggerRisk(RISK_SCENARIOS[1])],
    ["Trigger fall", () => s.set({ fall: { since: Date.now() } })],
    ["Missed check-in", () => { s.missCheckin(); s.log({ type: "checkin", title: "Missed check-in", detail: "No reply · 60s escalation countdown started", status: "escalated", notified: [] }); }],
    ["Check-in prompt", () => s.set({ checkin: { phase: "prompt", since: Date.now() } })],
    ["Fake call now", () => s.set({ call: { phase: "ringing", since: Date.now() } })],
    [s.weakNetwork ? "Network: weak" : "Network: good", () => { s.set({ weakNetwork: !s.weakNetwork }); toast(`Simulating ${!s.weakNetwork ? "weak" : "normal"} network`); }],
  ];

  return (
    <div className={cn("fixed bottom-24 left-3 z-[996] md:bottom-6 md:left-1/2 md:-translate-x-1/2", open ? "w-[min(300px,calc(100vw-96px))]" : "w-auto")}>
      <div className={cn("rounded-2xl border border-warning/50 bg-surface/95 shadow-md backdrop-blur", open ? "p-3" : "px-3 py-2")}>
        <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <FlaskConical size={16} className="text-warning" /> Presenter
          {open && <span className="ml-auto text-[10px] normal-case tracking-normal">journeys 10× faster</span>}
          <ChevronDown size={16} className={cn("transition", !open && "-rotate-90")} />
        </button>
        {open && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {actions.map(([label, fn]) => <button key={label} className={btn} onClick={() => { fn(); setOpen(false); }}>{label}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}
