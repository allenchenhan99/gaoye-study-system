import { describe, expect, it } from "vitest";
import {
  buildStoreFromCloud,
  getUserCacheKey,
  hasMeaningfulProgress,
} from "./cloudProgress";
import { defaultStore } from "./store";

describe("buildStoreFromCloud", () => {
  it("maps normalized per-user rows into the frontend store", () => {
    const store = buildStoreFromCloud({
      questionProgress: [
        { question_id: "q-1", answered_count: 3, last_choice: "B", last_correct: true },
      ],
      subjectStats: [
        { subject: "law", done_count: 3, correct_count: 2 },
        { subject: "investment", done_count: 1, correct_count: 0 },
      ],
      favorites: [{ question_id: "q-1" }],
      wrongBook: [{ question_id: "q-2" }],
      examAttempts: [{ completed_at: "2026-08-29T01:00:00.000Z", score: 42, total: 50 }],
      settings: { per_round_count: 25, exam_timer_min: 50, dark_mode: false },
    });

    expect(store.progress["q-1"]).toEqual({
      answeredCount: 3,
      lastChoice: "B",
      correct: true,
    });
    expect(store.stats.totalDone).toBe(4);
    expect(store.stats.perSubject.law).toEqual({ done: 3, correct: 2 });
    expect(store.favorites).toEqual(["q-1"]);
    expect(store.wrongBook).toEqual(["q-2"]);
    expect(store.examHistory[0]).toEqual({
      date: "2026-08-29T01:00:00.000Z",
      score: 42,
      total: 50,
    });
    expect(store.settings.perRoundCount).toBe(25);
  });
});

describe("cloud progress cache", () => {
  it("namespaces cached progress by authenticated user", () => {
    expect(getUserCacheKey("user-123")).toBe("gaoye-cloud-store-v1:user-123");
  });

  it("only imports a legacy store when it contains learner activity", () => {
    expect(hasMeaningfulProgress(defaultStore())).toBe(false);
    const withFavorite = defaultStore();
    withFavorite.favorites.push("q-1");
    expect(hasMeaningfulProgress(withFavorite)).toBe(true);
  });
});
