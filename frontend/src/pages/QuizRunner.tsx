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
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="card p-8 text-center text-ink-soft">此條件沒有題目。</div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="card animate-fade-rise overflow-hidden text-center">
          <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="p-8 sm:p-10">
            <div className="eyebrow">本輪完成</div>
            <div className="mt-4 font-serif text-6xl font-black tabular-nums text-pine">{pct}%</div>
            <p className="mt-3 text-ink-soft">
              共 {questions.length} 題，答對{" "}
              <span className="font-semibold text-ink">{correctCount}</span> 題。
            </p>
            <a href="#/" className="btn-primary mt-8">
              回首頁
            </a>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const last = idx + 1 >= questions.length;

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
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
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
          <button className="btn-primary" onClick={next}>
            {last ? "完成" : "下一題"}
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
      <ProgressBar current={idx + 1} total={questions.length} />
    </div>
  );
}
