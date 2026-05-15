# Red-Flag Reference

Clinical keyword/phrase reference for the server-side red-flag detector in `src/lib/red-flags.ts`. Anchored to ESI (Emergency Severity Index) Level 1-2 criteria and the START triage system.

**Disclaimer:** This list is a hackathon-grade starting point synthesized from public ESI / START / NICE acute care guidance. A production system requires curation by qualified clinicians.

## Structure

The detector should expose a function:

```ts
type RedFlagCategory =
  | "cardiac" | "stroke" | "respiratory" | "anaphylaxis"
  | "hemorrhage" | "neuro" | "psych" | "sepsis" | "obstetric";

function detectRedFlags(transcript: string): RedFlagCategory[]
```

Each category has:
- **Trigger phrases** — keywords/multi-word phrases to match (case-insensitive, lemma-friendly)
- **Combination rules** — some red flags only fire when multiple symptoms co-occur
- **Negation handling** — must skip matches preceded within 3 tokens by: `no`, `not`, `never`, `denies`, `without`, `negative for`, `ruled out`, `none of`

## Categories

### 1. Cardiac (ACS / MI)

**Single-symptom triggers:**
- `crushing chest pain`
- `pressure on my chest`
- `chest pain radiating`, `pain radiates to my arm`, `pain in my jaw`
- `tightness in my chest`

**Combination trigger** (any 2 of):
- chest pain / discomfort
- shortness of breath / dyspnea
- sweating / diaphoresis / cold sweat
- nausea + chest discomfort
- pain in left arm / jaw / shoulder
- lightheadedness with chest symptoms

### 2. Stroke (FAST)

**Trigger phrases:**
- `weakness on one side`, `numbness on one side`
- `face drooping`, `face is droopy`, `one side of my face`
- `slurred speech`, `can't speak properly`, `trouble speaking`
- `sudden vision loss`, `lost vision in one eye`, `double vision`
- `worst headache of my life`, `thunderclap headache`
- `arm went numb`, `leg went weak`

**Time qualifier bonus:** any of the above + "suddenly," "came on suddenly," "in the last hour"

### 3. Respiratory distress

**Trigger phrases:**
- `can't breathe`, `cannot catch my breath`
- `gasping for air`
- `blue lips`, `lips turning blue`, `cyanosis`
- `wheezing badly`, `severe wheezing`
- `choking`
- `breathing very fast`
- `using my neck muscles to breathe`

### 4. Anaphylaxis

**Trigger phrases:**
- `swelling of my face`, `face is swelling`
- `lips swelling`, `tongue swelling`, `throat closing`
- `hives all over`, `full body rash` (alone weaker; combine with respiratory)
- `can't swallow`

**Combination trigger:** rash/hives + (breathing difficulty OR swelling)

### 5. Hemorrhage

**Trigger phrases:**
- `bleeding won't stop`, `can't stop the bleeding`
- `vomiting blood`, `coughing up blood`
- `blood in my stool`, `passing blood`, `black tarry stool`, `melena`
- `heavy vaginal bleeding`, `soaking through pads`
- `nosebleed for hours`
- `large pool of blood`

### 6. Neurological

**Trigger phrases:**
- `had a seizure`, `seizing`, `convulsions`
- `lost consciousness`, `passed out`, `fainted` (weaker alone, stronger with chest/neuro context)
- `confused`, `disoriented`, `doesn't know where I am`
- `head injury` + (vomiting OR confusion OR loss of consciousness)
- `neck stiffness` + fever
- `severe headache` + `vomiting` + `light hurts my eyes`

### 7. Psychiatric

**Trigger phrases:**
- `want to kill myself`, `kill myself`, `end my life`, `suicide`
- `plan to hurt myself`, `going to hurt myself`
- `hurt someone else`, `kill someone`, `homicidal`
- `voices telling me`, `hearing voices`

**Always flag, never require combination.** Mental health red flags are too high-stakes for confidence thresholds.

### 8. Sepsis

**Combination trigger** (any 3 of):
- fever > 101°F / high fever / very hot
- chills / rigors / shaking
- heart racing / very fast heartbeat
- confusion / extreme weakness
- rapid breathing
- recent infection / surgery / catheter / IV line

### 9. Obstetric (apply only if patient is or could be pregnant)

**Trigger phrases:**
- `pregnant` + `bleeding heavily`
- `pregnant` + `severe abdominal pain`
- `water broke` + (bleeding OR before 37 weeks)
- `no fetal movement`, `baby not moving`
- `severe headache` + `pregnant` (preeclampsia)
- `blurred vision` + `pregnant`
- `swelling in face/hands` + `pregnant`

## Negation handling

Before flagging a match, scan backward up to 3 tokens for any of:

```
no, not, never, denies, without, negative for, ruled out,
none of, nothing, can't say, doesn't have, didn't have
```

Examples that must NOT flag:
- "No chest pain"
- "I don't have any shortness of breath"
- "Denies any thoughts of self-harm"
- "Never had a seizure"
- "Negative for nausea"

Examples that MUST flag:
- "I have chest pain" → cardiac
- "Yes, some chest tightness" → cardiac
- "My face is swelling and I can't breathe" → anaphylaxis
- "I want to kill myself" → psych (always)

## Implementation notes

- Use a simple regex-or-keyword scan first. Fancier NLP is out of scope for the hackathon.
- Run all categories — multiple matches are common and should all be returned
- Store matched categories in `sessions.red_flag_categories` for the audit log
- The detector runs **server-side only** inside `/api/vapi/webhook`. The LLM cannot see, influence, or bypass it.
- Performance: this runs once per session at `submit_triage_assessment`. Latency budget: <50ms. Even naive regex over a 5KB transcript is fine.

## Future improvements (out of scope)

- Replace regex with a medical NER model (e.g. clinical BERT) for context-aware matching
- Add age-specific red flags (peds vs geriatric)
- Add medication-interaction flags
- Externalize the keyword list to a versioned table in DB, with clinician approval workflow
- Add per-category confidence scores
- Multi-language red-flag dictionaries

## Sources (synthesis-only, not direct quotes)

- ESI Implementation Handbook (AHRQ, public domain)
- START Triage (CHEMPACK / federal guidance)
- NICE NG143 (sepsis), NG12 (suspected cancer)
- ACEP clinical policies on chest pain, stroke, anaphylaxis
- WHO suicide prevention guidance for first responders

Cite none of these in product copy. They informed the keyword list; the keyword list is the artifact.
