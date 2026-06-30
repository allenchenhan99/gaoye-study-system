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

  if (questions.length === 0) return <p className="p-4">此條件沒有題目。</p>;
  if (done) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2">完成本輪！</h2>
        <p>共 {questions.length} 題，答對 {correctCount} 題（{Math.round((correctCount / questions.length) * 100)}%）。</p>
        <a href="#/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded">回首頁</a>
      </div>
    );
  }

  const q = questions[idx];
  function handleSelect(c: Choice) {
    if (revealed) return;
    setSelected(c);
    setRevealed(true);
    progress.answer(q, c);
    if (isCorrect(q, c)) setCorrectCount((n) => n + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <QuestionCard
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
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={next}>
          {idx + 1 >= questions.length ? "完成" : "下一題"}
        </button>
      )}
      <ProgressBar current={idx + 1} total={questions.length} />
    </div>
  );
}
