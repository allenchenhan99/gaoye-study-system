import { useEffect, useState } from "react";
import type { Question, Explanation } from "../lib/types";
import questionsUrl from "../../../data/questions.json?url";
import explanationsUrl from "../../../data/explanations.json?url";

export interface Bank {
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
      const qs: Question[] = await fetch(questionsUrl).then((r) => r.json());
      let exps: Explanation[] = [];
      try {
        exps = await fetch(explanationsUrl).then((r) => r.json());
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
