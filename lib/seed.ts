// All synthetic. Nothing here is a real person, phone number or incident.

export type Lang = "en" | "hi" | "bn";
export type LatLng = [number, number];

export type Contact = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  relation: string;
  color: string;
  escalation?: boolean; // only alerted when someone else doesn't respond
};

export type Landmark = { id: string; name: string; area: string; pos: LatLng };
export type HelpKind = "police" | "metro" | "pharmacy" | "cafe";
export type HelpPoint = { id: string; name: string; kind: HelpKind; pos: LatLng; hours: string };

export type EventType = "journey" | "alert" | "sos" | "checkin" | "zone" | "fall";
export type EventStatus = "completed" | "resolved" | "false-alarm" | "escalated" | "active" | "cancelled";
export type SafeEvent = {
  id: string;
  ts: number;
  type: EventType;
  title: string;
  detail: string;
  status: EventStatus;
  notified: string[];
};

export type Tone = "negative" | "positive" | "neutral";
export type Post = { id: string; ts: number; author: string; area: string; text: string; tone: Tone; helpful: number };

export type SafeZone = { id: string; name: string; pos: LatLng; radius: number };

export type RiskScenario = {
  id: string;
  score: number;
  title: string;
  reason: string;
  confidence: "Low" | "Medium" | "High";
  falseAlarm?: boolean;
  signals: { deviation: number; stopMin: number; areaScore: number; checkinMissed: boolean };
};

export const USER = { name: "Anand Tripathi", first: "Anand", initials: "AN", city: "Delhi NCR", phone: "+91 98XXX 41207" };

export const CONTACTS: Contact[] = [
  { id: "mom", name: "Mom", initials: "MT", phone: "+91 98110 23457", relation: "Mother", color: "#E195AB" },
  { id: "dad", name: "Dad", initials: "RT", phone: "+91 98110 76120", relation: "Father", color: "#7FA7E0" },
  { id: "priya", name: "Priya", initials: "PS", phone: "+91 99580 33814", relation: "Friend", color: "#B79CE6" },
  { id: "campus", name: "Campus Security", initials: "CS", phone: "011-2690 7400", relation: "IIIT-Delhi security desk", color: "#4CAF8B", escalation: true },
];

export const LANDMARKS: Landmark[] = [
  { id: "hkm", name: "Hauz Khas Metro", area: "South Delhi", pos: [28.5433, 77.2066] },
  { id: "iiitd", name: "IIIT-Delhi", area: "Okhla Phase III", pos: [28.5459, 77.2732] },
  { id: "np", name: "Nehru Place", area: "South Delhi", pos: [28.5494, 77.253] },
  { id: "saket", name: "Select Citywalk, Saket", area: "Saket", pos: [28.5286, 77.219] },
  { id: "kalkaji", name: "Kalkaji Mandir Metro", area: "Kalkaji", pos: [28.5497, 77.2588] },
  { id: "gk", name: "GK-1 M-Block Market", area: "Greater Kailash", pos: [28.5487, 77.234] },
  { id: "lajpat", name: "Lajpat Nagar Central Market", area: "Lajpat Nagar", pos: [28.5677, 77.2433] },
  { id: "aiims", name: "AIIMS Delhi", area: "Ansari Nagar", pos: [28.5672, 77.21] },
  { id: "indiagate", name: "India Gate", area: "Central Delhi", pos: [28.6129, 77.2295] },
  { id: "cp", name: "Connaught Place", area: "Central Delhi", pos: [28.6315, 77.2167] },
  { id: "rajiv", name: "Rajiv Chowk Metro", area: "Central Delhi", pos: [28.6328, 77.2197] },
  { id: "noida18", name: "Noida Sector 18 Metro", area: "Noida", pos: [28.5708, 77.3261] },
  { id: "cyberhub", name: "DLF CyberHub", area: "Gurugram", pos: [28.495, 77.0895] },
  { id: "iitd", name: "IIT Delhi", area: "Hauz Khas", pos: [28.545, 77.1926] },
  { id: "jnu", name: "JNU Main Gate", area: "New Mehrauli Rd", pos: [28.5402, 77.1662] },
  { id: "nsic", name: "Okhla NSIC Metro", area: "Okhla", pos: [28.5546, 77.2649] },
  { id: "greenpark", name: "Green Park Market", area: "Green Park", pos: [28.559, 77.2066] },
  { id: "khan", name: "Khan Market", area: "Central Delhi", pos: [28.6003, 77.227] },
  { id: "ambience", name: "Ambience Mall, Vasant Kunj", area: "Vasant Kunj", pos: [28.5413, 77.155] },
  { id: "botanical", name: "Botanical Garden Metro", area: "Noida", pos: [28.5641, 77.3341] },
  { id: "du", name: "DU North Campus", area: "North Delhi", pos: [28.688, 77.21] },
];

