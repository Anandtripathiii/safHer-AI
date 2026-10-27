// Synthesised with Web Audio so we ship no audio files.
let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)());

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
