import type { Choice, Subject } from "./types";
import { defaultStore, type Store } from "./store";

interface QuestionProgressRow {
  question_id: string;
  answered_count: number;
  last_choice: string | null;
  last_correct: boolean;
}

interface SubjectStatsRow {
  subject: string;
  done_count: number;
  correct_count: number;
}

interface QuestionIdRow {
  question_id: string;
}

interface ExamAttemptRow {
  completed_at: string;
  score: number;
  total: number;
}

interface SettingsRow {
  per_round_count: number;
  exam_timer_min: number;
  dark_mode: boolean;
}

export interface CloudProgressRows {
  questionProgress: QuestionProgressRow[];
  subjectStats: SubjectStatsRow[];
  favorites: QuestionIdRow[];
  wrongBook: QuestionIdRow[];
  examAttempts: ExamAttemptRow[];
  settings: SettingsRow | null;
}

function isChoice(value: string | null): value is Choice {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

function isSubject(value: string): value is Subject {
  return value === "law" || value === "investment" || value === "finance";
}

export function buildStoreFromCloud(rows: CloudProgressRows): Store {
  const store = defaultStore();

  for (const row of rows.questionProgress) {
    store.progress[row.question_id] = {
      answeredCount: Number(row.answered_count),
      lastChoice: isChoice(row.last_choice) ? row.last_choice : null,
      correct: row.last_correct,
    };
  }

  for (const row of rows.subjectStats) {
    if (!isSubject(row.subject)) continue;
    store.stats.perSubject[row.subject] = {
      done: Number(row.done_count),
      correct: Number(row.correct_count),
    };
  }
  store.stats.totalDone = Object.values(store.stats.perSubject)
    .reduce((total, subject) => total + subject.done, 0);

  store.favorites = rows.favorites.map((row) => row.question_id);
  store.wrongBook = rows.wrongBook.map((row) => row.question_id);
  store.examHistory = rows.examAttempts.map((row) => ({
    date: row.completed_at,
    score: row.score,
    total: row.total,
  }));

  if (rows.settings) {
    store.settings = {
      perRoundCount: rows.settings.per_round_count,
      examTimerMin: rows.settings.exam_timer_min,
      darkMode: rows.settings.dark_mode,
    };
  }

  return store;
}

export function getUserCacheKey(userId: string): string {
  return `gaoye-cloud-store-v1:${userId}`;
}

export function hasMeaningfulProgress(store: Store): boolean {
  const defaults = defaultStore();
  return Object.keys(store.progress).length > 0
    || store.wrongBook.length > 0
    || store.favorites.length > 0
    || store.stats.totalDone > 0
    || store.examHistory.length > 0
    || store.settings.perRoundCount !== defaults.settings.perRoundCount
    || store.settings.examTimerMin !== defaults.settings.examTimerMin
    || store.settings.darkMode !== defaults.settings.darkMode;
}
