import { useMemo, useState } from "react";
import type { Question, Explanation, Subject } from "../lib/types";
import { sampleQuestions } from "../lib/sampling";
import { QuizRunner } from "./QuizRunner";
import type { useLocalProgress } from "../hooks/useLocalProgress";

interface Props {
  mode: "year" | "random" | "subject";
  questions: Question[];
  explanations: Map<string, Explanation>;
  progress: ReturnType<typeof useLocalProgress>;
}
const SUBJECTS: { key: Subject; label: string }[] = [
  { key: "law", label: "法規" },
  { key: "investment", label: "投資學" },
  { key: "finance", label: "財務分析" },
];

const TITLE: Record<Props["mode"], string> = {
  year: "年份練習",
  random: "隨機練習",
  subject: "科目練習",
};

export function PracticeSetup({ mode, questions, explanations, progress }: Props) {
  const [subject, setSubject] = useState<Subject | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [round, setRound] = useState<number | undefined>();
  const [queue, setQueue] = useState<Question[] | null>(null);

  const years = useMemo(
    () => [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a),
    [questions]
  );

  const available = useMemo(
    () =>
      questions.filter(
        (q) =>
          (subject === undefined || q.subject === subject) &&
          (year === undefined || q.year === year) &&
          (round === undefined || q.round === round)
      ).length,
    [questions, subject, year, round]
  );

  if (queue) return <QuizRunner questions={queue} explanations={explanations} progress={progress} />;

  function start() {
    const count = mode === "year" ? undefined : progress.store.settings.perRoundCount;
    setQueue(sampleQuestions(questions, { subject, year, round, count }));
  }

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-6">
      <a href="#/" className="btn-ghost">
        <span aria-hidden>←</span> 回首頁
      </a>

      <header className="mt-5">
        <div className="eyebrow">設定練習</div>
        <h2 className="mt-1 font-serif text-3xl font-black text-ink">{TITLE[mode]}</h2>
      </header>

      <div className="card mt-5 space-y-6 p-5 sm:p-6">
        {mode === "year" && (
          <>
            <Field label="年份">
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    className={`pill ${year === y ? "pill-on" : ""}`}
                    onClick={() => setYear(year === y ? undefined : y)}
                  >
                    {y} 年
                  </button>
                ))}
              </div>
            </Field>
            <Field label="次別">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    className={`pill ${round === r ? "pill-on" : ""}`}
                    onClick={() => setRound(round === r ? undefined : r)}
                  >
                    第{r}次
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        <Field label={`科目${mode !== "subject" ? "（可不選＝全部）" : ""}`}>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.key}
                className={`pill ${subject === s.key ? "pill-on" : ""}`}
                onClick={() => setSubject(subject === s.key ? undefined : s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-ink-faint">
            符合條件 <span className="font-mono font-semibold text-ink">{available}</span> 題
          </span>
          <span className="text-ink-faint">
            {mode === "year" ? "整份作答" : `本輪 ${progress.store.settings.perRoundCount} 題`}
          </span>
        </div>
      </div>

      <button className="btn-primary mt-6 w-full" onClick={start} disabled={available === 0}>
        開始練習
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="eyebrow">{label}</div>
      {children}
    </div>
  );
}
