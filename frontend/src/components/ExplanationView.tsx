import Markdown from "react-markdown";
import type { Explanation } from "../lib/types";

export function ExplanationView({ explanation }: { explanation?: Explanation }) {
  if (!explanation) {
    return (
      <div className="mt-4 grid grid-cols-[10px_1fr] border-[3px] border-line bg-machine text-sm text-ink-faint">
        <span aria-hidden className="bg-warning" />
        <p className="p-3"><b className="font-mono text-[0.62rem]">DATA NOT INSTALLED</b><br />詳解陸續補充中…</p>
      </div>
    );
  }
  return (
    <section className="mt-4 border-[3px] border-charcoal bg-document">
      <header className="flex items-center justify-between border-b-[3px] border-charcoal bg-crt px-3 py-2 text-document">
        <span className="font-mono text-xs font-black">詳解資料</span>
        <code className="font-mono text-[0.58rem] font-bold">DATA:{explanation.id}</code>
      </header>
      <div className="explanation p-4">
        <Markdown>{explanation.explanation}</Markdown>
      </div>
      {explanation.flagged && (
        <p className="m-3 border-[3px] border-warning bg-machine px-3 py-2 text-xs font-bold text-warning">
          [!] 此題標記待複核，請以官方公告答案為準。
        </p>
      )}
    </section>
  );
}
