import { useState, useCallback } from "react";
import type { Question, Choice } from "../lib/types";
import {
  Store, defaultStore, loadStore, saveStore,
  recordAnswer, recordExam, toggleFavorite, removeWrong,
} from "../lib/store";

export function useLocalProgress() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const apply = useCallback((next: Store) => {
    saveStore(next);
    setStore(next);
  }, []);
  return {
    store,
    answer: (q: Question, choice: Choice) => apply(recordAnswer(store, q, choice)),
    toggleFav: (id: string) => apply(toggleFavorite(store, id)),
    removeWrong: (id: string) => apply(removeWrong(store, id)),
    recordExam: (score: number, total: number) => apply(recordExam(store, {
      date: new Date().toISOString(),
      score,
      total,
    })),
    clearAll: () => apply(defaultStore()),
  };
}
