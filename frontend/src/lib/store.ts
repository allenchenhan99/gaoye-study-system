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

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {
    return defaultStore();
  }
}

export function saveStore(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}
