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
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <header className="flex items-end justify-between gap-4 border-b-4 border-charcoal pb-4">
        <div>
          <span className="system-label">SETUP / PAGE 02</span>
          <h2 className="mt-2 text-3xl font-black text-ink">{TITLE[mode]}</h2>
          <p className="mt-1 text-sm text-ink-faint">選取條件後，按下 START 建立本輪題目。</p>
        </div>
        <a href="#/" className="system-button shrink-0">
          <kbd className="font-mono text-[0.58rem]">ESC</kbd> 回首頁
        </a>
      </header>

      <section className="system-window mt-6 overflow-hidden" aria-label={`${TITLE[mode]}設定`}>
        <div className="flex items-center justify-between border-b-[3px] border-charcoal bg-crt px-4 py-2 text-document">
          <b className="font-mono text-xs">PRACTICE CONFIGURATION</b>
          <span className="font-mono text-[0.58rem] font-bold">MODE:{mode.toUpperCase()}</span>
        </div>
        <div className="grid gap-6 p-4 sm:p-6">
        {mode === "year" && (
          <>
            <Field label="年份">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {years.map((y) => (
                  <button
                    type="button"
                    key={y}
                    className={`system-tab ${year === y ? "system-tab-active" : ""}`}
                    aria-pressed={year === y}
                    onClick={() => setYear(year === y ? undefined : y)}
                  >
                    {y} 年
                  </button>
                ))}
              </div>
            </Field>
            <Field label="次別">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[1, 2, 3, 4].map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={`system-tab ${round === r ? "system-tab-active" : ""}`}
                    aria-pressed={round === r}
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SUBJECTS.map((s) => (
              <button
                type="button"
                key={s.key}
                className={`system-tab ${subject === s.key ? "system-tab-active" : ""}`}
                aria-pressed={subject === s.key}
                onClick={() => setSubject(subject === s.key ? undefined : s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 border-[3px] border-charcoal text-sm">
          <div className="border-r-[3px] border-charcoal bg-machine p-3">
            <span className="system-label block">MATCHED RECORDS</span>
            <strong className="mt-1 block font-mono text-xl" aria-label="符合條件題數">{available}</strong>
            <small>符合條件題數</small>
          </div>
          <div className="bg-machine p-3">
            <span className="system-label block">QUEUE SIZE</span>
            <strong className="mt-1 block font-mono text-xl">
              {mode === "year" ? available : Math.min(available, progress.store.settings.perRoundCount)}
            </strong>
            <small>{mode === "year" ? "整份作答" : `上限 ${progress.store.settings.perRoundCount} 題`}</small>
          </div>
        </div>
        </div>
      </section>

      <button type="button" aria-label="開始練習" className="system-button-primary mt-6 w-full" onClick={start} disabled={available === 0}>
        <kbd className="font-mono text-[0.62rem]">START ↵</kbd> 開始練習
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-2.5 border-0 p-0">
      <legend className="system-label mb-1">{label}</legend>
      {children}
    </fieldset>
  );
}
