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
  const title = kind === "wrong" ? "錯題本" : "收藏";

  if (qs.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <a href="#/" className="btn-ghost">
          <span aria-hidden>←</span> 首頁
        </a>
        <div className="card mt-6 p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line text-2xl text-gold">
            {kind === "wrong" ? "✎" : "★"}
          </div>
          <p className="mt-4 text-ink-soft">
            {kind === "wrong" ? "錯題本是空的，答錯的題會自動收錄於此。" : "尚無收藏，作答時點擊 ☆ 即可加入。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pt-4 sm:px-6">
        <a href="#/" className="btn-ghost">
          <span aria-hidden>←</span> 首頁
        </a>
        <span className="text-sm text-ink-soft">
          {title} · <span className="font-mono font-semibold text-ink">{qs.length}</span> 題
        </span>
      </div>
      <QuizRunner questions={qs} explanations={explanations} progress={progress} />
    </div>
  );
}
