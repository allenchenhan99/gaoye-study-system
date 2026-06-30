import Markdown from "react-markdown";
import type { Explanation } from "../lib/types";

export function ExplanationView({ explanation }: { explanation?: Explanation }) {
  if (!explanation) {
    return <p className="text-sm text-gray-500 mt-3">詳解陸續補充中…</p>;
  }
  return (
    <div className="prose prose-sm max-w-none mt-3 border-t pt-3 dark:prose-invert">
      <Markdown>{explanation.explanation}</Markdown>
    </div>
  );
}
