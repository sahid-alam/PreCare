import { describe, it, expect } from "vitest";
import { detectRedFlags } from "./red-flags";

describe("detectRedFlags", () => {
  it("returns empty array for empty string", () => {
    expect(detectRedFlags("")).toEqual([]);
  });

  // ── Cardiac ───────────────────────────────────────────────────────────────

  it("flags cardiac for crushing chest pain radiating to left arm", () => {
    expect(
      detectRedFlags("I have crushing chest pain radiating to my left arm")
    ).toContain("cardiac");
  });

  it("does NOT flag cardiac for negated chest pain", () => {
    expect(detectRedFlags("I have no chest pain")).not.toContain("cardiac");
  });

  it("does NOT flag cardiac for denied chest discomfort", () => {
    expect(detectRedFlags("Denies any chest discomfort")).not.toContain("cardiac");
  });

  it("flags cardiac via combination: chest pain + sweating", () => {
    expect(
      detectRedFlags("I have chest pain and I am sweating a lot")
    ).toContain("cardiac");
  });

  it("flags cardiac for chest tightness alone (single trigger)", () => {
    expect(detectRedFlags("I have chest tightness")).toContain("cardiac");
  });

  it("flags cardiac — mixed case and punctuation", () => {
    expect(
      detectRedFlags("I have CHEST PAIN spreading to my JAW")
    ).toContain("cardiac");
  });

  it("flags cardiac — punctuation in phrase", () => {
    expect(detectRedFlags("Chest pain, radiates, severe!")).toContain("cardiac");
  });

  // ── Stroke ────────────────────────────────────────────────────────────────

  it("flags stroke for face drooping and slurred speech", () => {
    expect(
      detectRedFlags("Face drooping and slurred speech, came on suddenly")
    ).toContain("stroke");
  });

  it("flags stroke for sudden weakness on one side", () => {
    expect(detectRedFlags("weakness on one side of my body")).toContain("stroke");
  });

  // ── Psych ─────────────────────────────────────────────────────────────────

  it("flags psych for suicidal statement", () => {
    expect(detectRedFlags("I want to kill myself")).toContain("psych");
  });

  it("does NOT flag psych when negated", () => {
    expect(detectRedFlags("I don't want to kill myself")).not.toContain("psych");
  });

  it("flags psych for suicide keyword alone", () => {
    expect(detectRedFlags("I have been thinking about suicide")).toContain("psych");
  });

  // ── Anaphylaxis ───────────────────────────────────────────────────────────

  it("flags anaphylaxis for rash + face swelling + can't breathe", () => {
    expect(
      detectRedFlags("I have a rash and my face is swelling and I can't breathe")
    ).toContain("anaphylaxis");
  });

  it("does NOT flag anaphylaxis for rash alone", () => {
    expect(detectRedFlags("I have a rash")).not.toContain("anaphylaxis");
  });

  it("flags anaphylaxis for throat closing alone (strong trigger)", () => {
    expect(detectRedFlags("My throat is closing")).toContain("anaphylaxis");
  });

  // ── Sepsis ────────────────────────────────────────────────────────────────

  it("flags sepsis for fever + chills + heart racing + confused (4 groups)", () => {
    expect(
      detectRedFlags("Fever, chills, heart racing, confused")
    ).toContain("sepsis");
  });

  it("does NOT flag sepsis for fever alone", () => {
    expect(detectRedFlags("Just a fever")).not.toContain("sepsis");
  });

  it("does NOT flag sepsis for only 2 groups", () => {
    expect(detectRedFlags("I have a fever and chills")).not.toContain("sepsis");
  });

  // ── Neuro ─────────────────────────────────────────────────────────────────

  it("flags neuro for seizure", () => {
    expect(detectRedFlags("I had a seizure")).toContain("neuro");
  });

  it("flags neuro for passed out", () => {
    expect(detectRedFlags("I passed out earlier")).toContain("neuro");
  });

  // ── Hemorrhage ────────────────────────────────────────────────────────────

  it("flags hemorrhage for vomiting blood", () => {
    expect(detectRedFlags("I have been vomiting blood")).toContain("hemorrhage");
  });

  // ── Negation edge cases ───────────────────────────────────────────────────

  it("does NOT flag cardiac for 'negative for chest pain'", () => {
    expect(detectRedFlags("negative for chest pain")).not.toContain("cardiac");
  });

  it("does NOT flag cardiac for 'ruled out chest pain'", () => {
    expect(detectRedFlags("ruled out chest pain")).not.toContain("cardiac");
  });

  it("does NOT flag psych for 'never had suicidal thoughts'", () => {
    expect(
      detectRedFlags("I have never had suicidal thoughts")
    ).not.toContain("psych");
  });

  // ── Multiple flags ────────────────────────────────────────────────────────

  it("returns multiple categories when both cardiac and stroke present", () => {
    const result = detectRedFlags(
      "crushing chest pain and slurred speech suddenly"
    );
    expect(result).toContain("cardiac");
    expect(result).toContain("stroke");
  });
});
