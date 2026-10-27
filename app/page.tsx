"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BellRing, Route, UsersRound } from "lucide-react";
import { useApp } from "@/lib/store";
import LocationPill from "@/components/LocationPill";
import Logo from "@/components/Logo";

function Illustration() {
  return (
    <svg viewBox="0 0 360 380" className="h-auto w-full max-w-[360px]" role="img" aria-label="A phone showing a protected route home">
      <defs>
        <linearGradient id="blob" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--pink-soft))" />
          <stop offset="1" stopColor="rgb(var(--pink-strong))" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <path d="M70 60 C150 0 300 30 320 140 C340 250 270 350 160 345 C60 340 10 260 25 170 C35 115 40 85 70 60Z" fill="url(#blob)" opacity="0.7" />
      <rect x="105" y="45" width="150" height="290" rx="28" fill="rgb(var(--surface))" stroke="rgb(var(--line))" strokeWidth="2" />
      <rect x="117" y="62" width="126" height="200" rx="16" fill="rgb(var(--bg))" />
      <path d="M135 240 C150 200 200 215 190 175 C180 135 225 130 222 88" fill="none" stroke="rgb(var(--pink-strong))" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 10" />
      <circle cx="135" cy="240" r="8" fill="#2F7BF6" stroke="#fff" strokeWidth="3" />
      <circle cx="222" cy="86" r="16" fill="rgb(var(--pink-soft))" />
      <path d="M222 77 l8 3 v6 c0 5-3.5 8.5-8 10 c-4.5-1.5-8-5-8-10 v-6z" fill="rgb(var(--pink-strong))" />
      <rect x="125" y="276" width="110" height="38" rx="19" fill="rgb(var(--pink-strong))" />
      <text x="180" y="300" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff" fontFamily="var(--font-inter)">I'm safe</text>
      <g transform="translate(250 205)">
        <rect width="96" height="52" rx="14" fill="rgb(var(--surface))" stroke="rgb(var(--line))" />
        <circle cx="22" cy="26" r="11" fill="#E195AB" />
        <text x="22" y="30" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="var(--font-inter)">MT</text>
        <text x="40" y="23" fontSize="9" fontWeight="600" fill="rgb(var(--text))" fontFamily="var(--font-inter)">Mom</text>
        <text x="40" y="36" fontSize="8" fill="rgb(var(--success))" fontFamily="var(--font-inter)">viewing ✓</text>
      </g>
    </svg>
  );
}

const STEPS = [
  { icon: UsersRound, title: "Your people, ready", text: "Mom, Dad, Priya and Campus Security are already in your circle. Add or edit anytime." },
  { icon: Route, title: "Plan the way home", text: "Pick a destination and we suggest a well-lit route with more help points along it." },
  { icon: BellRing, title: "We watch quietly", text: "If something looks off, we ask you first. You decide whether anyone gets alerted." },
];

export default function Landing() {
  const router = useRouter();
  const { contacts, set } = useApp();
  const startDemo = () => { set({ demoMode: true }); router.push("/journey"); };

  return (
    <main className="mx-auto max-w-5xl px-5 pb-36 pt-32 md:pb-24 md:pt-40">
      <section className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr]">
        {/* Plain render: no JS-driven fade, so the headline paints immediately on slow phones. */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Logo className="text-[28px]" />
            <p className="text-sm font-medium text-pink-strong">Good evening, Anand</p>
            <LocationPill />
          </div>
          <h1 className="mt-4 font-serif text-[44px] leading-[1.05] tracking-tight text-ink md:text-[64px]">
            Get home feeling <em className="text-pink-strong">looked after</em>.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
            SafeHer keeps an eye on your trip, checks in gently, and lets the people you trust know when something seems wrong.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/journey" className="btn-primary h-12 px-6">Start a safe journey <ArrowRight size={18} /></Link>
            <button onClick={startDemo} className="btn-secondary h-12 px-6">Try the 2-minute demo</button>
          </div>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {contacts.slice(0, 4).map((c) => (
                <span key={c.id} className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg text-xs font-semibold text-white" style={{ background: c.color }}>{c.initials}</span>
              ))}
            </div>
            <p className="text-sm text-muted">{contacts.length} trusted contacts on standby</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Illustration />
        </div>
      </section>

      <section className="mt-28 md:mt-36">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted">How it works</h2>
        <ol className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pink-soft/70 text-pink-strong"><s.icon size={24} /></span>
                <span className="text-sm text-muted">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-24 max-w-2xl text-sm leading-relaxed text-muted">
        SafeHer is a hackathon prototype. Everyone and everything you see here is sample data — it does not contact real people or emergency services, and no app can guarantee safety.
        In an emergency in India, dial <b className="text-ink">112</b>.
      </p>
    </main>
  );
}
