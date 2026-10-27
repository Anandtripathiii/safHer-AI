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
