import type { Question, Choice, Subject } from "./types";
import { isCorrect } from "./scoring";

const KEY = "gaoye-store-v1";

export interface Store {
  progress: Record<string, { answeredCount: number; lastChoice: Choice | null; correct: boolean }>;
  wrongBook: string[];
  favorites: string[];
  stats: {
    totalDone: number;
    perSubject: Record<Subject, { done: number; correct: number }>;
  };
  examHistory: { date: string; score: number; total: number }[];
  settings: { perRoundCount: number; examTimerMin: number; darkMode: boolean };
}

export function defaultStore(): Store {
  return {
    progress: {},
    wrongBook: [],
    favorites: [],
    stats: {
      totalDone: 0,
      perSubject: {
        law: { done: 0, correct: 0 },
        investment: { done: 0, correct: 0 },
        finance: { done: 0, correct: 0 },
      },
    },
    examHistory: [],
    settings: { perRoundCount: 20, examTimerMin: 60, darkMode: false },
  };
}

export function recordAnswer(store: Store, q: Question, choice: Choice): Store {
  const correct = isCorrect(q, choice);
  const s: Store = structuredClone(store);
  s.progress[q.id] = {
    answeredCount: (store.progress[q.id]?.answeredCount ?? 0) + 1,
    lastChoice: choice,
    correct,
  };
  s.stats.totalDone += 1;
  s.stats.perSubject[q.subject].done += 1;
  if (correct) {
    s.stats.perSubject[q.subject].correct += 1;
    s.wrongBook = s.wrongBook.filter((id) => id !== q.id);
  } else if (!s.wrongBook.includes(q.id)) {
    s.wrongBook.push(q.id);
  }
  return s;
}

export function toggleFavorite(store: Store, id: string): Store {
  const s: Store = structuredClone(store);
  s.favorites = s.favorites.includes(id)
    ? s.favorites.filter((x) => x !== id)
    : [...s.favorites, id];
  return s;
}

export function removeWrong(store: Store, id: string): Store {
  const s: Store = structuredClone(store);
  s.wrongBook = s.wrongBook.filter((x) => x !== id);
  return s;
}

export function recordExam(store: Store, attempt: Store["examHistory"][number]): Store {
  const next: Store = structuredClone(store);
  next.examHistory.push(attempt);
  return next;
}

export function loadStore(): Store {
  return loadStoreFromKey(KEY);
}

export function loadStoreFromKey(key: string): Store {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    const defaults = defaultStore();
    return {
      ...defaults,
      ...parsed,
      progress: parsed.progress ?? defaults.progress,
      wrongBook: parsed.wrongBook ?? defaults.wrongBook,
      favorites: parsed.favorites ?? defaults.favorites,
      stats: {
        ...defaults.stats,
        ...parsed.stats,
        perSubject: {
          ...defaults.stats.perSubject,
          ...parsed.stats?.perSubject,
        },
      },
      examHistory: parsed.examHistory ?? defaults.examHistory,
      settings: { ...defaults.settings, ...parsed.settings },
    };
  } catch {
    return defaultStore();
  }
}

export function saveStore(store: Store): void {
  saveStoreToKey(KEY, store);
}

export function saveStoreToKey(key: string, store: Store): void {
  localStorage.setItem(key, JSON.stringify(store));
}

export function removeLegacyStore(): void {
  localStorage.removeItem(KEY);
}
