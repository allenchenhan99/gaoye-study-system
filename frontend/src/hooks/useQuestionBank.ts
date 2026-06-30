import { useEffect, useState } from "react";
import type { Question, Explanation } from "../lib/types";

interface Bank {
  questions: Question[];
  byId: Map<string, Question>;
  explanations: Map<string, Explanation>;
  loading: boolean;
}

export function useQuestionBank(): Bank {
  const [bank, setBank] = useState<Bank>({
    questions: [], byId: new Map(), explanations: new Map(), loading: true,
  });
  useEffect(() => {
    (async () => {
      const base = import.meta.env.BASE_URL;
      const qs: Question[] = await fetch(`${base}data/questions.json`).then((r) => r.json());
      let exps: Explanation[] = [];
      try {
        exps = await fetch(`${base}data/explanations.json`).then((r) => r.json());
      } catch {
        exps = [];
      }
      setBank({
        questions: qs,
        byId: new Map(qs.map((q) => [q.id, q])),
        explanations: new Map(exps.map((e) => [e.id, e])),
        loading: false,
      });
    })();
  }, []);
  return bank;
}
