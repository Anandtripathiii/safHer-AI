import { Phone, ShieldCheck } from "lucide-react";
import { HELPLINES } from "@/lib/seed";
import { cn } from "@/lib/utils";

/** Government helplines with one-tap Call (tel: links open the device dialer). */
export default function Helplines({ phone = false, className }: { phone?: boolean; className?: string }) {
  return (
    <section className={className} aria-labelledby={phone ? "helplines-phone" : "helplines"}>
      <h2 id={phone ? "helplines-phone" : "helplines"} className={cn("flex items-center gap-2 font-semibold uppercase tracking-wider text-success", phone ? "px-1 text-[13px]" : "text-xs")}>
        <ShieldCheck size={phone ? 18 : 16} /> Government Helplines
      </h2>
      <ul className={cn("mt-2 overflow-hidden rounded-3xl border border-success/25 bg-success/5", phone ? "" : "grid sm:grid-cols-2")}>
        {HELPLINES.map((h, i) => (
          <li key={h.name} className={cn("flex items-center gap-3 px-4 py-2", phone ? "min-h-[64px]" : "min-h-[60px]", i > 0 && "border-t border-success/15", !phone && i === 1 && "sm:border-t-0", !phone && i % 2 === 1 && "sm:border-l")}>
            <span className="min-w-0 flex-1">
              <span className={cn("block font-semibold", phone ? "text-[16px]" : "text-sm")}>{h.name}</span>
              <span className={cn("block tabular-nums text-muted", phone ? "text-[15px]" : "text-sm")}>{h.number}</span>
            </span>
            <a href={`tel:${h.number.replace(/\D/g, "")}`} aria-label={`Call ${h.name}, ${h.number}`}
              className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success font-bold text-white", phone ? "h-12 px-5 text-[16px] active:brightness-90" : "h-10 px-4 text-sm hover:brightness-95")}>
              <Phone size={phone ? 18 : 16} /> Call
            </a>
          </li>
        ))}
      </ul>
      <p className={cn("mt-1.5 text-muted", phone ? "px-1 text-[12px]" : "text-xs")}>Call opens your phone's dialer. In an emergency, dial 112.</p>
    </section>
  );
}
