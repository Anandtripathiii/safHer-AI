"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, MessageSquarePlus, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { LANDMARKS, type Tone } from "@/lib/seed";
import { useNow } from "@/lib/hooks";
import { ago, cn } from "@/lib/utils";

const TONES: { id: Tone; label: string; cls: string; dot: string }[] = [
  { id: "negative", label: "Caution", cls: "bg-danger/10 text-danger", dot: "bg-danger" },
  { id: "positive", label: "Positive", cls: "bg-success/15 text-success", dot: "bg-success" },
  { id: "neutral", label: "Info", cls: "bg-line text-muted", dot: "bg-muted" },
];
const toneOf = (t: Tone) => TONES.find((x) => x.id === t)!;

export default function CommunityPage() {
  const { posts, addPost, markHelpful } = useApp();
  const now = useNow(30_000);
  const [filter, setFilter] = useState<Tone | "all">("all");
  const [text, setText] = useState("");
  const [area, setArea] = useState(LANDMARKS[0].name);
  const [tone, setTone] = useState<Tone>("negative");
  const [anon, setAnon] = useState(true);
  const [voted, setVoted] = useState<string[]>([]);
  const shown = posts.filter((p) => filter === "all" || p.tone === filter);

  const submit = () => {
    if (text.trim().length < 10) return toast.error("Add a few more details so others can act on it");
    addPost({ author: anon ? "Anonymous" : "Anand T.", area, text: text.trim(), tone });
    setText("");
    toast.success("Report shared with people nearby", { description: "Thanks for looking out for others." });
  };

  return (
    <main className="mx-auto max-w-xl px-4 pb-32 pt-28 md:pb-16">
      <h1 className="text-2xl font-semibold">Community</h1>
      <p className="mt-1 text-sm text-muted">Reports from people near you in Delhi NCR. Sample posts — not verified.</p>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="card mt-6 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-soft to-pink-strong text-sm font-semibold text-white">AN</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="What should others know? e.g. “Streetlight out near Nehru Place bus stop”"
            className="min-h-[64px] flex-1 resize-none bg-transparent text-[15px] outline-none placeholder:text-muted/70" aria-label="Report" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <label className="chip bg-bg pr-1">
            <MapPin size={14} className="text-pink-strong" />
            <select value={area} onChange={(e) => setArea(e.target.value)} className="max-w-[150px] bg-transparent text-sm outline-none" aria-label="Location">
              {LANDMARKS.map((l) => <option key={l.id}>{l.name}</option>)}
            </select>
          </label>
          {TONES.map((t) => (
            <button type="button" key={t.id} onClick={() => setTone(t.id)} aria-pressed={tone === t.id} className={cn("chip", tone === t.id ? t.cls + " ring-1 ring-current" : "bg-bg")}>{t.label}</button>
          ))}
          <label className="ml-auto flex items-center gap-1.5 text-xs text-muted"><input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="accent-[rgb(var(--pink-strong))]" /> Anonymous</label>
          <button className="btn-primary h-9 px-4 text-sm" type="submit"><MessageSquarePlus size={16} /> Post</button>
        </div>
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {[{ id: "all" as const, label: "All" }, ...TONES].map((t) => (
          <button key={t.id} onClick={() => setFilter(t.id)} className={cn("chip shrink-0", filter === t.id ? "bg-pink-strong text-white hover:bg-pink-strong" : "bg-surface")}>{t.label}</button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-line">
        <AnimatePresence initial={false}>
          {shown.map((p) => {
            const t = toneOf(p.tone);
            return (
              <motion.li key={p.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-5">
                <div className="flex items-center gap-2 text-sm">
                  <span className={cn("h-2 w-2 rounded-full", t.dot)} />
                  <b className="font-medium">{p.author}</b>
                  <span className="text-muted">· {ago(p.ts, now)}</span>
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold", t.cls)}>{t.label}</span>
                </div>
                <p className="mt-2 leading-relaxed">{p.text}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1"><MapPin size={14} />{p.area}</span>
                  <button
                    onClick={() => { if (!voted.includes(p.id)) { markHelpful(p.id); setVoted([...voted, p.id]); } }}
                    className={cn("flex items-center gap-1 rounded-full px-2 py-1 transition hover:bg-pink-soft/50", voted.includes(p.id) && "text-pink-strong")}
                    aria-pressed={voted.includes(p.id)}
                  >
                    <ThumbsUp size={14} /> Helpful · {p.helpful}
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </main>
  );
}
