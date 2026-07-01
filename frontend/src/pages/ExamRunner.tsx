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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const score = questions.filter((q) => answers[q.id] && isCorrect(q, answers[q.id])).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-line bg-paper/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <a href="#/" className="btn-ghost">
            <span aria-hidden>←</span> 首頁
          </a>
          <div className="flex flex-col items-center leading-tight">
            <span className="eyebrow">模擬考</span>
            <span className="font-mono text-xs text-ink-faint">
              {submitted ? `${questions.length} 題` : `${answeredCount} / ${questions.length}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!submitted && <Timer minutes={progress.store.settings.examTimerMin} onExpire={submit} />}
            {!submitted && (
              <button className="btn-primary px-4 py-2" onClick={submit}>
                交卷
              </button>
            )}
          </div>
        </div>
      </div>

      {submitted && (
        <div className="card animate-fade-rise mb-6 overflow-hidden text-center">
          <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="p-6">
            <div className="eyebrow">成績</div>
            <p className="mt-3 font-serif text-lg text-ink-soft">
              得分：
              <span className="mx-1 text-4xl font-black tabular-nums text-pine">{score}</span>
              <span className="text-ink-faint">/ {questions.length}</span>
              <span className="ml-2 text-2xl font-bold tabular-nums text-gold-deep">{pct}%</span>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            explanation={explanations.get(q.id)}
            mode="deferred"
            selected={answers[q.id] ?? null}
            revealed={submitted}
            onSelect={(c) => setAnswers((a) => ({ ...a, [q.id]: c }))}
            isFavorite={progress.store.favorites.includes(q.id)}
            onToggleFavorite={() => progress.toggleFav(q.id)}
          />
        ))}
      </div>

      {!submitted && (
        <button className="btn-primary mt-6 w-full" onClick={submit}>
          交卷
        </button>
      )}
    </div>
  );
}
