# Extras beyond the spec

These were added on top of the brief to make SafeHer more useful for a woman walking home alone at night in Delhi. Every item below works in the demo. Nothing is a stub.

## Session 1: phone demo

| Extra | Where | What it does |
|---|---|---|
| Stress-first emergency UI | Phone + web | Emergency buttons are at least 56px with 18px bold text. A visible "haptic" shake on the phone, `navigator.vibrate` on the web, and a spoken "Alert sent to N people" so she doesn't have to look at the screen. |
| Disguise mode | Phone → Profile | The app opens as a working calculator (it really calculates). Typing `911=` reveals SafeHer. While disguised, no SafeHer toast or pink colour gives it away. |
| Silent SOS | Phone | Triple-tap anywhere, or hold the side button for 2s. No sound, no screen change. Contacts and Mom's view still see it. |
| Decoy "phone dying" screen | Phone → SOS | Shows "Shutting down…" and then a black screen while recording and sharing continue. Hold for 2s to return. |
| "I'm being followed" | Phone → Home | Different from SOS: quietly alerts contacts, starts recording, and re-routes to the nearest well-lit public place (police, metro, 24×7 café). |
| Walk with me | `/phone-demo` | A second, smaller phone shows Mom's live view of the same journey, including "Silent SOS — don't call". |
| Cab number-plate scan | Phone (Judge: "Took a cab") | A sudden speed jump brings up "did you take a cab?", then a mock camera, then the plate and photo are sent to the first favourite. |
| One-tap incident report | Phone, after a flagged journey | False alarm / Uncomfortable / Dangerous. The last two add an anonymous post to `/community`. |
| Night routing | Phone + web | After dark, Safer is the default route and Fastest shows a warning. Day/night visibly changes the scores. |
| Last location before shutdown | Phone | At 2% battery or less, the last known location is sent to favourites automatically. |

## Session 2: requested add-backs

| Extra | Where | What it does |
|---|---|---|
| Hindi / Bengali UI | Every page | A language switch in the account menu. Navbar, account menu, minimized bubble, risk card, check-in, escalation, fall check, SOS bar, quick actions, SOS/arrival/safe-place toasts, and the Journey, SOS and Dashboard headings and buttons are translated. |
| Group journey (Priya's view) | `/phone-demo` | Priya's phone sits beside Mom's and mirrors the same blue dot in real time. |
| Police report PDF | `/history` | Complaint-style PDF (jsPDF) addressed to the nearest police station: timestamp, GPS trail, battery level at the time of the SOS, persons notified with their responses, outcome, recording reference and a SHA-256 integrity hash. Every page is watermarked and footed as sample data, so it can't pass as an official document. |

Also tightened while building these:
- 56px risk-card buttons on the website.
- Settings reset now also resets the phone demo, so starred favourites can't change the scripted "Alert sent to 3 contacts".

## Skipped, with reasons

| Idea | Why it was skipped |
|---|---|
| "Check on me in 20 minutes" timer | Overlaps the existing 2-minute check-ins and the missed-check-in escalation. |
| Low-literacy mode (spoken labels on long-press) | Needs speech for every control in 3 languages. A partial version would be inconsistent. |
| Period / wellbeing-aware sharing | Sensitive health data. It needs real consent design, not a demo toggle. |
| Hostel warden check-in | Low demo value. The warden can already be imported and starred as a favourite. |
| Disguised contact names | Low visual value. Contacts can already be renamed in `/contacts`. |
| Full translation of every string | Kept to the common UI words; page bodies (Contacts, Community, History, Settings) and the phone screens are still English. |
