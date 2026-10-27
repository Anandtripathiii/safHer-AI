"use client";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Bottom sheet that lives inside the phone screen (not the browser window). */
export function PSheet({ open, onClose, children, className, dim = true }: { open: boolean; onClose?: () => void; children: React.ReactNode; className?: string; dim?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="sheet" className="absolute inset-0 z-[70] flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {dim && <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />}
          <motion.div
            role="dialog"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn("relative max-h-[85%] overflow-y-auto rounded-t-[28px] bg-surface px-5 pb-9 pt-3 shadow-md", className)}
          >
            <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-line" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Avatar({ initials, color, size = 44, className }: { initials: string; color: string; size?: number; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full font-bold text-white", className)} style={{ background: color, width: size, height: size, fontSize: size * 0.34 }}>
      {initials}
    </span>
  );
}

/** Phone buttons: big, no hover, pressed state only. Emergency ones are 56px+. */
export const pbtn = {
  primary: "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-pink-strong text-[17px] font-semibold text-white active:scale-[0.98] active:brightness-95",
  secondary: "flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-pink-strong bg-surface text-[17px] font-semibold text-ink active:bg-pink-soft/50",
  danger: "flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-danger text-[18px] font-bold text-white active:scale-[0.98]",
  ghost: "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-medium text-muted active:bg-bg",
};
