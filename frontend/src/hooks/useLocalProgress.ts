import { useState, useCallback } from "react";
import type { Question, Choice } from "../lib/types";
import {
  Store, defaultStore, loadStore, saveStore,
  recordAnswer, toggleFavorite, removeWrong,
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
    clearAll: () => apply(defaultStore()),
  };
}
