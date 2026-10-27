"use client";
import { useEffect, useState } from "react";

/** Re-renders every `ms` and returns the current time. Drives all the live counters. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
