import { describe, it, expect } from "vitest";
import { filterPool, sampleQuestions } from "./sampling";
import type { Question } from "./types";

const mk = (id: string, subject: Question["subject"], year: number): Question => ({
  id, year, round: 1, roundLabel: "第1次", subject, subjectLabel: "L", number: 1,
  stem: "s", options: { A: "1", B: "2", C: "3", D: "4" }, answer: "A",
});
const pool = [mk("a", "law", 114), mk("b", "investment", 114), mk("c", "law", 113)];

describe("filterPool", () => {
  it("filters by subject", () => {
    expect(filterPool(pool, { subject: "law" }).map((q) => q.id)).toEqual(["a", "c"]);
  });
  it("filters by year", () => {
    expect(filterPool(pool, { year: 114 }).map((q) => q.id).sort()).toEqual(["a", "b"]);
  });
});

describe("sampleQuestions", () => {
  it("respects count", () => {
    expect(sampleQuestions(pool, { count: 2, rng: () => 0 })).toHaveLength(2);
  });
  it("returns all when count omitted", () => {
    expect(sampleQuestions(pool, { rng: () => 0 })).toHaveLength(3);
  });
  it("only returns filtered subject", () => {
    const out = sampleQuestions(pool, { subject: "law", rng: () => 0 });
    expect(out.every((q) => q.subject === "law")).toBe(true);
  });
});
