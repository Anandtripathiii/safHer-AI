"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, SendHorizontal } from "lucide-react";
import { useApp } from "@/lib/store";
import { LANGS, t, type Key } from "@/lib/i18n";
import { reply } from "@/lib/assistant";
import { cn } from "@/lib/utils";

type Msg = { id: number; from: "me" | "bot"; text: string };
const CHIPS: Key[] = ["chipExplain", "chipTracking", "chipSafeWord", "chipNumbers"];

export default function AssistantPage() {
  const { lang, set, lastRisk, sharing, contacts, safeWord } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  // Braces matter: newer browsers return a Promise from scrollIntoView, which React would call as a cleanup.
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { id: idRef.current++, from: "me", text: q }]);
    setInput("");
    setTyping(true);
    const ctx = {
      lastAlert: lastRisk ? `${lastRisk.title} (risk ${lastRisk.score}/100) — ${lastRisk.reason}` : "none yet",
      viewers: sharing ? contacts.filter((c) => !c.escalation).map((c) => c.name).join(", ") : t("nobody", lang),
      safeWord,
    };
    setTimeout(() => {
      setMsgs((m) => [...m, { id: idRef.current++, from: "bot", text: reply(q, lang, ctx) }]);
      setTyping(false);
    }, 650 + Math.random() * 600);
  };

  return (
    <main className="mx-auto flex h-dvh max-w-2xl flex-col px-4 pb-24 pt-24 md:pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pink-soft text-pink-strong"><Bot size={24} /></span>
          <div>
            <h1 className="font-semibold">{t("assistantTitle", lang)}</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted"><span className="h-1.5 w-1.5 rounded-full bg-success" />{t("online", lang)}</p>
          </div>
        </div>
        <div role="radiogroup" aria-label={t("language", lang)} className="flex rounded-full bg-surface p-1 shadow-sm">
          {LANGS.map((l) => (
            <button key={l.id} role="radio" aria-checked={lang === l.id} onClick={() => set({ lang: l.id })}
              className={cn("rounded-full px-3 py-1.5 text-sm transition", lang === l.id ? "bg-pink-strong text-white" : "text-muted hover:text-ink")}>
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <section className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-surface/60 p-4" aria-live="polite">
        <Bubble from="bot" text={t("greeting", lang)} />
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              <Bubble from={m.from} text={m.text} />
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-sm" aria-label={t("typing", lang)}>
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        )}
        <div ref={end} />
      </section>

      <p className="mt-2 text-center text-[11px] text-muted">{t("assistantSub", lang)}</p>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-2 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("placeholder", lang)} className="input h-12 flex-1 rounded-full px-5" aria-label={t("placeholder", lang)} />
        <button type="submit" className="btn-primary h-12 w-12 px-0" aria-label={t("send", lang)} disabled={!input.trim() || typing}><SendHorizontal size={20} /></button>
      </form>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((k) => (
          <button key={k} onClick={() => send(t(k, lang))} className="chip shrink-0" disabled={typing}>{t(k, lang)}</button>
        ))}
      </div>
    </main>
  );
}

function Bubble({ from, text }: { from: "me" | "bot"; text: string }) {
  return (
    <div className={cn("flex", from === "me" && "justify-end")}>
      <p className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm", from === "me" ? "rounded-br-md bg-pink-strong text-white" : "rounded-bl-md bg-surface text-ink")}>
        {text}
      </p>
    </div>
  );
}
