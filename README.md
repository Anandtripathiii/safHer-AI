# SafeHer AI

A women's safety web app built for a hackathon (Problem Statement 4). Everything is interactive, and **all data is synthetic**. The only backend is optional Supabase sync (see Setup). It never sends a real SMS, never places a real call and never polls your location. The app does not guarantee anyone's safety. In a real emergency in India, dial **112**.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm test           # simulation + assistant logic self-checks (Node 22.6+)
```

### Database (optional)

1. Create a free project at supabase.com and run `supabase/schema.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
3. Restart `npm run dev` — contacts, journeys, SOS events, safe places and community reports now sync to Supabase (without the vars, everything stays in `localStorage`).

There's no login. The app starts as the seeded user **Anand Tripathi (Delhi NCR)**. Every change is saved to `localStorage` under the key `safeher`. To get the original sample data back, use **Settings → Demo data → Reset & reseed**.

## Stack

Next.js 14 (App Router) + TypeScript, Tailwind CSS, shadcn/ui primitives (`Switch`, `Sheet`, in `components/ui`), Framer Motion, react-leaflet with OpenStreetMap tiles (no API key), Zustand with `persist`, Lucide icons, Sonner toasts and jsPDF (police report, loaded only when used). Voice SOS uses the Web Speech API, shake uses DeviceMotion, and sounds are generated with Web Audio, so the repo ships no audio files.

**Browser APIs that read real data, only on the website:**
- `navigator.getBattery` shows a battery pill and low-battery banners (Chrome and Android only).
- `navigator.geolocation` runs once, only when you tap "Use my location". Coordinates are never written to storage.

Everything on `/phone-demo` is simulated.

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
| `/sos` | Dark screen with a 2-second press-and-hold button and countdown ring, Shake-to-SOS plus "Simulate shake", and Voice SOS that starts listening on open ("Listening for: …" your safe word, default `pineapple`) |
| `/assistant` | Chat in English, हिन्दी and বাংলা: 12 scripted Q&A pairs, keyword-matched, with a typing delay and quick-reply chips |
| `/dashboard` | Overview cards, live timeline, delivery rates for SMS, Push and In-app, a Weak network toggle, and "Cancel false alarm" |
| `/contacts` | Add, edit and remove trusted contacts, and mark escalation contacts |
| `/community` | Feed of nearby reports with a post form, tone filter and "Helpful" votes |
| `/history` | Journeys, alerts and SOS events, filterable by month and type, plus the Evidence Vault (unlocks with your safe word) |
| `/settings` | Safe word, fall detection (beta), safe places (address autocomplete), fake-call caller and delay, language, theme, demo mode, reset |
| `/phone-demo` | A simulated phone running the SafeHer app, with Mom's and Priya's live views and a **Judge controls** panel (see below) |

The account menu (the "AN" avatar) links to Contacts, Community, History and Settings. It also has an English / हिन्दी / বাংলা switch, which changes the navbar, buttons and toasts on every page, not just the assistant.

### Website features added later
- **Two route cards on `/journey`.** Fastest and Safer sit side by side with lighting, foot-traffic and 30-day-incident chips. After 7 PM, or with the Judge "Night" toggle, Safer is the default and Fastest carries a "Not recommended after dark" warning.
- **Safe places + auto-minimize.** When a journey arrives at a safe place that is its destination, a 10-second countdown runs, then the navbar collapses into a pulsing "SafeHer running" bubble (click it to restore). Passing *through* a safe place only sends the update to contacts.
- **Imported contacts + favourites.** Import 12 sample contacts and star up to 5. Favourites are alerted first in every SOS, on the website and on the phone.
- **Police report PDF.** On `/history`, every resolved SOS has a "Police report (PDF)" button. It produces a complaint-style document with timestamp, GPS trail, battery level, contacts notified with their response, outcome and a SHA-256 integrity hash. It is watermarked as sample data.

## Phone demo (`/phone-demo`)

A 390×844 phone frame running a phone-sized SafeHer with its own simulated world. Its state is saved separately, under `safeher-phone`.

| Screen | What works |
|---|---|
| Home | Location pill ("Delhi NCR • Updated 2s ago"), **Where to?** autocomplete leading to the Fastest vs Safer sheet and Start Safe Journey, safe-place chips, the **I'm being followed** button, battery and favourites cards |
| Map | Live route with the moving blue dot, safe-place circles, arrival |
| SOS | 2-second hold, favourites-first coordination feed, spoken "Alert sent to N people", **decoy "phone dying" screen** |
| Contacts | Native-style permission prompt, 12 phone contacts, ★ up to 5 favourites, favourites dialer |
| Profile | Safe places, Do Not Disturb (SafeHer alerts still come through), phone dark mode, **Disguise as Calculator**, Lock phone |

Other things to try:
- **Long-press the Home tab** for quick-dial.
- **Tap or swipe down the status bar** for the notification shade.
- **Triple-tap anywhere, or hold the side button for 2 seconds,** for a **silent SOS**.
- **Type `911=` in the disguise calculator** to open SafeHer.

**Judge controls:**
- **Battery:** slider. Below 20% shows a power-saver banner; below 10% shows the critical banner and the last location auto-sends.
- **Location:** teleport to Home, College, Market, Metro or an unsafe area.
- **Network:** 5G, 3G (SMS fallback) or no signal (alerts queue).
- **Time:** Day or Night (changes route scores and the default route).
- **Reset prompts:** brings back the permission prompts.
- **Scenarios:** Walk home at night, Low battery emergency, Reach home safely, Lost route, Took a cab (number-plate scan), and Silent SOS.

A live state line shows what the phone is hiding, for example a silent SOS.

## How the simulation works

- `lib/seed.ts` holds all synthetic data: the user, 4 contacts, 21 landmarks, 15 help points, 10 past events, 12 community posts, 12 Q&A pairs × 3 languages, and the risk scenarios.
- `lib/simulation.ts` has pure logic: route interpolation, the blue-dot position, and the SOS coordination script. Everything is derived from timestamps, so a page refresh mid-demo picks up exactly where it was.
- `lib/store.ts` is the Zustand store, persisted to `localStorage`.
- `lib/phone-state.ts` and `components/phone/PhoneEngine.tsx` do the same job for the phone demo: journey movement, safe-place auto-minimize, cab detection and the location heartbeat. They reuse `lib/simulation.ts`.
- `components/Engine.tsx` runs a 1-second tick that moves the journey, fires up to 3 automatic risk signals per journey (10–15 seconds apart), prompts check-ins, runs the 60-second escalation and 15-second fall countdowns, and posts safe-zone enter/leave updates. It also handles the global shortcuts.

**SOS coordination script.** Contacts take roles by their order in the list. The 1st delivers, is viewed about 3s later and acknowledges "On my way" about 5s after that. The 2nd views and then acknowledges. The 3rd never replies, so after 20 seconds the alert escalates to the escalation contact (Campus Security), who acknowledges "Guard dispatched". With a weak network, push fails first, alerts queue, and delivery arrives about 4 seconds later over SMS.
