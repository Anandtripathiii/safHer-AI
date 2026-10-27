"use client";
import { useEffect, useRef, useState } from "react";

type Rec = {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecCtor = new () => Rec;

export const getRecognition = (): RecCtor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/** True when the spoken text contains the safe word (case-insensitive, partial match). */
export const heardSafeWord = (transcript: string, safeWord: string) => {
  const w = safeWord.trim().toLowerCase();
  return w.length > 0 && transcript.toLowerCase().includes(w);
};

/**
 * Listens in the background while `enabled`, restarting whenever the browser ends a session.
 * Calls `onHeard` once when the safe word is spoken, then stops.
 */
export function useSafeWordListener(enabled: boolean, safeWord: string, onHeard: () => void) {
  const [status, setStatus] = useState<"off" | "listening" | "unsupported" | "blocked">("off");
  const [heard, setHeard] = useState("");
  const cb = useRef(onHeard);
  cb.current = onHeard;

  useEffect(() => {
    if (!enabled) { setStatus("off"); return; }
    const SR = getRecognition();
    if (!SR) { setStatus("unsupported"); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    let alive = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setHeard(text.slice(-60));
      if (heardSafeWord(text, safeWord)) { alive = false; rec.stop(); setStatus("off"); cb.current(); }
    };
    rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { alive = false; setStatus("blocked"); } };
    rec.onend = () => { if (alive) try { rec.start(); } catch {} };
    try { rec.start(); setStatus("listening"); } catch { setStatus("blocked"); }
    return () => { alive = false; try { rec.stop(); } catch {} };
  }, [enabled, safeWord]);

  return { status, heard };
}
