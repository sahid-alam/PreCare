# Demo Scenarios

Three scripted scenarios for the stage demo. Rehearse each one until you can hit the beats from muscle memory. Order matters — open mild, escalate, finish with the showstopper.

## Scenario 1 — Home Care

**Patient script (you say):**
> I've had a runny nose and a mild headache for about two days. No fever, no cough. I'm eating and sleeping fine.

**Expected AI behavior:**
- Asks about fever, cough, fatigue
- Asks about chronic conditions
- Asks one or two red-flag screening questions (chest pain? difficulty breathing?)
- Calls `log_symptom` for each finding
- Calls `submit_triage_assessment` with `tier: "home"`
- Reads out: "This sounds like a mild viral upper respiratory infection. Rest, fluids, and over-the-counter symptom relief. See a doctor if you develop a fever above 101°F, your symptoms persist beyond 5-7 days, or you develop new chest or breathing problems."

**Dashboard expectations:**
- 2-3 symptom cards appear
- RiskMeter ends green
- ClassificationCard shows "Home Care"

**What to point to during demo:** the calm, structured interview style. "Notice it asked about fever and chest symptoms even though I didn't bring them up — that's the red-flag screening firing."

---

## Scenario 2 — Clinic Visit

**Patient script:**
> I have a really sore throat with white patches on my tonsils. My temperature is 101.2 and I've had it for three days. Swallowing is painful.

**Expected AI behavior:**
- Asks about onset, fever trend, ability to drink fluids
- Asks about neck stiffness, breathing, swelling (rules out epiglottitis / quinsy)
- Asks one or two cardiac/neuro screening questions
- Calls `log_symptom` for sore throat, fever, dysphagia
- Calls `submit_triage_assessment` with `tier: "clinic"`
- Reads out: "This sounds like it could be a bacterial throat infection that needs evaluation. Please see a doctor within the next 24 hours — they can do a quick test and prescribe antibiotics if needed. Go to the ER if you start having difficulty breathing, severe drooling, or you can't open your mouth."

**Dashboard expectations:**
- 3-4 symptom cards
- RiskMeter ends amber
- ClassificationCard shows "Clinic Visit" with the watch-out symptoms listed

**What to point to during demo:** the *next steps* in the reasoning. "It didn't just say 'see a doctor' — it told you when to escalate. That's a real triage protocol."

---

## Scenario 3 — Emergency (the moment that wins the room)

**Patient script:**
> I have crushing chest pain in the middle of my chest. It started about 30 minutes ago. It's spreading down my left arm and into my jaw. I'm sweating and I feel nauseous.

**Expected AI behavior:**
- Asks one clarifying question max — most likely about duration or breathing
- Calls `log_symptom` for chest pain (severity: severe, notes: radiation to arm + jaw, diaphoresis)
- Calls `submit_triage_assessment` with `tier: "er"` (or `tier: "clinic"` — either way the server-side detector triggers and overrides)
- Tool returns the final tier
- Reads out: "Based on what you're describing, this sounds like a medical emergency. Please call 108 or have someone drive you to the nearest emergency room **immediately**. Do not drive yourself. If you have aspirin and aren't allergic, chew one 325mg tablet. I'm ending this call so you can get help. Please go now."

**Dashboard expectations:**
- Symptom card appears with severity = severe
- RiskMeter spikes red
- ClassificationCard turns red, shows "Emergency Room"
- If the LLM had said `clinic`, the audit log on the admin side shows the `red_flag_override`

**What to point to during demo:**
1. The **speed** — minimal back-and-forth, immediate escalation
2. The **directness** — "do not drive yourself" is not hedged
3. Open the admin tab on the projector after: show the audit_log entry. "This is the override layer. The LLM doesn't get to make this call alone."

**This is the moment that beats every other team's demo.** Practice the script. Make sure your mic is clean. Have a hotspot ready if WiFi flakes.

---

## Backup video script

Record a single take of all three scenarios end-to-end, in order, with the dashboard visible on a second monitor. Total length: ~2 minutes. Save as `demo-fallback.mp4` on your laptop and a USB stick.

If venue WiFi dies during your live demo: cut to the video and narrate over it. Better to have rehearsed this than discover the WiFi is down at minute 1 of your pitch.

## Pre-demo checklist

- [ ] Mic permissions granted in Chrome
- [ ] Vapi credits topped up
- [ ] Webhook URL pointing at production Vercel deploy (not ngrok)
- [ ] All three scenarios run cleanly on production
- [ ] Backup video on laptop AND USB
- [ ] Phone hotspot ready as WiFi backup
- [ ] Disclaimer slide is the opener
- [ ] Architecture slide is the closer
- [ ] Q&A talking points memorized (red-flag override, audit log, "this is not a doctor")
- [ ] You've slept at least 4 hours