export const HELP_POINTS: HelpPoint[] = [
  { id: "p1", name: "Hauz Khas Police Station", kind: "police", pos: [28.5494, 77.2001], hours: "Open 24 hours" },
  { id: "p2", name: "Greater Kailash Police Station", kind: "police", pos: [28.541, 77.237], hours: "Open 24 hours" },
  { id: "p3", name: "Kalkaji Police Station", kind: "police", pos: [28.5402, 77.259], hours: "Open 24 hours" },
  { id: "p4", name: "Okhla Industrial Area Police Post", kind: "police", pos: [28.537, 77.272], hours: "Open 24 hours" },
  { id: "m1", name: "Panchsheel Park Metro", kind: "metro", pos: [28.542, 77.219], hours: "5:30 AM – 11:30 PM" },
  { id: "m2", name: "Chirag Delhi Metro", kind: "metro", pos: [28.5376, 77.2271], hours: "5:30 AM – 11:30 PM" },
  { id: "m3", name: "Nehru Enclave Metro", kind: "metro", pos: [28.5435, 77.2513], hours: "5:30 AM – 11:30 PM" },
  { id: "m4", name: "Okhla NSIC Metro", kind: "metro", pos: [28.5546, 77.2649], hours: "5:30 AM – 11:30 PM" },
  { id: "r1", name: "Apollo Pharmacy, GK-1", kind: "pharmacy", pos: [28.548, 77.2335], hours: "Open 24 hours" },
  { id: "r2", name: "Max Pharmacy, Saket", kind: "pharmacy", pos: [28.527, 77.212], hours: "8 AM – 2 AM" },
  { id: "r3", name: "Wellness Pharmacy, Nehru Place", kind: "pharmacy", pos: [28.549, 77.251], hours: "Open 24 hours" },
  { id: "r4", name: "Guardian Chemist, Kalkaji", kind: "pharmacy", pos: [28.542, 77.256], hours: "Open 24 hours" },
  { id: "c1", name: "Night Owl Café, Hauz Khas Village", kind: "cafe", pos: [28.5535, 77.194], hours: "Open 24 hours" },
  { id: "c2", name: "Chai Junction, Nehru Place", kind: "cafe", pos: [28.55, 77.2525], hours: "Open 24 hours" },
  { id: "c3", name: "Brew Stop, Okhla Phase III", kind: "cafe", pos: [28.544, 77.269], hours: "Open 24 hours" },
];

// Two hand-drawn routes for the default demo pair (Hauz Khas Metro → IIIT-Delhi).
export const ROUTE_WAYPOINTS = {
  fastest: [[28.5433, 77.2066], [28.537, 77.226], [28.5395, 77.246], [28.54, 77.264], [28.5459, 77.2732]] as LatLng[],
  safer: [[28.5433, 77.2066], [28.546, 77.22], [28.5487, 77.234], [28.5494, 77.253], [28.5546, 77.2649], [28.5459, 77.2732]] as LatLng[],
};

export const ROUTE_INFO = {
  fastest: { label: "Fastest", minutes: 12, km: 7.1, lighting: 48, footTraffic: 41, incidents: 6, helpPoints: 4, note: "Outer Ring Road stretch past Chirag Delhi is poorly lit after 9 PM." },
  safer: { label: "Safer", minutes: 15, km: 7.9, lighting: 86, footTraffic: 78, incidents: 1, helpPoints: 9, note: "Passes GK-1 market and Nehru Place — well-lit, more foot traffic." },
};

