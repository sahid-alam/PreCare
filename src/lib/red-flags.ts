import type { RedFlagCategory } from "@/lib/types";

// ── Tokenization ──────────────────────────────────────────────────────────────

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/'/g, "")            // "don't" → "dont", "can't" → "cant"
    .replace(/[^a-z0-9\s]/g, " ") // other punctuation → space
    .split(/\s+/)
    .filter(Boolean);
}

// ── Negation detection ────────────────────────────────────────────────────────

export const NEGATION_SINGLES = new Set([
  "no", "not", "never", "denies", "denied", "without", "nothing",
  "cant", "dont", "doesnt", "didnt", "wont", "hasnt", "havent",
]);

export const NEGATION_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["negative", "for"],
  ["ruled", "out"],
  ["none", "of"],
] as const;

// Look backward up to 5 tokens before matchStart for any negation marker.
// 5 tokens covers 2-word negation phrases ("negative for") within the 3-position window.
export function isNegated(tokens: string[], matchStart: number): boolean {
  const start = Math.max(0, matchStart - 5);
  const window = tokens.slice(start, matchStart);

  for (const tok of window) {
    if (NEGATION_SINGLES.has(tok)) return true;
  }

  for (let i = 0; i < window.length - 1; i++) {
    for (const [a, b] of NEGATION_PAIRS) {
      if (window[i] === a && window[i + 1] === b) return true;
    }
  }

  return false;
}

// ── Phrase matching ───────────────────────────────────────────────────────────

function findPhraseMatches(tokens: string[], phrase: string[]): number[] {
  const positions: number[] = [];
  if (phrase.length === 0) return positions;
  outer: for (let i = 0; i <= tokens.length - phrase.length; i++) {
    for (let j = 0; j < phrase.length; j++) {
      if (tokens[i + j] !== phrase[j]) continue outer;
    }
    positions.push(i);
  }
  return positions;
}

function phraseHit(tokens: string[], phrase: string[]): boolean {
  for (const pos of findPhraseMatches(tokens, phrase)) {
    if (!isNegated(tokens, pos)) return true;
  }
  return false;
}

function anyPhraseHit(tokens: string[], phrases: string[][]): boolean {
  return phrases.some((p) => phraseHit(tokens, p));
}

// ── Keyword tables ────────────────────────────────────────────────────────────

// --- Cardiac ---

export const CARDIAC_SINGLE: string[][] = [
  ["crushing", "chest", "pain"],
  ["pressure", "on", "my", "chest"],
  ["pressure", "in", "my", "chest"],
  ["chest", "pain", "radiating"],
  ["chest", "pain", "radiates"],
  ["chest", "tightness"],
  ["tightness", "in", "my", "chest"],
  ["tightness", "in", "chest"],
  ["squeezing", "in", "my", "chest"],
  ["squeezing", "chest"],
  ["pain", "radiates", "to", "my", "arm"],
  ["pain", "radiating", "to", "my", "arm"],
  ["spreading", "to", "my", "jaw"],
  ["spreading", "to", "my", "arm"],
  ["pain", "in", "my", "jaw"],
  ["pain", "in", "jaw"],
];

// Groups for combination rule: any 2+ groups hit triggers cardiac
export const CARDIAC_COMBO_GROUPS: string[][][] = [
  // 0 — chest pain/discomfort
  [
    ["chest", "pain"], ["chest", "discomfort"], ["chest", "tightness"],
    ["chest", "pressure"], ["chest", "heaviness"],
  ],
  // 1 — shortness of breath
  [
    ["shortness", "of", "breath"], ["short", "of", "breath"],
    ["cant", "breathe"], ["difficulty", "breathing"], ["dyspnea"],
  ],
  // 2 — sweating/diaphoresis
  [
    ["sweating"], ["diaphoresis"], ["cold", "sweat"], ["breaking", "out", "in", "sweat"],
    ["drenched", "in", "sweat"],
  ],
  // 3 — nausea
  [
    ["nausea"], ["nauseous"], ["feeling", "sick"], ["want", "to", "vomit"],
  ],
  // 4 — radiation to arm/jaw/shoulder
  [
    ["left", "arm"], ["my", "jaw"], ["jaw", "pain"], ["shoulder", "pain"],
    ["arm", "pain"], ["radiates", "to"], ["radiating", "to"],
  ],
  // 5 — lightheadedness/dizziness
  [
    ["lightheaded"], ["light", "headed"], ["dizzy"], ["dizziness"],
    ["feeling", "faint"],
  ],
];

// --- Stroke ---

export const STROKE_TRIGGERS: string[][] = [
  ["weakness", "on", "one", "side"],
  ["numbness", "on", "one", "side"],
  ["face", "drooping"],
  ["face", "is", "drooping"],
  ["face", "is", "droopy"],
  ["one", "side", "of", "my", "face"],
  ["slurred", "speech"],
  ["slurring", "my", "words"],
  ["cant", "speak", "properly"],
  ["trouble", "speaking"],
  ["sudden", "vision", "loss"],
  ["lost", "vision"],
  ["double", "vision"],
  ["worst", "headache", "of", "my", "life"],
  ["thunderclap", "headache"],
  ["arm", "went", "numb"],
  ["leg", "went", "weak"],
  ["sudden", "weakness"],
  ["sudden", "numbness"],
];

