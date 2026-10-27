"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";

export const SCREEN_W = 390;
export const SCREEN_H = 844;

/**
 * iPhone-style chrome around a 390×844 screen. Scales down to fit small viewports.
 * `onPowerHold` fires after the side button is held for 2s (used for silent SOS).
 */
export default function PhoneFrame({
  children, dark, pulse = 0, tilt = true, scale: fixedScale, onPowerHold, className,
}: { children: React.ReactNode; dark?: boolean; pulse?: number; tilt?: boolean; scale?: number; onPowerHold?: () => void; className?: string }) {
  const [scale, setScale] = useState(fixedScale ?? 1);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shake = useAnimationControls();

  // The "visible haptic": a short shake whenever an emergency action fires.
  useEffect(() => {
    if (pulse) shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } });
  }, [pulse, shake]);

  useEffect(() => {
    if (fixedScale) return;
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / (SCREEN_W + 24), (window.innerHeight - 120) / (SCREEN_H + 24)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fixedScale]);

  const startHold = () => { if (onPowerHold) hold.current = setTimeout(onPowerHold, 2000); };
  const endHold = () => { if (hold.current) clearTimeout(hold.current); };
  const w = SCREEN_W + 24, h = SCREEN_H + 24;

  return (
    <div className={cn("shrink-0", className)} style={{ width: w * scale, height: h * scale }}>
      <motion.div
        animate={shake}
        style={{ width: w, height: h, scale, transformOrigin: "top left" }}
      >
        <div className={cn("relative h-full w-full rounded-[60px] bg-[#16131c] p-3 shadow-[0_30px_60px_-20px_rgb(20_10_30/0.55),0_0_0_2px_#2b2632_inset]", tilt && "lg:-rotate-2")}>
          {/* side buttons */}
          <span className="absolute -left-[3px] top-[170px] h-8 w-[3px] rounded-l bg-[#2b2632]" />
          <span className="absolute -left-[3px] top-[220px] h-14 w-[3px] rounded-l bg-[#2b2632]" />
          <span className="absolute -left-[3px] top-[285px] h-14 w-[3px] rounded-l bg-[#2b2632]" />
          <button
            type="button"
            aria-label="Side button (hold 2 seconds for silent SOS)"
            title="Hold 2s: silent SOS"
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            className="absolute -right-[5px] top-[230px] h-24 w-[5px] rounded-r bg-[#2b2632] active:bg-[#4a4256]"
          />
          <div className={cn("relative isolate flex h-full w-full flex-col overflow-hidden rounded-[48px]", dark ? "os-dark bg-bg text-ink" : "os-light bg-bg text-ink")}>
            <div className="pointer-events-none absolute left-1/2 top-[11px] z-[80] h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
            {children}
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-[80] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink/80" aria-hidden />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
