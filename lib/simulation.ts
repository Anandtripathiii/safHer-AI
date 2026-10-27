// Pure simulation logic: routes, positions and the SOS coordination script.
// Everything is derived from timestamps so it survives a page refresh mid-demo.
import { ROUTE_WAYPOINTS, type Contact, type LatLng } from "./seed.ts";

export const distM = (a: LatLng, b: LatLng) => {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export function densify(points: LatLng[], perSegment = 12): LatLng[] {
  const out: LatLng[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export type RouteKind = "fastest" | "safer";

/** Both route options: the hand-drawn pair for the demo trip, otherwise a near-direct line vs a wider detour. */
export function routesFor(from: LatLng, to: LatLng, fromId?: string, toId?: string): Record<RouteKind, LatLng[]> {
  if (fromId === "hkm" && toId === "iiitd") return ROUTE_WAYPOINTS;
  if (fromId === "iiitd" && toId === "hkm") return { fastest: [...ROUTE_WAYPOINTS.fastest].reverse(), safer: [...ROUTE_WAYPOINTS.safer].reverse() };
  const bend = (k: number): LatLng => [(from[0] + to[0]) / 2 - (to[1] - from[1]) * k, (from[1] + to[1]) / 2 + (to[0] - from[0]) * k];
  return { fastest: [from, bend(0.04), to], safer: [from, bend(-0.16), to] };
}

/** Waypoints for the Safer option (kept for existing callers). */
export const routeFor = (from: LatLng, to: LatLng, fromId?: string, toId?: string) => routesFor(from, to, fromId, toId).safer;

export type RouteScore = { minutes: number; lighting: number; footTraffic: number; incidents30d: number; helpPoints: number; warning?: string };

/**
 * Sample scores for each option. After dark the fastest route loses most of its foot traffic and lighting,
 * so night mode makes Safer the default and puts a warning on Fastest.
 */
export function routeScores(kind: RouteKind, night: boolean, fastestMinutes: number): RouteScore {
  if (kind === "safer") {
    return { minutes: fastestMinutes + 3, lighting: night ? 82 : 88, footTraffic: night ? 62 : 78, incidents30d: 1, helpPoints: 9 };
  }
  return night
    ? { minutes: fastestMinutes, lighting: 31, footTraffic: 18, incidents30d: 6, helpPoints: 4, warning: "Not recommended after dark — poorly lit, few people around" }
    : { minutes: fastestMinutes, lighting: 64, footTraffic: 55, incidents30d: 6, helpPoints: 4 };
}

export const defaultRouteKind = (night: boolean): RouteKind => (night ? "safer" : "fastest");

export const routeLengthM = (pts: LatLng[]) => pts.slice(1).reduce((s, p, i) => s + distM(pts[i], p), 0);

/** Point at fraction `t` (0..1) of the route by distance. */
export function pointAt(pts: LatLng[], t: number): LatLng {
  const total = routeLengthM(pts);
  let goal = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = distM(pts[i], pts[i + 1]);
    if (goal <= seg || i === pts.length - 2) {
      const f = seg === 0 ? 0 : Math.min(1, goal / seg);
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    }
    goal -= seg;
  }
  return pts[pts.length - 1];
}

/** Rough travel time for a generic journey: ~28 km/h city average, min 5 minutes. */
export const etaMinutes = (pts: LatLng[]) => Math.max(5, Math.round(routeLengthM(pts) / 1000 / 28 * 60));

// ---------- SOS coordination ----------

export type DeliveryStatus = "pending" | "delivered" | "viewed" | "acknowledged" | "no-response";
export type FeedItem = { t: number; contactId: string; status: DeliveryStatus; text: string; channel: "Push" | "SMS" | "In-app"; tone?: "warn" | "ok" };

export const NO_RESPONSE_AFTER = 20; // seconds without a reply before escalating

/**
 * The scripted response timeline. Roles go by contact order: the 1st replies fast,
 * the 2nd views then replies, the 3rd never answers (so we escalate), the rest view only.
 * On a weak network push fails first and everything arrives later over SMS.
 */
export function coordinationScript(contacts: Contact[], weak: boolean): FeedItem[] {
  const primary = contacts.filter((c) => !c.escalation);
  const escalation = contacts.find((c) => c.escalation);
  const lag = weak ? 4 : 0;
  const ch = weak ? "SMS" : "Push";
  const items: FeedItem[] = [];

  primary.forEach((c, i) => {
    const sent = 1 + i * 0.4;
    if (weak) items.push({ t: 0.6 + i * 0.3, contactId: c.id, status: "pending", text: `Push to ${c.name} failed — queued, retrying via SMS`, channel: "Push", tone: "warn" });
    items.push({ t: sent + lag, contactId: c.id, status: "delivered", text: `Sent to ${c.name} ✓ delivered`, channel: ch });
    if (i === 0) {
      items.push({ t: sent + lag + 3, contactId: c.id, status: "viewed", text: `${c.name} viewed your location`, channel: "In-app" });
      items.push({ t: sent + lag + 8, contactId: c.id, status: "acknowledged", text: `${c.name} acknowledged: “On my way”`, channel: "In-app", tone: "ok" });
    } else if (i === 1) {
      items.push({ t: sent + lag + 6, contactId: c.id, status: "viewed", text: `${c.name} viewed your location`, channel: "In-app" });
      items.push({ t: sent + lag + 14, contactId: c.id, status: "acknowledged", text: `${c.name} acknowledged: “Calling you now”`, channel: "In-app", tone: "ok" });
    } else if (i === 2) {
      items.push({ t: sent + lag + NO_RESPONSE_AFTER, contactId: c.id, status: "no-response", text: escalation ? `No response from ${c.name} — escalating to ${escalation.name}` : `No response from ${c.name}`, channel: ch, tone: "warn" });
    } else {
      items.push({ t: sent + lag + 9, contactId: c.id, status: "viewed", text: `${c.name} viewed your location`, channel: "In-app" });
    }
  });

  const third = primary[2];
  if (escalation && third) {
    const esc = 1 + 2 * 0.4 + lag + NO_RESPONSE_AFTER;
    items.push({ t: esc + 0.5, contactId: escalation.id, status: "pending", text: `Alerting ${escalation.name}…`, channel: ch });
    items.push({ t: esc + 2, contactId: escalation.id, status: "delivered", text: `Sent to ${escalation.name} ✓ delivered`, channel: ch });
    items.push({ t: esc + 5, contactId: escalation.id, status: "viewed", text: `${escalation.name} viewed your location`, channel: "In-app" });
    items.push({ t: esc + 9, contactId: escalation.id, status: "acknowledged", text: `${escalation.name} acknowledged: “Guard dispatched to your location”`, channel: "In-app", tone: "ok" });
  }
  return items.sort((a, b) => a.t - b.t);
}

/** Feed items visible after `elapsed` seconds, plus each contact's current status. */
export function coordinationAt(script: FeedItem[], primaryIds: string[], elapsed: number) {
  const feed = script.filter((e) => e.t <= elapsed);
  const status: Record<string, DeliveryStatus> = Object.fromEntries(primaryIds.map((id) => [id, "pending" as DeliveryStatus]));
  for (const e of feed) status[e.contactId] = e.status;
  const escalated = feed.some((e) => e.status === "no-response");
  return { feed, status, escalated };
}

/** "Last viewed Xs ago" for live-location viewers: each viewer refreshes on their own rhythm. */
export const VIEW_PERIODS = [7, 11, 17, 23];
export const lastViewedSec = (sinceStartSec: number, i: number) => Math.floor(sinceStartSec % VIEW_PERIODS[i % VIEW_PERIODS.length]);