// --- Respiratory ---

export const RESPIRATORY_TRIGGERS: string[][] = [
  ["cant", "breathe"],
  ["cannot", "breathe"],
  ["cannot", "catch", "my", "breath"],
  ["gasping", "for", "air"],
  ["blue", "lips"],
  ["lips", "turning", "blue"],
  ["cyanosis"],
  ["wheezing", "badly"],
  ["severe", "wheezing"],
  ["choking"],
  ["breathing", "very", "fast"],
  ["using", "my", "neck", "muscles", "to", "breathe"],
  ["struggling", "to", "breathe"],
];

// --- Anaphylaxis ---

export const ANAPHYLAXIS_STRONG: string[][] = [
  ["throat", "closing"],
  ["throat", "is", "closing"],
  ["tongue", "swelling"],
  ["tongue", "is", "swelling"],
];

export const ANAPHYLAXIS_RASH: string[][] = [
  ["hives", "all", "over"],
  ["full", "body", "rash"],
  ["rash", "all", "over"],
  ["hives"],
  ["rash"],
  ["urticaria"],
];

export const ANAPHYLAXIS_SWELLING: string[][] = [
  ["swelling", "of", "my", "face"],
  ["face", "is", "swelling"],
  ["face", "swelling"],
  ["lips", "swelling"],
  ["lip", "swelling"],
  ["cant", "swallow"],
  ["difficulty", "swallowing"],
];

export const ANAPHYLAXIS_BREATHING: string[][] = [
  ["cant", "breathe"],
  ["difficulty", "breathing"],
  ["trouble", "breathing"],
  ["shortness", "of", "breath"],
  ["cant", "catch", "my", "breath"],
];

// --- Hemorrhage ---

export const HEMORRHAGE_TRIGGERS: string[][] = [
  ["bleeding", "wont", "stop"],
  ["cant", "stop", "the", "bleeding"],
  ["vomiting", "blood"],
  ["coughing", "up", "blood"],
  ["blood", "in", "my", "stool"],
  ["passing", "blood"],
  ["black", "tarry", "stool"],
  ["melena"],
  ["heavy", "vaginal", "bleeding"],
  ["soaking", "through", "pads"],
  ["nosebleed", "for", "hours"],
  ["large", "pool", "of", "blood"],
];

// --- Neuro ---

export const NEURO_SINGLE: string[][] = [
  ["had", "a", "seizure"],
  ["having", "a", "seizure"],
  ["seizing"],
  ["convulsions"],
  ["lost", "consciousness"],
  ["passed", "out"],
  ["fainted"],
  ["i", "fainted"],
  ["blacked", "out"],
];

// Combo: neck stiffness + fever → meningitis red flag
export const NEURO_NECK_STIFF: string[][] = [
  ["neck", "stiffness"], ["stiff", "neck"], ["neck", "is", "stiff"],
];
export const NEURO_FEVER: string[][] = [
  ["fever"], ["high", "temperature"], ["running", "a", "fever"], ["febrile"],
];

// Combo: head injury + (vomiting OR confusion OR LOC)
export const NEURO_HEAD_INJURY: string[][] = [
  ["head", "injury"], ["hit", "my", "head"], ["head", "trauma"],
  ["hit", "his", "head"], ["hit", "her", "head"],
];
export const NEURO_VOMITING: string[][] = [
  ["vomiting"], ["vomited"], ["throwing", "up"],
];
export const NEURO_CONFUSION: string[][] = [
  ["confused"], ["disoriented"], ["doesnt", "know", "where"],
];

// --- Psych (always flag, no combos, no threshold) ---

export const PSYCH_TRIGGERS: string[][] = [
  ["want", "to", "kill", "myself"],
  ["kill", "myself"],
  ["kill", "yourself"],
  ["end", "my", "life"],
  ["suicide"],
  ["suicidal"],
  ["plan", "to", "hurt", "myself"],
  ["going", "to", "hurt", "myself"],
  ["hurt", "someone", "else"],
  ["kill", "someone"],
  ["homicidal"],
  ["voices", "telling", "me"],
  ["hearing", "voices"],
  ["wants", "to", "die"],
  ["want", "to", "die"],
];

// --- Sepsis (3+ groups) ---

