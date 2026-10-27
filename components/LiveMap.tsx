"use client";
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // loaded with the map chunk, not on every page
import { Flag } from "lucide-react";
import { HELP_KINDS } from "./helpKinds";
import { HELP_POINTS, type HelpKind, type LatLng, type SafeZone } from "@/lib/seed";

export type MapRoute = { id: string; points: LatLng[]; color: string; active?: boolean; dashed?: boolean; onClick?: () => void; label?: string };

const KIND = HELP_KINDS;

const iconCache = new Map<string, L.DivIcon>();
const helpIcon = (kind: HelpKind) => {
  if (!iconCache.has(kind)) {
    const { icon: I, color } = KIND[kind];
    iconCache.set(kind, L.divIcon({
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `<div style="width:28px;height:28px;border-radius:9999px;background:#fff;border:2px solid ${color};display:grid;place-items:center;color:${color};box-shadow:0 1px 3px rgb(0 0 0/.2)">${renderToStaticMarkup(<I size={14} strokeWidth={2.4} />)}</div>`,
    }));
  }
  return iconCache.get(kind)!;
};
const meIcon = L.divIcon({ className: "", iconSize: [18, 18], iconAnchor: [9, 9], html: `<div class="me-dot"></div>` });
const flagIcon = L.divIcon({
  className: "", iconSize: [30, 30], iconAnchor: [15, 28],
  html: `<div style="color:#D9375C">${renderToStaticMarkup(<Flag size={26} strokeWidth={2.4} fill="#FFCCE1" />)}</div>`,
});

function Fit({ points, padTop }: { points: LatLng[]; padTop: number }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [30, padTop], paddingBottomRight: [30, 40] });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function LiveMap({
  routes = [], me, destination, zones = [], showHelp = true, fitTo, padTop = 110, className = "h-full w-full",
}: { routes?: MapRoute[]; me?: LatLng | null; destination?: LatLng; zones?: SafeZone[]; showHelp?: boolean; fitTo?: LatLng[]; padTop?: number; className?: string }) {
  return (
    <MapContainer center={[28.5455, 77.24]} zoom={14} zoomControl={false} className={className} attributionControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {fitTo && <Fit points={fitTo} padTop={padTop} />}
      {zones.map((z) => (
        <Circle key={z.id} center={z.pos} radius={z.radius} pathOptions={{ color: "#E195AB", fillColor: "#FFCCE1", fillOpacity: 0.35, weight: 1.5 }}>
          <Tooltip direction="center" permanent className="!border-0 !bg-transparent !shadow-none !text-[11px] !font-semibold !text-[#b05a75]">{z.name}</Tooltip>
        </Circle>
      ))}
      {[...routes].sort((a, b) => Number(!!a.active) - Number(!!b.active)).map((r) => (
        <Polyline
          key={r.id}
          positions={r.points}
          eventHandlers={r.onClick ? { click: r.onClick } : undefined}
          pathOptions={{ color: r.color, weight: r.active ? 7 : 5, opacity: r.active ? 0.95 : 0.5, dashArray: r.dashed ? "8 10" : undefined, lineCap: "round" }}
        >
          {r.label && <Tooltip sticky>{r.label}</Tooltip>}
        </Polyline>
      ))}
      {showHelp && HELP_POINTS.map((h) => (
        <Marker key={h.id} position={h.pos} icon={helpIcon(h.kind)}>
          <Popup>
            <b>{h.name}</b><br />
            <span style={{ color: KIND[h.kind].color }}>{KIND[h.kind].label}</span> · {h.hours}<br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>Sample data — verify locally</span>
          </Popup>
        </Marker>
      ))}
      {destination && <Marker position={destination} icon={flagIcon} />}
      {me && <Marker position={me} icon={meIcon} zIndexOffset={1000}><Tooltip direction="top" offset={[0, -10]}>You</Tooltip></Marker>}
    </MapContainer>
  );
}

