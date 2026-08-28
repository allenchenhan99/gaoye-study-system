import { useState } from "react";
import type { Question, Choice, Explanation } from "../lib/types";
import { isCorrect } from "../lib/scoring";
import { QuestionCard } from "../components/QuestionCard";
import { ProgressBar } from "../components/ProgressBar";
import type { useLocalProgress } from "../hooks/useLocalProgress";

interface Props {
  questions: Question[];
  explanations: Map<string, Explanation>;
  progress: ReturnType<typeof useLocalProgress>;
}

export function QuizRunner({ questions, explanations, progress }: Props) {
  // 一次性快照本輪題序：作答會改動 store（如答對後錯題本移除當題），
  // 若直接吃 questions prop，清單縮短會讓當前題「跳掉」而看不到正解與詳解。
  const [items] = useState(questions);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <section className="system-window overflow-hidden" role="status" aria-label="找不到題目">
          <header className="border-b-[3px] border-charcoal bg-warning px-4 py-2 font-mono text-xs font-black text-document">SYSTEM MESSAGE</header>
          <div className="grid grid-cols-[54px_1fr] items-center gap-4 p-6">
            <span aria-hidden className="grid h-12 w-12 place-items-center border-[3px] border-warning font-mono text-2xl font-black text-warning">!</span>
            <p className="font-bold text-ink-soft">此條件沒有題目。</p>
          </div>
        </section>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / items.length) * 100);
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <section className="system-window overflow-hidden" role="status" aria-label="本輪學習結果">
          <header className="flex items-center justify-between border-b-[3px] border-charcoal bg-crt px-4 py-2 text-document">
            <b className="font-mono text-xs">SESSION COMPLETE</b>
            <span className="font-mono text-[0.58rem] font-bold">RESULT DATA</span>
          </header>
          <div className="grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-8">
            <div className="grid aspect-square place-items-center border-4 border-charcoal bg-machine text-center">
              <span>
                <small className="system-label block">ACCURACY</small>
                <strong className="mt-2 block font-mono text-5xl font-black tabular-nums text-crt">{pct}%</strong>
              </span>
            </div>
            <div className="self-center">
              <h2 className="text-2xl font-black">本輪完成</h2>
              <p className="mt-3 border-y-[3px] border-double border-line py-3 text-ink-soft">
              共 {items.length} 題，答對{" "}
                <span className="font-black text-ink">{correctCount}</span> 題。
              </p>
              <a href="#/" className="system-button-primary mt-6">
                <kbd className="font-mono text-[0.58rem]">HOME</kbd> 回首頁
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const q = items[idx];
  const last = idx + 1 >= items.length;

  function handleSelect(c: Choice) {
    if (revealed) return;
    setSelected(c);
    setRevealed(true);
    progress.answer(q, c);
    if (isCorrect(q, c)) setCorrectCount((n) => n + 1);
  }
  function next() {
    if (last) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-4 flex items-end justify-between gap-3 border-b-4 border-charcoal pb-3">
        <div>
          <span className="system-label">LEARNING SESSION</span>
          <h2 className="mt-1 text-xl font-black">逐題練習</h2>
        </div>
        <span className="font-mono text-xs font-black text-ink-faint">ITEM {String(idx + 1).padStart(2, "0")}</span>
      </header>
      <QuestionCard
        key={q.id}
        question={q}
        explanation={explanations.get(q.id)}
        mode="immediate"
        selected={selected}
        revealed={revealed}
        onSelect={handleSelect}
        isFavorite={progress.store.favorites.includes(q.id)}
        onToggleFavorite={() => progress.toggleFav(q.id)}
      />
      {revealed && (
        <div className="mt-5 flex justify-end">
          <button type="button" className="system-button-primary" onClick={next}>
            {last ? "完成" : "下一題"}
            <kbd className="font-mono text-[0.58rem]">ENTER ↵</kbd>
          </button>
        </div>
      )}
      <ProgressBar current={idx + 1} total={items.length} />
    </div>
  );
}
