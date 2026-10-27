import type { Lang } from "./seed";
import { useApp } from "./store";

const dict = {
  home: { en: "Home", hi: "होम", bn: "হোম" },
  journey: { en: "Journey", hi: "सफ़र", bn: "যাত্রা" },
  map: { en: "Map", hi: "मैप", bn: "ম্যাপ" },
  sos: { en: "SOS", hi: "SOS", bn: "SOS" },
  assistant: { en: "Assistant", hi: "सहायक", bn: "সহকারী" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", bn: "ড্যাশবোর্ড" },
  phoneDemo: { en: "Phone demo", hi: "फ़ोन डेमो", bn: "ফোন ডেমো" },
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

  // Common UI words used across every page.
  contacts: { en: "Trusted contacts", hi: "भरोसेमंद संपर्क", bn: "বিশ্বস্ত পরিচিতি" },
  community: { en: "Community reports", hi: "समुदाय रिपोर्ट", bn: "কমিউনিটি রিপোর্ট" },
  history: { en: "Safety history", hi: "सुरक्षा इतिहास", bn: "নিরাপত্তা ইতিহাস" },
  settings: { en: "Settings", hi: "सेटिंग्स", bn: "সেটিংস" },
  search: { en: "Search", hi: "खोजें", bn: "খুঁজুন" },
  help: { en: "Help & shortcuts", hi: "मदद और शॉर्टकट", bn: "সাহায্য ও শর্টকাট" },
  demoMode: { en: "Demo mode", hi: "डेमो मोड", bn: "ডেমো মোড" },
  imSafe: { en: "I'm safe", hi: "मैं सुरक्षित हूँ", bn: "আমি নিরাপদ" },
  imSafeNow: { en: "I'm safe now", hi: "अब मैं सुरक्षित हूँ", bn: "আমি এখন নিরাপদ" },
  sendSos: { en: "Send SOS", hi: "SOS भेजें", bn: "SOS পাঠান" },
  keepWatching: { en: "Keep watching", hi: "नज़र रखें", bn: "নজর রাখুন" },
  whyAlert: { en: "Why this alert?", hi: "यह अलर्ट क्यों?", bn: "এই সতর্কতা কেন?" },
  sosActive: { en: "SOS active", hi: "SOS चालू", bn: "SOS চালু" },
  live: { en: "Live", hi: "लाइव", bn: "লাইভ" },
  alertSent: { en: "Alert sent to {n} contacts", hi: "{n} लोगों को अलर्ट भेजा गया", bn: "{n} জনকে সতর্কবার্তা পাঠানো হয়েছে" },
  alertSentDesc: { en: "Live location shared · recording started", hi: "लाइव लोकेशन शेयर · रिकॉर्डिंग शुरू", bn: "লাইভ লোকেশন শেয়ার · রেকর্ডিং শুরু" },
  alertResolved: { en: "Alert resolved", hi: "अलर्ट समाप्त", bn: "সতর্কতা শেষ" },
  recordingSaved: { en: "Recording saved to your Evidence Vault.", hi: "रिकॉर्डिंग आपके एविडेंस वॉल्ट में सेव हुई।", bn: "রেকর্ডিং আপনার এভিডেন্স ভল্টে সেভ হয়েছে।" },
  falseAlarmCancelled: { en: "False alarm cancelled", hi: "गलत अलार्म रद्द", bn: "ভুল সতর্কতা বাতিল" },
  contactsToldSafe: { en: "Contacts told you're safe.", hi: "संपर्कों को बताया गया कि आप सुरक्षित हैं।", bn: "পরিচিতদের জানানো হয়েছে আপনি নিরাপদ।" },
  stillSafe: { en: "Still safe?", hi: "अभी सुरक्षित हैं?", bn: "এখনও নিরাপদ?" },
  stillSafeHint: { en: "Tap yes so we don't worry. Routine check-in.", hi: "हाँ दबाएँ ताकि हम चिंता न करें। नियमित चेक-इन।", bn: "হ্যাঁ চাপুন যাতে আমরা চিন্তা না করি। নিয়মিত চেক-ইন।" },
  yes: { en: "Yes", hi: "हाँ", bn: "হ্যাঁ" },
  cancelImSafe: { en: "Cancel — I'm safe", hi: "रद्द करें — मैं सुरक्षित हूँ", bn: "বাতিল — আমি নিরাপদ" },
  missedCheckin: { en: "Missed check-in", hi: "चेक-इन छूट गया", bn: "চেক-ইন মিস হয়েছে" },
  missedCheckinHint: { en: "SOS will be sent to your trusted contacts when this reaches zero.", hi: "शून्य होते ही आपके भरोसेमंद लोगों को SOS भेजा जाएगा।", bn: "শূন্য হলেই আপনার বিশ্বস্তদের কাছে SOS যাবে।" },
  areYouOk: { en: "Are you okay?", hi: "क्या आप ठीक हैं?", bn: "আপনি ঠিক আছেন?" },
  imOk: { en: "I'm okay", hi: "मैं ठीक हूँ", bn: "আমি ঠিক আছি" },
  sendHelpNow: { en: "Send help now", hi: "अभी मदद भेजें", bn: "এখনই সাহায্য পাঠান" },
  quickActions: { en: "Quick actions", hi: "त्वरित विकल्प", bn: "দ্রুত বিকল্প" },
  planJourney: { en: "Plan a safe journey", hi: "सुरक्षित सफ़र की योजना", bn: "নিরাপদ যাত্রার পরিকল্পনা" },
  from: { en: "From", hi: "कहाँ से", bn: "কোথা থেকে" },
  to: { en: "To", hi: "कहाँ तक", bn: "কোথায়" },
  route: { en: "Route", hi: "रास्ता", bn: "রুট" },
  startJourney: { en: "Start journey", hi: "सफ़र शुरू करें", bn: "যাত্রা শুরু করুন" },
  whoShouldKnow: { en: "Who should know?", hi: "किसे पता होना चाहिए?", bn: "কাকে জানানো হবে?" },
  expectedArrival: { en: "Expected arrival", hi: "पहुँचने का समय", bn: "পৌঁছানোর সময়" },
  journeyStarted: { en: "Journey started", hi: "सफ़र शुरू", bn: "যাত্রা শুরু হয়েছে" },
  arrived: { en: "I've arrived", hi: "मैं पहुँच गई", bn: "আমি পৌঁছেছি" },
  endJourney: { en: "End journey", hi: "सफ़र खत्म करें", bn: "যাত্রা শেষ করুন" },
  nightRouting: { en: "Night routing", hi: "रात का रास्ता", bn: "রাতের রুট" },
  holdSos: { en: "Press and hold for 2 seconds", hi: "2 सेकंड दबाकर रखें", bn: "2 সেকেন্ড চেপে ধরুন" },
  alertSentTitle: { en: "Alert sent", hi: "अलर्ट भेजा गया", bn: "সতর্কবার্তা পাঠানো হয়েছে" },
  openLiveTracking: { en: "Open live tracking", hi: "लाइव ट्रैकिंग खोलें", bn: "লাইভ ট্র্যাকিং খুলুন" },
  cancelFalseAlarm: { en: "Cancel false alarm", hi: "गलत अलार्म रद्द करें", bn: "ভুল সতর্কতা বাতিল করুন" },
  emergencyDashboard: { en: "Emergency dashboard", hi: "आपातकालीन डैशबोर्ड", bn: "জরুরি ড্যাশবোর্ড" },
  weakNetwork: { en: "Weak network", hi: "कमज़ोर नेटवर्क", bn: "দুর্বল নেটওয়ার্ক" },
  safeherRunning: { en: "SafeHer running", hi: "SafeHer चालू है", bn: "SafeHer চলছে" },
  reachedMinimize: { en: "You've reached {place} — SafeHer will minimize in 10s to save battery", hi: "आप {place} पहुँच गईं — बैटरी बचाने के लिए SafeHer 10 सेकंड में छोटा होगा", bn: "আপনি {place} পৌঁছেছেন — ব্যাটারি বাঁচাতে SafeHer 10 সেকেন্ডে ছোট হবে" },
  leftActive: { en: "You left {place} — SafeHer is active", hi: "आप {place} से निकलीं — SafeHer सक्रिय है", bn: "আপনি {place} ছেড়েছেন — SafeHer সক্রিয়" },
} satisfies Record<string, Record<Lang, string>>;

export type Key = keyof typeof dict;
/** Translate a key; `{name}` placeholders are filled from `vars`. Falls back to English. */
export const t = (k: Key, lang: Lang, vars?: Record<string, string | number>) =>
  Object.entries(vars ?? {}).reduce((s, [name, v]) => s.replace(`{${name}}`, String(v)), dict[k][lang] ?? dict[k].en);
export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "bn", label: "বাংলা" },
];

/** For components: `const tr = useT(); tr("sendSos")`. Re-renders when the language changes. */
export function useT() {
  const lang = useApp((s) => s.lang);
  return (k: Key, vars?: Record<string, string | number>) => t(k, lang, vars);
}

/** For timers and callbacks outside React render (toasts from the Engine). */
export const tNow = (k: Key, vars?: Record<string, string | number>) => t(k, useApp.getState().lang, vars);
