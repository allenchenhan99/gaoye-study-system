import { describe, it, expect, beforeEach } from "vitest";
import { defaultStore, recordAnswer, recordExam, toggleFavorite, loadStore, saveStore } from "./store";
import type { Question } from "./types";

const q: Question = {
  id: "114-1-law-001", year: 114, round: 1, roundLabel: "第1次", subject: "law",
  subjectLabel: "L", number: 1, stem: "s",
  options: { A: "1", B: "2", C: "3", D: "4" }, answer: "C",
};

describe("recordAnswer", () => {
  it("correct answer updates stats, not wrongBook", () => {
    const s = recordAnswer(defaultStore(), q, "C");
    expect(s.stats.totalDone).toBe(1);
    expect(s.stats.perSubject.law.correct).toBe(1);
    expect(s.wrongBook).not.toContain(q.id);
    expect(s.progress[q.id].correct).toBe(true);
  });
  it("wrong answer adds to wrongBook", () => {
    const s = recordAnswer(defaultStore(), q, "A");
    expect(s.wrongBook).toContain(q.id);
    expect(s.stats.perSubject.law.correct).toBe(0);
  });
  it("later correct removes from wrongBook", () => {
    let s = recordAnswer(defaultStore(), q, "A");
    s = recordAnswer(s, q, "C");
    expect(s.wrongBook).not.toContain(q.id);
  });
});

describe("favorites", () => {
  it("toggles", () => {
    let s = toggleFavorite(defaultStore(), "x");
    expect(s.favorites).toContain("x");
    s = toggleFavorite(s, "x");
    expect(s.favorites).not.toContain("x");
  });
});

describe("exam history", () => {
  it("records a completed exam without mutating the previous store", () => {
    const before = defaultStore();
    const after = recordExam(before, { date: "2026-08-29T01:00:00.000Z", score: 42, total: 50 });
    expect(before.examHistory).toEqual([]);
    expect(after.examHistory).toEqual([
      { date: "2026-08-29T01:00:00.000Z", score: 42, total: 50 },
    ]);
  });
});

describe("persistence", () => {
  beforeEach(() => localStorage.clear());
  it("saves and loads", () => {
    saveStore(recordAnswer(defaultStore(), q, "C"));
    expect(loadStore().stats.totalDone).toBe(1);
  });
  it("returns default on empty", () => {
    expect(loadStore().stats.totalDone).toBe(0);
  });
});