export const DEFAULT_ZONES: SafeZone[] = [
  { id: "z-home", name: "Home", pos: [28.5487, 77.234], radius: 350 },
  { id: "z-hostel", name: "Hostel", pos: [28.5546, 77.2649], radius: 300 },
  { id: "z-college", name: "College", pos: [28.5459, 77.2732], radius: 320 },
];

export const RISK_SCENARIOS: RiskScenario[] = [
  {
    id: "deviation",
    score: 58,
    title: "Route changed",
    reason: "You've moved about 0.8 km off your planned route near Chirag Delhi. This could just be a detour — we're keeping watch.",
    confidence: "Medium",
    signals: { deviation: 22, stopMin: 0, areaScore: 6.1, checkinMissed: false },
  },
  {
    id: "false-alarm",
    score: 31,
    title: "Long stop — probably a traffic signal",
    reason: "You've been stopped for 2 minutes at the Outer Ring Road signal. Plenty of people are around and this matches normal traffic. We're not confident anything is wrong.",
    confidence: "Low",
    falseAlarm: true,
    signals: { deviation: 3, stopMin: 2, areaScore: 7.4, checkinMissed: false },
  },
  {
    id: "high",
    score: 84,
    title: "Unusual stop off your route",
    reason: "Your route changed from the planned path and you've been stopped for 4 minutes near an area with low foot traffic.",
    confidence: "High",
    signals: { deviation: 38, stopMin: 4, areaScore: 3.2, checkinMissed: false },
  },
];

export const MISSED_CHECKIN: RiskScenario = {
  id: "missed-checkin",
  score: 72,
  title: "Missed check-in",
  reason: "You didn't answer your last check-in and haven't moved in 3 minutes. We'll alert your contacts unless you tell us you're okay.",
  confidence: "Medium",
  signals: { deviation: 9, stopMin: 3, areaScore: 5.0, checkinMissed: true },
};

const H = 3600_000;
const D = 24 * H;

export function seedEvents(now: number): SafeEvent[] {
  return [
    { id: "e1", ts: now - 2 * H, type: "journey", title: "Hauz Khas Metro → IIIT-Delhi", detail: "Arrived on time via Safer route · 16 min", status: "completed", notified: ["Mom"] },
    { id: "e2", ts: now - 5 * H, type: "checkin", title: "Check-in answered", detail: "Replied “I'm safe” in 4s", status: "completed", notified: [] },
    { id: "e3", ts: now - 3 * D, type: "alert", title: "Long stop near Nehru Place", detail: "Risk 34 · marked as false alarm (traffic jam)", status: "false-alarm", notified: [] },
    { id: "e4", ts: now - 6 * D, type: "journey", title: "Saket → GK-1 M-Block Market", detail: "Arrived 3 min late · 2 check-ins", status: "completed", notified: ["Mom", "Priya"] },
    { id: "e5", ts: now - 12 * D, type: "sos", title: "SOS — shake gesture", detail: "Mom acknowledged in 48s · resolved by user", status: "resolved", notified: ["Mom", "Dad", "Priya"] },
    { id: "e6", ts: now - 19 * D, type: "zone", title: "Reached Hostel", detail: "Auto-update sent to trusted contacts", status: "completed", notified: ["Mom", "Dad"] },
    { id: "e7", ts: now - 27 * D, type: "alert", title: "Route deviation on Outer Ring Road", detail: "Risk 61 · user replied “I'm safe”", status: "resolved", notified: [] },
    { id: "e8", ts: now - 38 * D, type: "sos", title: "SOS — missed check-in", detail: "Priya didn't respond · escalated to Campus Security", status: "escalated", notified: ["Mom", "Dad", "Priya", "Campus Security"] },
    { id: "e9", ts: now - 51 * D, type: "journey", title: "Rajiv Chowk Metro → Khan Market", detail: "Arrived on time · 22 min", status: "completed", notified: ["Dad"] },
    { id: "e10", ts: now - 64 * D, type: "fall", title: "Possible fall detected", detail: "Answered “I'm okay” in 6s", status: "cancelled", notified: [] },
  ];
}

