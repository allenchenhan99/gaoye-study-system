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
        <a href="#/" className="system-button">
          <kbd className="font-mono text-[0.58rem]">ESC</kbd> 首頁
        </a>
        <section className="system-window mt-6 overflow-hidden">
          <header className="flex justify-between border-b-[3px] border-charcoal bg-crt px-4 py-2 text-document">
            <b className="font-mono text-xs">{kind === "wrong" ? "WRONG BOOK" : "FAVORITE RECORDS"}</b>
            <span className="font-mono text-[0.58rem]">0 RECORDS</span>
          </header>
          <div className="grid grid-cols-[70px_1fr] items-center gap-5 p-8">
            <div className="grid h-16 w-16 place-items-center border-4 border-charcoal bg-machine font-mono text-2xl font-black text-crt">
              {kind === "wrong" ? "ERR" : "★"}
            </div>
            <div>
              <h2 className="text-xl font-black">{title}目前沒有資料</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                {kind === "wrong" ? "答錯的題目會自動建立記錄。" : "作答時按下 FAV 即可加入收藏。"}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-4 sm:px-6">
        <a href="#/" className="system-button">
          <kbd className="font-mono text-[0.58rem]">ESC</kbd> 首頁
        </a>
        <span className="border-[3px] border-charcoal bg-machine px-3 py-2 text-sm font-bold text-ink-soft">
          {title} · <span className="font-mono font-black text-ink">{qs.length}</span> RECORDS
        </span>
      </div>
      <QuizRunner key={kind} questions={qs} explanations={explanations} progress={progress} />
    </div>
  );
}
