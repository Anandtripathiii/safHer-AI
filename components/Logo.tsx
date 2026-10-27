import { cn } from "@/lib/utils";

/** Wordmark: "Saf" + the pink figure-H from photos/logo + "er". Height follows the surrounding font size. */
export default function Logo({ className }: { className?: string }) {
  return (
    <span aria-label="SafeHer" role="img" className={cn("inline-flex items-center font-semibold tracking-tight", className)}>
      <span aria-hidden>Saf</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/photos/logo-h.png" alt="" aria-hidden width={554} height={502} loading="lazy" decoding="async" className="mx-[0.02em] inline-block h-[1.05em] w-auto align-middle" />
      <span aria-hidden>er</span>
    </span>
  );
}
