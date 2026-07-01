import Markdown from "react-markdown";
import type { Explanation } from "../lib/types";

export function ExplanationView({ explanation }: { explanation?: Explanation }) {
  if (!explanation) {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-faint">
        <span aria-hidden className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        詳解陸續補充中…
      </p>
    );
  }
  return (
    <div className="mt-4 rounded-xl border border-line bg-paper/50 p-4">
      <div className="eyebrow mb-2">詳解</div>
      <div className="explanation">
        <Markdown>{explanation.explanation}</Markdown>
      </div>
      {explanation.flagged && (
        <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold-deep">
          ⚑ 此題標記待複核，請以官方公告答案為準。
        </p>
      )}
    </div>
  );
}