export const SEPSIS_GROUPS: string[][][] = [
  // 0 — fever
  [
    ["fever"], ["high", "fever"], ["very", "hot"], ["running", "a", "fever"],
    ["febrile"], ["high", "temperature"],
  ],
  // 1 — chills/rigors
  [
    ["chills"], ["rigors"], ["shaking"], ["shivering"],
  ],
  // 2 — rapid heart rate
  [
    ["heart", "racing"], ["heart", "is", "racing"], ["very", "fast", "heartbeat"],
    ["palpitations"], ["tachycardia"], ["heart", "beating", "fast"],
  ],
  // 3 — confusion/extreme weakness
  [
    ["confused"], ["extreme", "weakness"], ["very", "weak"], ["altered"],
    ["disoriented"], ["cant", "think", "clearly"],
  ],
  // 4 — rapid breathing
  [
    ["rapid", "breathing"], ["breathing", "fast"], ["breathing", "rapidly"],
    ["shortness", "of", "breath"],
  ],
  // 5 — recent infection/procedure
  [
    ["recent", "infection"], ["recent", "surgery"], ["catheter"],
    ["iv", "line"], ["intravenous"], ["wound", "infection"],
  ],
];

// --- Obstetric ---

export const OBSTETRIC_CONTEXT: string[][] = [
  ["pregnant"], ["pregnancy"], ["expecting"], ["am", "pregnant"], ["im", "pregnant"],
];

// "no fetal movement" / "baby not moving" — the negation words are INSIDE the phrase,
// not before it, so isNegated() won't fire on the preceding tokens. Safe to match as-is.
export const OBSTETRIC_DANGER: string[][] = [
  ["bleeding", "heavily"],
  ["heavy", "bleeding"],
  ["severe", "abdominal", "pain"],
  ["water", "broke"],
  ["no", "fetal", "movement"],
  ["baby", "not", "moving"],
  ["fetal", "movement", "decreased"],
  ["stopped", "feeling", "baby"],
  ["blurred", "vision"],
  ["swelling", "in", "face"],
  ["swelling", "in", "hands"],
  ["severe", "headache"],
  ["worst", "headache"],
];

// ── Category detectors ────────────────────────────────────────────────────────

function detectCardiac(tokens: string[]): boolean {
  if (anyPhraseHit(tokens, CARDIAC_SINGLE)) return true;

  let groupsHit = 0;
  for (const group of CARDIAC_COMBO_GROUPS) {
    if (anyPhraseHit(tokens, group)) {
      groupsHit++;
      if (groupsHit >= 2) return true;
    }
  }
  return false;
}

function detectStroke(tokens: string[]): boolean {
  return anyPhraseHit(tokens, STROKE_TRIGGERS);
}

function detectRespiratory(tokens: string[]): boolean {
  return anyPhraseHit(tokens, RESPIRATORY_TRIGGERS);
}

function detectAnaphylaxis(tokens: string[]): boolean {
  if (anyPhraseHit(tokens, ANAPHYLAXIS_STRONG)) return true;

  const hasRash = anyPhraseHit(tokens, ANAPHYLAXIS_RASH);
  if (!hasRash) return false;

  return (
    anyPhraseHit(tokens, ANAPHYLAXIS_SWELLING) ||
    anyPhraseHit(tokens, ANAPHYLAXIS_BREATHING)
  );
}

function detectHemorrhage(tokens: string[]): boolean {
  return anyPhraseHit(tokens, HEMORRHAGE_TRIGGERS);
}

function detectNeuro(tokens: string[]): boolean {
  if (anyPhraseHit(tokens, NEURO_SINGLE)) return true;

  if (
    anyPhraseHit(tokens, NEURO_NECK_STIFF) &&
    anyPhraseHit(tokens, NEURO_FEVER)
  ) return true;

  if (anyPhraseHit(tokens, NEURO_HEAD_INJURY)) {
    if (
      anyPhraseHit(tokens, NEURO_VOMITING) ||
      anyPhraseHit(tokens, NEURO_CONFUSION) ||
      anyPhraseHit(tokens, NEURO_SINGLE)
    ) return true;
  }

  return false;
}

function detectPsych(tokens: string[]): boolean {
  // Always flag on any single match — no combination threshold.
  return anyPhraseHit(tokens, PSYCH_TRIGGERS);
}

function detectSepsis(tokens: string[]): boolean {
  let groupsHit = 0;
  for (const group of SEPSIS_GROUPS) {
    if (anyPhraseHit(tokens, group)) {
      groupsHit++;
      if (groupsHit >= 3) return true;
    }
  }
  return false;
}

function detectObstetric(tokens: string[]): boolean {
  if (!anyPhraseHit(tokens, OBSTETRIC_CONTEXT)) return false;
  return anyPhraseHit(tokens, OBSTETRIC_DANGER);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function detectRedFlags(transcript: string): RedFlagCategory[] {
  const tokens = tokenize(transcript);
  const matched: RedFlagCategory[] = [];

  if (detectCardiac(tokens)) matched.push("cardiac");
  if (detectStroke(tokens)) matched.push("stroke");
  if (detectRespiratory(tokens)) matched.push("respiratory");
  if (detectAnaphylaxis(tokens)) matched.push("anaphylaxis");
  if (detectHemorrhage(tokens)) matched.push("hemorrhage");
  if (detectNeuro(tokens)) matched.push("neuro");
  if (detectPsych(tokens)) matched.push("psych");
  if (detectSepsis(tokens)) matched.push("sepsis");
  if (detectObstetric(tokens)) matched.push("obstetric");

  return matched;
}
