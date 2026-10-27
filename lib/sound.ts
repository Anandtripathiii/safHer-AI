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

/** A ~15 second "voice clip" for the fake call, spoken by the browser's speech engine. */
export function playCallerVoice(name: string) {
  const s = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!s) return () => {};
  const lines = [
    `Hello beta? Haan, it's ${name}.`,
    "Where are you right now? I'm waiting near the gate.",
    "Okay, okay. Just stay on the phone with me, I'll come and pick you up.",
    "Tell me when you can see the main road. I'm leaving now.",
  ];
  s.cancel();
  for (const l of lines) {
    const u = new SpeechSynthesisUtterance(l);
    u.lang = "en-IN";
    u.rate = 0.95;
    u.pitch = 1.1;
    s.speak(u);
  }
  return () => s.cancel();
}

/** Spoken confirmation, so she knows the alert went out without looking at the screen. */
export function speak(text: string, lang = "en-IN") {
  const s = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!s) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 1;
  s.speak(u);
}
