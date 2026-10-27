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

// Phone recognisers often split or punctuate words ("pine apple.") — compare letters/digits only.
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** True when the spoken text contains the safe word (case-insensitive, partial match, ignores spacing/punctuation). */
export const heardSafeWord = (transcript: string, safeWord: string) => {
  const w = norm(safeWord);
  return w.length > 0 && norm(transcript).includes(w);
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
    let retry: ReturnType<typeof setTimeout> | undefined;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setHeard(text.slice(-60));
      if (heardSafeWord(text, safeWord)) { alive = false; rec.stop(); setStatus("off"); cb.current(); }
    };
    rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { alive = false; setStatus("blocked"); } };
    // Mobile browsers end the session after a few seconds of silence; an immediate start() can throw there.
    rec.onend = () => { if (alive) retry = setTimeout(() => { try { rec.start(); } catch {} }, 250); };
    // Ask for the mic explicitly first (phones won't prompt from SpeechRecognition alone), then release
    // the stream — Android can't share the mic between getUserMedia and SpeechRecognition.
    (navigator.mediaDevices?.getUserMedia({ audio: true }) ?? Promise.resolve(null))
      .then((stream) => {
        stream?.getTracks().forEach((t) => t.stop());
        if (!alive) return;
        try { rec.start(); setStatus("listening"); } catch { setStatus("blocked"); }
      })
      .catch(() => { alive = false; setStatus("blocked"); });
    return () => { alive = false; clearTimeout(retry); try { rec.stop(); } catch {} };
  }, [enabled, safeWord]);

  return { status, heard };
}
