import type { Lang } from "./seed";

const dict = {
  home: { en: "Home", hi: "होम", bn: "হোম" },
  journey: { en: "Journey", hi: "सफ़र", bn: "যাত্রা" },
  map: { en: "Map", hi: "मैप", bn: "ম্যাপ" },
  sos: { en: "SOS", hi: "SOS", bn: "SOS" },
  assistant: { en: "Assistant", hi: "सहायक", bn: "সহকারী" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", bn: "ড্যাশবোর্ড" },
  assistantTitle: { en: "Safety Assistant", hi: "सुरक्षा सहायक", bn: "নিরাপত্তা সহকারী" },
  assistantSub: { en: "Answers from SafeHer's safety guide. Not a substitute for emergency services.", hi: "SafeHer की सुरक्षा गाइड से जवाब। यह आपातकालीन सेवाओं का विकल्प नहीं है।", bn: "SafeHer-এর নিরাপত্তা নির্দেশিকা থেকে উত্তর। এটি জরুরি পরিষেবার বিকল্প নয়।" },
  greeting: { en: "Hi Anand, I'm here. Ask me anything about staying safe on your trip.", hi: "नमस्ते Anand, मैं यहाँ हूँ। अपने सफ़र की सुरक्षा के बारे में कुछ भी पूछें।", bn: "নমস্কার Anand, আমি আছি। আপনার যাত্রার নিরাপত্তা নিয়ে যা খুশি জিজ্ঞাসা করুন।" },
  placeholder: { en: "Ask about routes, alerts, contacts…", hi: "रास्ते, अलर्ट, संपर्क के बारे में पूछें…", bn: "রুট, সতর্কতা, পরিচিতি নিয়ে জিজ্ঞাসা করুন…" },
  send: { en: "Send", hi: "भेजें", bn: "পাঠান" },
  typing: { en: "SafeHer is typing", hi: "SafeHer लिख रहा है", bn: "SafeHer লিখছে" },
  chipExplain: { en: "Explain last alert", hi: "पिछला अलर्ट समझाएँ", bn: "শেষ সতর্কতা বোঝান" },
  chipTracking: { en: "Who is tracking me?", hi: "मुझे कौन ट्रैक कर रहा है?", bn: "কে আমাকে ট্র্যাক করছে?" },
  chipSafeWord: { en: "Change safe word", hi: "सेफ वर्ड बदलें", bn: "সেফ ওয়ার্ড বদলান" },
  chipNumbers: { en: "Emergency numbers", hi: "आपातकालीन नंबर", bn: "জরুরি নম্বর" },
  nobody: { en: "no one right now", hi: "अभी कोई नहीं", bn: "এখন কেউ নন" },
  online: { en: "Online · replies in seconds", hi: "ऑनलाइन · कुछ सेकंड में जवाब", bn: "অনলাইন · কয়েক সেকেন্ডে উত্তর" },
  language: { en: "Language", hi: "भाषा", bn: "ভাষা" },
} satisfies Record<string, Record<Lang, string>>;

export type Key = keyof typeof dict;
export const t = (k: Key, lang: Lang) => dict[k][lang];
export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "bn", label: "বাংলা" },
];