export function seedPosts(now: number): Post[] {
  return [
    { id: "c1", ts: now - 2 * H, author: "Riya K.", area: "Noida Sector 18 Metro", text: "Poor lighting near Sector 18 metro gate 3 — two streetlights out since Sunday. Use gate 1 after dark.", tone: "negative", helpful: 24 },
    { id: "c2", ts: now - 5 * H, author: "Meher S.", area: "Okhla Phase III", text: "Helpful auto driver on route to IIIT-D — waited till I was inside the gate. Plate ends in 4471.", tone: "positive", helpful: 31 },
    { id: "c3", ts: now - 7 * H, author: "Anonymous", area: "Chirag Delhi flyover", text: "Construction barricades on the service lane, footpath is blocked. You have to walk on the road for ~200 m.", tone: "negative", helpful: 12 },
    { id: "c4", ts: now - 10 * H, author: "Tanvi R.", area: "GK-1 M-Block Market", text: "Market is busy till 11 PM on weekdays, lots of families. Felt comfortable walking to the metro.", tone: "positive", helpful: 18 },
    { id: "c5", ts: now - 14 * H, author: "Sana A.", area: "Nehru Place", text: "New police PCR van parked near the bus stop most evenings now.", tone: "neutral", helpful: 9 },
    { id: "c6", ts: now - 1 * D, author: "Anonymous", area: "Kalkaji Mandir Metro", text: "Group of men loitering near exit 2 around 10 PM, passing comments. Reported to metro staff.", tone: "negative", helpful: 41 },
    { id: "c7", ts: now - 1 * D - 6 * H, author: "Ishita M.", area: "Hauz Khas Village", text: "Night Owl Café staff let me wait inside for my cab even after closing the kitchen. Really kind.", tone: "positive", helpful: 27 },
    { id: "c8", ts: now - 2 * D, author: "Pooja V.", area: "Lajpat Nagar Central Market", text: "Market lanes get very crowded on Saturdays — keep your bag in front. No major issues otherwise.", tone: "neutral", helpful: 7 },
    { id: "c9", ts: now - 3 * D, author: "Anonymous", area: "JNU Main Gate", text: "Bus stop shelter light is fixed now. Much better than last month.", tone: "positive", helpful: 15 },
    { id: "c10", ts: now - 4 * D, author: "Kavya N.", area: "DLF CyberHub", text: "Cab pickup zone moved to the back lane, which is darker. Ask for drop at the front entrance instead.", tone: "negative", helpful: 20 },
    { id: "c11", ts: now - 5 * D, author: "Aditi P.", area: "Botanical Garden Metro", text: "Women-only e-rickshaw queue started at exit 4 in the evenings. Worked well for me.", tone: "positive", helpful: 33 },
    { id: "c12", ts: now - 6 * D, author: "Neha G.", area: "Connaught Place", text: "Inner Circle is fine till late but the radial roads near Block F get empty after 10 PM.", tone: "neutral", helpful: 11 },
  ];
}

export type QA = { id: string; keywords: Record<Lang, string[]>; a: Record<Lang, string> };

