"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, Clock, Eye, MessageSquareWarning, Send } from "lucide-react";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { coordinationAt, coordinationScript, type DeliveryStatus } from "@/lib/simulation";
import { cn } from "@/lib/utils";

const STATUS: Record<DeliveryStatus, { label: string; cls: string; icon: typeof Check }> = {
  pending: { label: "Pending", cls: "bg-line/70 text-muted", icon: Clock },
  delivered: { label: "Delivered", cls: "bg-[#2F7BF6]/12 text-[#2F6FD6] dark:text-[#8db4ff]", icon: Check },
  viewed: { label: "Viewed", cls: "bg-pink-soft text-[#a24b66] dark:text-pink-strong", icon: Eye },
  acknowledged: { label: "Acknowledged", cls: "bg-success/15 text-success", icon: CheckCheck },
  "no-response": { label: "No response", cls: "bg-warning/20 text-[#9a6a0c] dark:text-warning", icon: MessageSquareWarning },
};

export function StatusPill({ s }: { s: DeliveryStatus }) {
  const { label, cls, icon: I } = STATUS[s];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cls)}><I size={14} />{label}</span>;
}

/** Live view of who has been alerted and how they responded. */
export function useCoordination() {
  const { sos, contacts } = useApp();
  const now = useNow(500);
  if (!sos) return null;
  const elapsed = (now - sos.startedAt) / 1000;
  const primary = contacts.filter((c) => !c.escalation);
  const r = coordinationAt(coordinationScript(contacts, sos.weak), primary.map((c) => c.id), elapsed);
  const rows = contacts.filter((c) => !c.escalation || r.status[c.id]);
  return { ...r, rows, elapsed, sos };
}

export default function Coordination({ className }: { className?: string }) {
  const c = useCoordination();
  if (!c) return null;
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Emergency coordination</h2>
        {c.escalated && (
          <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full bg-warning/25 px-2.5 py-1 text-xs font-semibold text-[#9a6a0c] dark:text-warning">
            No response — escalating
          </motion.span>
        )}
      </div>
      {c.sos.weak && <p className="mt-2 rounded-xl bg-warning/15 px-3 py-2 text-xs">Weak network: push is failing, alerts are queued and sent by SMS.</p>}
      <ul className="mt-3 divide-y divide-line/70">
        {c.rows.map((ct) => (
          <li key={ct.id} className="flex items-center gap-3 py-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: ct.color }}>{ct.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{ct.name}</p>
              <p className="truncate text-xs text-muted">{ct.escalation ? "Escalation contact" : ct.relation}</p>
            </div>
            <StatusPill s={c.status[ct.id] ?? "pending"} />
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Live feed</h3>
      <ol className="mt-2 space-y-2">
        <AnimatePresence initial={false}>
          {[...c.feed].reverse().map((e) => (
            <motion.li
              key={`${e.t}-${e.contactId}-${e.status}`}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-sm", e.tone === "warn" ? "bg-warning/15" : e.tone === "ok" ? "bg-success/10" : "bg-bg")}
            >
              <Send size={14} className="mt-1 shrink-0 text-muted" />
              <span className="flex-1">{e.text}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted">{e.channel} · {Math.round(e.t)}s</span>
            </motion.li>
          ))}
        </AnimatePresence>
        <li className="flex items-start gap-2 rounded-xl bg-bg px-3 py-2 text-sm">
          <Send size={14} className="mt-1 shrink-0 text-muted" />
          <span className="flex-1">SOS triggered — {c.sos.source}</span>
          <span className="text-xs text-muted">0s</span>
        </li>
      </ol>
    </div>
  );
}
