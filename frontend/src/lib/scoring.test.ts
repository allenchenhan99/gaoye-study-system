import { describe, it, expect } from "vitest";
import { isCorrect } from "./scoring";
import type { Question } from "./types";

const base: Question = {
  id: "x", year: 1, round: 1, roundLabel: "第1次", subject: "law",
  subjectLabel: "L", number: 1, stem: "s",
  options: { A: "1", B: "2", C: "3", D: "4" }, answer: "C",
};

describe("isCorrect", () => {
  it("true when choice equals answer", () => {
    expect(isCorrect(base, "C")).toBe(true);
  });
  it("false when choice differs", () => {
    expect(isCorrect(base, "A")).toBe(false);
  });
  it("allCredit makes any choice correct", () => {
    const q: Question = { ...base, answer: null, allCredit: true };
    expect(isCorrect(q, "A")).toBe(true);
    expect(isCorrect(q, "D")).toBe(true);
  });
});