// {lastAlert}, {viewers} and {safeWord} are filled in at reply time.
export const QA_PAIRS: QA[] = [
  {
    id: "explain",
    keywords: { en: ["last alert", "explain", "why", "alert"], hi: ["अलर्ट", "पिछला", "क्यों", "समझा"], bn: ["সতর্ক", "শেষ", "কেন", "অ্যালার্ট"] },
    a: {
      en: "Your last alert: {lastAlert}. I flag patterns, not certainties — if it was a false alarm, tap “I'm safe” and I'll treat that stretch as normal next time.",
      hi: "आपका पिछला अलर्ट: {lastAlert}। मैं पैटर्न देखकर चेतावनी देती हूँ, यह पक्का नहीं होता — अगर यह गलत अलार्म था तो “मैं सुरक्षित हूँ” दबाएँ।",
      bn: "আপনার শেষ সতর্কতা: {lastAlert}। আমি প্যাটার্ন দেখে সতর্ক করি, নিশ্চিত হয়ে নয় — ভুল সতর্কতা হলে “আমি নিরাপদ” চাপুন।",
    },
  },
  {
    id: "tracking",
    keywords: { en: ["tracking", "who is", "sharing", "location", "watching"], hi: ["कौन", "ट्रैक", "लोकेशन", "देख"], bn: ["কে", "ট্র্যাক", "লোকেশন", "দেখছে"] },
    a: {
      en: "Right now these people can see your live location: {viewers}. You can stop sharing anytime from the Map screen.",
      hi: "अभी ये लोग आपकी लाइव लोकेशन देख सकते हैं: {viewers}। आप मैप स्क्रीन से कभी भी शेयरिंग बंद कर सकती हैं।",
      bn: "এখন এঁরা আপনার লাইভ লোকেশন দেখতে পাচ্ছেন: {viewers}। ম্যাপ স্ক্রিন থেকে যেকোনো সময় শেয়ারিং বন্ধ করতে পারেন।",
    },
  },
  {
    id: "safeword",
    keywords: { en: ["safe word", "safeword", "code word", "change word"], hi: ["सेफ वर्ड", "शब्द", "कोड"], bn: ["সেফ ওয়ার্ড", "শব্দ", "কোড"] },
    a: {
      en: "Your safe word is “{safeWord}”. Change it in Settings → Safety. With Voice SOS on, saying it sends an alert — and it's the key to your Evidence Vault.",
      hi: "आपका सेफ वर्ड “{safeWord}” है। इसे सेटिंग्स → सेफ्टी में बदलें। वॉइस SOS चालू हो तो इसे बोलने पर अलर्ट जाता है, और इसी से एविडेंस वॉल्ट खुलता है।",
      bn: "আপনার সেফ ওয়ার্ড “{safeWord}”। সেটিংস → সেফটি থেকে বদলান। ভয়েস SOS চালু থাকলে এটি বললেই সতর্কবার্তা যায়, আর এটি দিয়েই এভিডেন্স ভল্ট খোলে।",
    },
  },
  {
    id: "numbers",
    keywords: { en: ["emergency", "number", "helpline", "112", "police"], hi: ["नंबर", "हेल्पलाइन", "आपात", "पुलिस"], bn: ["নম্বর", "হেল্পলাইন", "জরুরি", "পুলিশ"] },
    a: {
      en: "India emergency numbers: 112 (all emergencies), 1091 (women helpline), 181 (women in distress), 100 (police), 108 (ambulance). SafeHer does not call these for you — please dial directly.",
      hi: "भारत के आपातकालीन नंबर: 112 (सभी आपात स्थितियाँ), 1091 (महिला हेल्पलाइन), 181 (संकट में महिलाएँ), 100 (पुलिस), 108 (एम्बुलेंस)। SafeHer इन्हें आपके लिए कॉल नहीं करता — कृपया सीधे डायल करें।",
      bn: "ভারতের জরুরি নম্বর: 112 (সব জরুরি অবস্থা), 1091 (মহিলা হেল্পলাইন), 181 (বিপদে মহিলা), 100 (পুলিশ), 108 (অ্যাম্বুলেন্স)। SafeHer আপনার হয়ে এগুলিতে কল করে না — সরাসরি ডায়াল করুন।",
    },
  },
  {
    id: "sos",
    keywords: { en: ["sos", "how does", "panic", "trigger"], hi: ["sos", "एसओएस", "कैसे"], bn: ["sos", "এসওএস", "কিভাবে"] },
    a: {
      en: "Hold the SOS button for 2 seconds, shake your phone, say “help me”, or press Ctrl+Shift+S. Your trusted contacts get your live location, and if someone doesn't respond in 20 seconds we escalate to the next person.",
      hi: "SOS बटन 2 सेकंड दबाकर रखें, फ़ोन हिलाएँ, “help me” बोलें या Ctrl+Shift+S दबाएँ। आपके भरोसेमंद लोगों को लाइव लोकेशन मिलती है, और 20 सेकंड में जवाब न मिले तो अगले व्यक्ति तक बात पहुँचती है।",
      bn: "SOS বোতাম 2 সেকেন্ড চেপে ধরুন, ফোন ঝাঁকান, “help me” বলুন বা Ctrl+Shift+S চাপুন। আপনার বিশ্বস্তরা লাইভ লোকেশন পান, আর 20 সেকেন্ডে কেউ সাড়া না দিলে পরের জনকে জানানো হয়।",
    },
  },
  {
    id: "fakecall",
    keywords: { en: ["fake call", "call me", "escape", "awkward"], hi: ["फेक कॉल", "कॉल"], bn: ["ফেক কল", "কল"] },
    a: {
      en: "Open Quick actions (the lightning button) and tap “Call Mom in 30 sec”. A realistic incoming call will ring so you have a reason to step away.",
      hi: "क्विक एक्शन (बिजली वाला बटन) खोलें और “30 सेकंड में मम्मी का कॉल” दबाएँ। एक असली जैसा कॉल आएगा ताकि आप वहाँ से निकल सकें।",
      bn: "কুইক অ্যাকশন (বিদ্যুৎ চিহ্নের বোতাম) খুলে “30 সেকেন্ডে মায়ের কল” চাপুন। একটি আসল-সদৃশ কল আসবে, যাতে আপনি সরে যেতে পারেন।",
    },
  },
  {
    id: "route",
    keywords: { en: ["route", "safer", "path", "road", "lit"], hi: ["रास्ता", "रूट", "सड़क"], bn: ["রাস্তা", "রুট", "পথ"] },
    a: {
      en: "On the Map, compare Fastest vs Safer. The Safer route scores higher on lighting and foot traffic and passes more help points. It's based on sample data — please verify with local sources.",
      hi: "मैप पर “सबसे तेज़” और “ज़्यादा सुरक्षित” रास्ते की तुलना करें। सुरक्षित रास्ते पर रोशनी और लोगों की आवाजाही ज़्यादा है। यह सैंपल डेटा पर आधारित है — स्थानीय स्रोतों से पुष्टि करें।",
      bn: "ম্যাপে “দ্রুততম” আর “নিরাপদ” রুট তুলনা করুন। নিরাপদ রুটে আলো ও মানুষের চলাচল বেশি। এটি নমুনা ডেটার ভিত্তিতে — স্থানীয় সূত্রে যাচাই করুন।",
    },
  },
  {
    id: "shake",
    keywords: { en: ["shake"], hi: ["हिला"], bn: ["ঝাঁক"] },
    a: {
      en: "Shake your phone hard 3 times to send an SOS. On a laptop, use “Simulate shake” on the SOS screen.",
      hi: "SOS भेजने के लिए फ़ोन को 3 बार ज़ोर से हिलाएँ। लैपटॉप पर SOS स्क्रीन में “शेक सिम्युलेट करें” दबाएँ।",
      bn: "SOS পাঠাতে ফোনটি জোরে 3 বার ঝাঁকান। ল্যাপটপে SOS স্ক্রিনে “শেক সিমুলেট করুন” চাপুন।",
    },
  },
  {
    id: "voice",
    keywords: { en: ["voice", "speak", "listen", "help me"], hi: ["आवाज़", "बोल"], bn: ["ভয়েস", "কণ্ঠ", "বল"] },
    a: {
      en: "Turn on Voice SOS on the SOS screen. While it's listening, saying “help me” or your safe word sends an alert. Listening only happens while that screen is open.",
      hi: "SOS स्क्रीन पर वॉइस SOS चालू करें। सुनते समय “help me” या आपका सेफ वर्ड बोलने पर अलर्ट चला जाता है। यह सिर्फ़ तभी सुनता है जब वह स्क्रीन खुली हो।",
      bn: "SOS স্ক্রিনে ভয়েস SOS চালু করুন। শোনার সময় “help me” বা আপনার সেফ ওয়ার্ড বললেই সতর্কবার্তা যায়। শুধু ওই স্ক্রিন খোলা থাকলেই এটি শোনে।",
    },
  },
  {
    id: "evidence",
    keywords: { en: ["evidence", "recording", "record", "vault"], hi: ["रिकॉर्ड", "सबूत", "वॉल्ट"], bn: ["রেকর্ড", "প্রমাণ", "ভল্ট"] },
    a: {
      en: "When an SOS fires, SafeHer starts an audio recording. After the alert ends it's saved to History as a locked card — only your safe word opens it.",
      hi: "SOS चलते ही SafeHer ऑडियो रिकॉर्डिंग शुरू करता है। अलर्ट खत्म होने पर यह हिस्ट्री में लॉक कार्ड के रूप में सेव होती है — सिर्फ़ आपका सेफ वर्ड इसे खोलता है।",
      bn: "SOS চালু হলেই SafeHer অডিও রেকর্ডিং শুরু করে। সতর্কতা শেষ হলে এটি হিস্ট্রিতে লক করা কার্ড হিসেবে থাকে — শুধু আপনার সেফ ওয়ার্ডেই খোলে।",
    },
  },
  {
    id: "zones",
    keywords: { en: ["zone", "home", "hostel", "geofence", "reached"], hi: ["ज़ोन", "जोन", "घर", "हॉस्टल"], bn: ["জোন", "বাড়ি", "হোস্টেল"] },
    a: {
      en: "Safe Zones are places like Home, Hostel and College. When you enter or leave one during a journey, your contacts get an automatic update like “Anand reached Home ✓”. Add zones in Settings.",
      hi: "सेफ ज़ोन जैसे घर, हॉस्टल और कॉलेज। सफ़र के दौरान इनमें आने-जाने पर आपके लोगों को अपने आप संदेश जाता है, जैसे “Anand घर पहुँच गईं ✓”। ज़ोन सेटिंग्स में जोड़ें।",
      bn: "সেফ জোন যেমন বাড়ি, হোস্টেল, কলেজ। যাত্রার সময় এগুলিতে ঢুকলে বা বেরোলে আপনার পরিচিতরা স্বয়ংক্রিয় বার্তা পান, যেমন “Anand বাড়ি পৌঁছেছেন ✓”। সেটিংসে জোন যোগ করুন।",
    },
  },
  {
    id: "network",
    keywords: { en: ["network", "offline", "signal", "internet", "sms"], hi: ["नेटवर्क", "सिग्नल", "इंटरनेट"], bn: ["নেটওয়ার্ক", "সিগন্যাল", "ইন্টারনেট"] },
    a: {
      en: "On a weak network, alerts are queued and retried, and SMS becomes the fallback because it needs the least signal. You can preview this with the “Weak network” toggle on the Dashboard.",
      hi: "कमज़ोर नेटवर्क पर अलर्ट कतार में रहते हैं और दोबारा भेजे जाते हैं, और SMS बैकअप बन जाता है क्योंकि उसे सबसे कम सिग्नल चाहिए। डैशबोर्ड पर “कमज़ोर नेटवर्क” टॉगल से इसे देखें।",
      bn: "দুর্বল নেটওয়ার্কে সতর্কবার্তা সারিতে থাকে ও আবার পাঠানো হয়, আর SMS বিকল্প হয়ে যায় কারণ তাতে সবচেয়ে কম সিগন্যাল লাগে। ড্যাশবোর্ডে “দুর্বল নেটওয়ার্ক” টগল দিয়ে দেখুন।",
    },
  },
];

export const QA_FALLBACK: Record<Lang, string> = {
  en: "I'm not sure about that one yet. Try asking about your last alert, who's tracking you, safer routes, or emergency numbers.",
  hi: "इस बारे में मुझे अभी पक्का नहीं पता। पिछला अलर्ट, कौन ट्रैक कर रहा है, सुरक्षित रास्ते या आपातकालीन नंबर के बारे में पूछें।",
  bn: "এ বিষয়ে আমি এখনও নিশ্চিত নই। শেষ সতর্কতা, কে ট্র্যাক করছে, নিরাপদ রুট বা জরুরি নম্বর নিয়ে জিজ্ঞাসা করুন।",
};
