import type { Question, Explanation } from "../lib/types";
import { QuizRunner } from "./QuizRunner";
import type { useLocalProgress } from "../hooks/useLocalProgress";

interface Props {
  kind: "wrong" | "favorites";
  byId: Map<string, Question>;
  explanations: Map<string, Explanation>;
  progress: ReturnType<typeof useLocalProgress>;
}

export function ReviewBook({ kind, byId, explanations, progress }: Props) {
  const ids = kind === "wrong" ? progress.store.wrongBook : progress.store.favorites;
  const qs = ids.map((id) => byId.get(id)).filter((q): q is Question => !!q);
  if (qs.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <a href="#/" className="text-sm text-blue-600">← 首頁</a>
        <p className="mt-4">{kind === "wrong" ? "錯題本是空的。" : "尚無收藏。"}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <a href="#/" className="text-sm text-blue-600">← 首頁</a>
        <span className="ml-3 text-sm text-gray-600">{kind === "wrong" ? "錯題本" : "收藏"}（{qs.length} 題）</span>
      </div>
      <QuizRunner questions={qs} explanations={explanations} progress={progress} />
    </div>
  );
}
