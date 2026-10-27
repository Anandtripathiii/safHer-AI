"use client";
import { useEffect, useRef, useState } from "react";

/** Re-renders every `ms` and returns the current time. Drives all the live counters. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/**
 * False during the server render and the first client render, true after mount.
 * Pages are pre-rendered at build time on a UTC machine, so anything that depends on
 * the visitor's clock (e.g. "is it night?") must wait for this to avoid a hydration mismatch.
 */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Press-and-hold: `p` goes 0→1 over `ms`, then `onDone` fires. Releasing early resets it. */
export function useHold(onDone: () => void, ms = 2000) {
  const [p, setP] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef(0);
  const tick = () => {
    if (start.current === null) return;
    const v = Math.min(1, (performance.now() - start.current) / ms);
    setP(v);
    if (v >= 1) { start.current = null; onDone(); return; }
    raf.current = requestAnimationFrame(tick);
  };
  const down = () => { if (start.current !== null) return; start.current = performance.now(); navigator.vibrate?.(30); raf.current = requestAnimationFrame(tick); };
  const up = () => { start.current = null; cancelAnimationFrame(raf.current); setP(0); };
  return { p, down, up };
}

type BatteryManager = EventTarget & { level: number; charging: boolean };

/** Real device battery via navigator.getBattery (Chrome desktop + Android). null when unsupported. */
export function useDeviceBattery() {
  const [b, setB] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (!nav.getBattery) return;
    let mgr: BatteryManager | null = null;
    const read = () => mgr && setB({ level: Math.round(mgr.level * 100), charging: mgr.charging });
    nav.getBattery().then((m) => {
      mgr = m;
      read();
      m.addEventListener("levelchange", read);
      m.addEventListener("chargingchange", read);
    }).catch(() => {});
    return () => { mgr?.removeEventListener("levelchange", read); mgr?.removeEventListener("chargingchange", read); };
  }, []);
  return b;
}
