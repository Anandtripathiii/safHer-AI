"use client";
import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { audioUnlocked, unlockAudio } from "@/lib/sound";
import { cn } from "@/lib/utils";

/** Shown until sound is unlocked by a tap, so alert sounds and spoken confirmations work on phones. */
export default function AudioUnlock({ className }: { className?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(!audioUnlocked()), []);
  if (!show) return null;
  return (
    <button
      onClick={() => { unlockAudio(); setShow(false); }}
      className={cn("flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 text-[16px] font-bold text-white active:bg-white/20", className)}
    >
      <Volume2 size={22} /> Tap to enable sound alerts
    </button>
  );
}
