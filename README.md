# SafeHer AI

A women's safety web app built for a hackathon (Problem Statement 4). Everything is interactive, and **all data is synthetic**. There is no backend. It never sends a real SMS, never places a real call and never polls your location. The app does not guarantee anyone's safety. In a real emergency in India, dial **112**.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm test           # simulation + assistant logic self-checks (Node 22.6+)
```

There's no login. The app starts as the seeded user **Anand Tripathi (Delhi NCR)**. Every change is saved to `localStorage` under the key `safeher`. To get the original sample data back, use **Settings → Demo data → Reset & reseed**.

## Stack

Next.js 14 (App Router) + TypeScript, Tailwind CSS, shadcn/ui primitives (`Switch`, `Sheet`, in `components/ui`), Framer Motion, react-leaflet with OpenStreetMap tiles (no API key), Zustand with `persist`, Lucide icons and Sonner toasts. Voice SOS uses the Web Speech API, shake uses DeviceMotion, and sounds are generated with Web Audio, so the repo ships no audio files.

## Demo flow

Start journey → simulated risk detected → verify or cancel → SOS fired → trusted contacts notified → acknowledged, or escalated to Campus Security.

See **[DEMO.md](DEMO.md)** for the scripted 2.5-minute walkthrough.

Turn on **Demo mode** (top-right switch, or `Ctrl+Shift+D`) before presenting:
- Journeys run 10× faster.
- A **DEMO** badge appears next to the logo.
- The **presenter panel** (bottom-left) can trigger a risk, a false alarm, a fall, a missed check-in, a check-in prompt or a fake call, and can switch the simulated network to weak.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + S` | Send SOS from any page |
| `Ctrl + Shift + D` | Toggle demo mode |
| `Ctrl + Shift + X` | Cancel the active alert as a false alarm (SOS, risk card or escalation) |
| `Ctrl + Shift + F` | Fake call rings now |
| `Ctrl + K` | Search screens and places |
| `Space` / `Enter` (hold) | Hold-to-confirm on the focused SOS button |
| `↑` `↓` `Enter` `Esc` | Navigate the From/To place autocomplete |
| `Esc` | Close drawers and dialogs |

## Routes

| Route | What it does |
|---|---|
| `/` | Calm landing page and onboarding, with a "Try the 2-minute demo" button |
| `/journey` | Safe Journey Mode: From/To autocomplete over 21 Delhi NCR landmarks, expected arrival, who to notify, progress bar, check-ins every 2 minutes, "Simulate fall" |
| `/map` | Live blue dot, "Shared with" viewers with live "last viewed" times, auto-stop countdown, Stop sharing, Fastest vs Safer routes with a score breakdown, 15 help points, safe-zone circles, live coordination feed during an SOS |
| `/sos` | Dark screen with a 2-second press-and-hold button and countdown ring, Shake-to-SOS plus "Simulate shake", and Voice SOS ("help me" or your safe word) |
| `/assistant` | Chat in English, हिन्दी and বাংলা: 12 scripted Q&A pairs, keyword-matched, with a typing delay and quick-reply chips |
| `/dashboard` | Overview cards, live timeline, delivery rates for SMS, Push and In-app, a Weak network toggle, and "Cancel false alarm" |
| `/contacts` | Add, edit and remove trusted contacts, and mark escalation contacts |
| `/community` | Feed of nearby reports with a post form, tone filter and "Helpful" votes |
| `/history` | Journeys, alerts and SOS events, filterable by month and type, plus the Evidence Vault (unlocks with your safe word) |
| `/settings` | Safe word, fall detection (beta), safe zones, fake-call caller and delay, language, theme, demo mode, reset |

The account menu (the "AN" avatar) links to Contacts, Community, History and Settings.

## How the simulation works

- `lib/seed.ts` holds all synthetic data: the user, 4 contacts, 21 landmarks, 15 help points, 10 past events, 12 community posts, 12 Q&A pairs × 3 languages, and the risk scenarios.
- `lib/simulation.ts` has pure logic: route interpolation, the blue-dot position, and the SOS coordination script. Everything is derived from timestamps, so a page refresh mid-demo picks up exactly where it was.
- `lib/store.ts` is the Zustand store, persisted to `localStorage`.
- `components/Engine.tsx` runs a 1-second tick that moves the journey, fires up to 3 automatic risk signals per journey (10–15 seconds apart), prompts check-ins, runs the 60-second escalation and 15-second fall countdowns, and posts safe-zone enter/leave updates. It also handles the global shortcuts.

**SOS coordination script.** Contacts take roles by their order in the list. The 1st delivers, is viewed about 3s later and acknowledges "On my way" about 5s after that. The 2nd views and then acknowledges. The 3rd never replies, so after 20 seconds the alert escalates to the escalation contact (Campus Security), who acknowledges "Guard dispatched". With a weak network, push fails first, alerts queue, and delivery arrives about 4 seconds later over SMS.
