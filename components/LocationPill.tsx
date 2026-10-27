"use client";
import { useEffect } from "react";
import { LocateFixed, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { ago } from "@/lib/utils";

/** Real browser location, read once when asked. Denied shows the global warning banner instead. */
export default function LocationPill() {
  const { webLoc, requestLocation } = useApp();
  const now = useNow(1000);

  // Already granted on an earlier visit: refresh the reading once (no prompt is shown again).
  useEffect(() => {
    if (webLoc.status === "granted" && !webLoc.at) requestLocation();
  }, [webLoc.status, webLoc.at, requestLocation]);

  if (webLoc.status === "denied") return null;
  if (webLoc.status === "granted" && webLoc.lat !== undefined) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-sm shadow-sm">
        <MapPin size={16} className="text-pink-strong" />
        <span className="font-medium">Your location</span>
        <span className="tabular-nums text-muted">{webLoc.lat.toFixed(4)}, {webLoc.lng!.toFixed(4)} · ±{webLoc.acc} m · Updated {ago(webLoc.at!, now)}</span>
        <button onClick={requestLocation} aria-label="Refresh location" className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-pink-soft/50"><RefreshCw size={14} /></button>
      </span>
    );
  }
  return (
    <button onClick={requestLocation} disabled={webLoc.status === "asking"} className="chip h-10 bg-surface px-4 shadow-sm">
      {webLoc.status === "asking" ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} className="text-pink-strong" />}
      {webLoc.status === "asking" ? "Finding you…" : "Use my location for SOS"}
    </button>
  );
}
