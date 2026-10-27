import { QA_FALLBACK, QA_PAIRS, type Lang } from "./seed.ts";

/** Best keyword match across the current language and English (people mix languages). */
export function matchQA(text: string, lang: Lang) {
  const q = text.toLowerCase();
  let best: (typeof QA_PAIRS)[number] | null = null, bestScore = 0;
  for (const qa of QA_PAIRS) {
    const kws = new Set([...qa.keywords[lang], ...qa.keywords.en]);
    const score = [...kws].reduce((s, k) => (q.includes(k.toLowerCase()) ? s + k.length : s), 0);
    if (score > bestScore) { best = qa; bestScore = score; }
  }
  return best;
}

export function reply(text: string, lang: Lang, ctx: { lastAlert: string; viewers: string; safeWord: string }) {
  const qa = matchQA(text, lang);
  const a = qa ? qa.a[lang] : QA_FALLBACK[lang];
  return a.replace("{lastAlert}", ctx.lastAlert).replace("{viewers}", ctx.viewers).replace("{safeWord}", ctx.safeWord);
}
