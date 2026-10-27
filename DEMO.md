# SafeHer AI: 2.5-minute demo script

**Before you start (off-screen)**
1. Open `http://localhost:3000`. Go to **Settings → Reset & reseed demo data**, then turn **Fall detection (beta)** on.
2. Turn **Demo mode** on with the top-right switch (or `Ctrl+Shift+D`). Check that the DEMO badge and the presenter panel are showing.
3. Unmute the laptop. The alert chime and the fake-call ringtone are part of the demo.
4. Go back to `/`.

---

### 0:00 – 0:15 · The pitch (landing)
> "Most safety apps are a panic button you hope you remember. SafeHer watches the trip with you, asks before it alarms anyone, and coordinates your people when it matters."

Point out the four trusted contacts on standby. Click **Start a safe journey**.

### 0:15 – 0:35 · Start the journey (`/journey`)
- From **Hauz Khas Metro** to **IIIT-Delhi** (pre-filled). Type "Neh" in a field to show the autocomplete, then press Esc.
- Leave Mom and Priya selected under "Who should know?" and click **Start journey**.
> "Live location is now shared. We check in every two minutes, and demo mode runs the trip ten times faster."

The progress bar starts moving. The pink circles on the map are safe zones. About 20 seconds in, the dot passes GK-1 and a toast says **"Anand reached Home ✓ — auto-update sent to Mom, Priya"**.

### 0:35 – 0:55 · Honest risk detection
- After about 10–15 seconds the first **Risk Card** slides in on its own ("Route changed", score 58). Click **Keep watching**.
- In the presenter panel, click **False alarm**. The card reads "Long stop — probably a traffic signal", score 31, low confidence, with a green note saying nothing was sent.
> "It tells you when it isn't sure. Judges, this matters: false alarms erode trust."

Click **I'm safe**.

### 0:55 – 1:20 · Real risk → SOS
- In the presenter panel, click **Trigger risk**. Score 84: *"Your route changed from the planned path and you've been stopped for 4 minutes near an area with low foot traffic."*
- Click **Why this alert?**. The drawer shows which signals fired: deviation 38%, a 4-minute stop, time of day, and area score 3.2/10, labelled as sample data. Close it.
- Click **Send SOS**.

What happens: the chime plays, a toast says "Alert sent to 3 contacts", and the app jumps to **live tracking** (`/map`). The red SOS bar shows **REC** with a running timer and waveform, because the evidence recording has started.

### 1:20 – 1:55 · Smart coordination (`/map`)
Narrate the live feed as it updates:
- "Sent to Mom ✓ delivered" → "Mom viewed your location" → **"Mom acknowledged: On my way"**
- Dad views, then acknowledges.
- Priya doesn't reply. At about 22 seconds a **"No response — escalating"** badge appears and **Campus Security** is alerted, then acknowledges "Guard dispatched".

Also point out the "Shared with" list ("last viewed 4s ago", updating live), the auto-stop countdown, and that Stop sharing is locked while an SOS is active.

### 1:55 – 2:10 · Resolve + evidence
- Click **I'm safe now** in the red bar. A toast says the recording was saved.
- Open **History** from the avatar menu. The new recording is a **locked** card. Click **Unlock with safe word**, type `blue umbrella`, and the waveform appears.

### 2:10 – 2:30 · Fast extras (pick two)
- **Dashboard:** flip **Weak network** on. Push and In-app drop to 41% and 22%, SMS takes over, and the queued-messages notice appears.
- **Fake call:** press `Ctrl+Shift+F`. A full-screen incoming call from Mom rings. Accept it and a short voice clip plays.
- **Assistant:** switch to **हिन्दी** and tap **"पिछला अलर्ट समझाएँ"**. The labels and the reply are both in Hindi.
- **Fall:** go back to Journey (start a new one if needed) and click **Simulate fall**. An "Are you okay?" prompt counts down 15 seconds, and if nobody answers it sends an SOS.

> "Everything you saw is synthetic data, and it doesn't contact real services. The flow is the product: detect, ask, alert, escalate."

---

**Recovery tips**
- Something stuck? Press `Ctrl+Shift+X` to cancel the active alert, or use **Settings → Reset**.
- A missed check-in starts a 60-second countdown, and it can be cancelled. To show it on demand, use **Missed check-in** in the presenter panel.
