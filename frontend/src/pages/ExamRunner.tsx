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
    progress.recordExam(score, questions.length);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const score = questions.filter((q) => answers[q.id] && isCorrect(q, answers[q.id])).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-y-4 border-charcoal bg-machine px-4 py-2 sm:-mx-6 sm:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 max-sm:grid-cols-[1fr_auto]">
          <a href="#/" className="system-button min-h-10 px-3 py-1.5 max-sm:hidden">
            <kbd className="font-mono text-[0.55rem]">ESC</kbd> 首頁
          </a>
          <div className="leading-tight sm:text-center">
            <span className="system-label block">EXAM SESSION / 模擬考</span>
            <span className="mt-1 block font-mono text-xs font-black text-ink">
              {submitted ? `${questions.length} 題` : `${answeredCount} / ${questions.length}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!submitted && <Timer minutes={progress.store.settings.examTimerMin} onExpire={submit} />}
            {!submitted && (
              <button type="button" className="system-button-primary min-h-10 px-3 py-1.5" onClick={submit}>
                交卷 <kbd className="font-mono text-[0.55rem]">F10</kbd>
              </button>
            )}
          </div>
        </div>
      </div>

      {submitted && (
        <section className="system-window mb-6 overflow-hidden" role="status" aria-label="模擬考成績">
          <header className="flex justify-between border-b-[3px] border-charcoal bg-crt px-4 py-2 text-document">
            <b className="font-mono text-xs">EXAM RESULT</b>
            <span className="font-mono text-[0.58rem] font-bold">SUBMITTED</span>
          </header>
          <div className="grid items-center gap-5 p-5 sm:grid-cols-[140px_1fr]">
            <div className="grid aspect-square place-items-center border-4 border-charcoal bg-machine text-center">
              <span><small className="system-label block">SCORE</small><strong className="block font-mono text-5xl font-black text-crt">{pct}%</strong></span>
            </div>
            <div>
              <h2 className="text-2xl font-black">考試完成</h2>
              <p className="mt-3 border-y-[3px] border-double border-line py-3 text-ink-soft">
                得分 <strong className="mx-1 font-mono text-3xl text-ink">{score}</strong> / {questions.length}
              </p>
              <p className="mt-3 font-mono text-[0.62rem] font-bold text-instruction">下方已顯示答案與詳解資料</p>
            </div>
          </div>
        </section>
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
        <button type="button" className="system-button-primary mt-6 w-full" onClick={submit}>
          交卷 <kbd className="font-mono text-[0.58rem]">SUBMIT F10</kbd>
        </button>
      )}
    </div>
  );
}
