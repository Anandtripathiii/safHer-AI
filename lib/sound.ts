// Synthesised with Web Audio so we ship no audio files.
let ctx: AudioContext | null = null;
const ac = () => {
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

// 44-byte silent WAV: playing it inside a tap unlocks HTMLAudioElement playback on iOS/Android.
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
let unlocked = false;

export const audioUnlocked = () => {
  if (unlocked) return true;
  try { return sessionStorage.getItem("safeher-audio") === "1"; } catch { return false; }
};

/**
 * Mobile browsers only allow sound after a user gesture. Call this from a tap:
 * it primes the audio element, Web Audio (chime, ringtone) and speech (voice confirmation, fake call).
 */
export function unlockAudio() {
  try { const el = new Audio(SILENT_WAV); el.volume = 0; void el.play().catch(() => {}); } catch {}
  try {
    const a = ac();
    const src = a.createBufferSource();
    src.buffer = a.createBuffer(1, 1, 22050);
    src.connect(a.destination);
    src.start(0);
  } catch {}
  try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; window.speechSynthesis?.speak(u); } catch {}
  unlocked = true;
  try { sessionStorage.setItem("safeher-audio", "1"); } catch {}
}

function tone(freq: number, start: number, dur: number, gain = 0.08) {
  const a = ac();
  const o = a.createOscillator(), g = a.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

export function alertChime() {
  try {
    tone(660, 0, 0.35);
    tone(880, 0.18, 0.45);
    tone(990, 0.4, 0.6);
  } catch {}
}

/** Two-tone phone ring, repeating until the returned stop() is called. */
export function startRingtone() {
  const ring = () => {
    try {
      for (let i = 0; i < 8; i++) { tone(480, i * 0.1, 0.09, 0.06); tone(620, i * 0.1 + 0.05, 0.05, 0.05); }
    } catch {}
  };
  ring();
  const id = setInterval(ring, 2600);
  return () => clearInterval(id);
}

// ---------- Voices ----------
// Malenia (assistant) and the fake caller use two different female voices where the device has them.

const FEMALE_NAMES: Record<string, string[]> = {
  en: ["heera", "neerja", "veena", "priya", "google uk english female", "aria", "zira", "samantha", "female"],
  hi: ["kalpana", "swara", "google हिन्दी", "lekha", "female"],
  bn: ["google বাংলা", "tanishaa", "female"],
};
const LANG_ORDER: Record<string, string[]> = { en: ["en-in", "en-gb", "en"], hi: ["hi-in", "hi"], bn: ["bn-in", "bn"] };

/** Voices load asynchronously; wait for `voiceschanged` (max 1.5 s). */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const s = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!s) return Promise.resolve([]);
  const now = s.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => { s.removeEventListener("voiceschanged", done); resolve(s.getVoices()); };
    s.addEventListener("voiceschanged", done);
    setTimeout(done, 1500);
  });
}

const isFemale = (v: SpeechSynthesisVoice) => /female/i.test(v.name) || (v as unknown as { gender?: string }).gender === "female";

/** Best female voice for a language, skipping `except`: name priority first, then any voice marked female. */
export function pickFemaleVoice(voices: SpeechSynthesisVoice[], langCode: string, except?: SpeechSynthesisVoice | null) {
  const base = langCode.slice(0, 2).toLowerCase();
  const order = LANG_ORDER[base] ?? [base];
  const rank = (v: SpeechSynthesisVoice) => order.findIndex((o) => v.lang.toLowerCase().replace("_", "-").startsWith(o));
  const inLang = voices.filter((v) => v !== except && rank(v) >= 0).sort((x, y) => rank(x) - rank(y));
  for (const hint of FEMALE_NAMES[base] ?? ["female"]) {
    const hit = inLang.find((v) => v.name.toLowerCase().includes(hint));
    if (hit) return hit;
  }
  return inLang.find(isFemale) ?? voices.find((v) => v !== except && isFemale(v)) ?? null;
}

let assistantVoice: SpeechSynthesisVoice | null = null;
type Role = "assistant" | "caller";

async function voiceFor(role: Role, langCode: string) {
  const voices = await loadVoices();
  const mine = pickFemaleVoice(voices, langCode);
  if (role === "assistant") {
    assistantVoice = mine;
    if (!mine) console.warn(`[SafeHer] No female voice for ${langCode} on this device — using the default voice.`);
    return mine ? { voice: mine, rate: 0.95, pitch: 0.9 } : { voice: null, rate: 0.95, pitch: 0.85 };
  }
  // Caller: a different female voice from Malenia's when the device has one; otherwise reshape the same voice.
  const malenia = assistantVoice ?? mine;
  const other = pickFemaleVoice(voices, langCode, malenia);
  if (other && other !== malenia) return { voice: other, rate: 0.9, pitch: 1.0 };
  if (mine) return { voice: mine, rate: 1.0, pitch: 1.1 };
  console.warn(`[SafeHer] No female voice for ${langCode} on this device — fake call uses the default voice.`);
  return { voice: null, rate: 0.9, pitch: 0.85 };
}

async function say(role: Role, lines: string[], langCode: string) {
  const s = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!s) return;
  const { voice, rate, pitch } = await voiceFor(role, langCode);
  for (const l of lines) {
    const u = new SpeechSynthesisUtterance(l);
    u.lang = voice?.lang ?? langCode;
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    s.speak(u);
  }
}

/** A ~15 second "voice clip" for the fake call: a worried mother, not the assistant. */
export function playCallerVoice(name: string) {
  const s = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!s) return () => {};
  s.cancel();
  void say("caller", [
    `Hello beta? Haan, it's ${name}.`,
    "Where are you right now? I'm waiting near the gate.",
    "Okay, okay. Just stay on the phone with me, I'll come and pick you up.",
    "Tell me when you can see the main road. I'm leaving now.",
  ], "en-IN");
  return () => s.cancel();
}

/** Malenia's voice: spoken confirmations and assistant replies. */
export function speak(text: string, lang = "en-IN") {
  void say("assistant", [text], lang);
}
