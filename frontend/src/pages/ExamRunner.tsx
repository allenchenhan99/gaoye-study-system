import { useState } from "react";
import type { Question, Choice, Explanation } from "../lib/types";
import { isCorrect } from "../lib/scoring";
import { QuestionCard } from "../components/QuestionCard";
import { Timer } from "../components/Timer";
import type { useLocalProgress } from "../hooks/useLocalProgress";

interface Props {
  questions: Question[];
  explanations: Map<string, Explanation>;
  progress: ReturnType<typeof useLocalProgress>;
}

export function ExamRunner({ questions, explanations, progress }: Props) {
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    questions.forEach((q) => {
      const c = answers[q.id];
      if (c) progress.answer(q, c);
    });
  }

  const score = questions.filter((q) => answers[q.id] && isCorrect(q, answers[q.id])).length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-100 py-2 z-10">
        <a href="#/" className="text-sm text-blue-600">← 首頁</a>
        <span>模擬考（{questions.length} 題）</span>
        {!submitted && <Timer minutes={progress.store.settings.examTimerMin} onExpire={submit} />}
        {!submitted && <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={submit}>交卷</button>}
      </div>
      {submitted && (
        <div className="mb-4 p-3 bg-blue-50 rounded font-semibold">
          得分：{score} / {questions.length}（{Math.round((score / questions.length) * 100)}%）
        </div>
      )}
      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} explanation={explanations.get(q.id)}
            mode="deferred" selected={answers[q.id] ?? null} revealed={submitted}
            onSelect={(c) => setAnswers((a) => ({ ...a, [q.id]: c }))}
            isFavorite={progress.store.favorites.includes(q.id)}
            onToggleFavorite={() => progress.toggleFav(q.id)} />
        ))}
      </div>
      {!submitted && (
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full" onClick={submit}>交卷</button>
      )}
    </div>
  );
}
