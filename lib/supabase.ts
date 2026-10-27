import { createClient } from "@supabase/supabase-js";
import type { StateStorage } from "zustand/middleware";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Null when the env vars are missing — the app then keeps using localStorage only. */
export const supabase = url && key ? createClient(url, key) : null;

// No login, so rows are scoped to a random per-browser id.
const deviceId = () => {
  let id = localStorage.getItem("safeher-device");
  if (!id) localStorage.setItem("safeher-device", (id = crypto.randomUUID()));
  return id;
};

type Persisted = { state: { contacts?: { id: string }[]; events?: { id: string; type: string }[]; zones?: { id: string }[]; posts?: { id: string }[]; journey?: { id: string } | null } };

let timer: ReturnType<typeof setTimeout> | undefined;

async function upsertAll(value: string) {
  if (!supabase) return;
  const { state: s } = JSON.parse(value) as Persisted;
  const device_id = deviceId();
  const rows = (list: { id: string }[] = []) => list.map((data) => ({ device_id, id: data.id, data }));
  const events = s.events ?? [];
  const journeys = [...events.filter((e) => e.type === "journey"), ...(s.journey ? [s.journey] : [])];
  const tables: [string, { id: string }[] | undefined][] = [
    ["contacts", s.contacts], ["journeys", journeys], ["sos_events", events.filter((e) => e.type === "sos")],
    ["safe_places", s.zones], ["community_reports", s.posts],
  ];
  const results = await Promise.all(tables.map(([t, list]) => supabase.from(t).upsert(rows(list))));
  results.forEach((r, i) => r.error && console.warn(`[supabase] ${tables[i][0]}:`, r.error.message));
}

/** Zustand storage: localStorage stays the read source (works offline); writes are mirrored to Supabase. */
export const syncedStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  removeItem: (name) => localStorage.removeItem(name),
  setItem: (name, value) => {
    localStorage.setItem(name, value);
    if (!supabase) return;
    // shortcut: re-upserts every row (deletes aren't mirrored); switch to per-action writes once there's auth.
    clearTimeout(timer);
    timer = setTimeout(() => upsertAll(value).catch((e) => console.warn("[supabase]", e)), 2000);
  },
};
