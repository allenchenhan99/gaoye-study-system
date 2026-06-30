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

export function PracticeSetup({ mode, questions, explanations, progress }: Props) {
  const [subject, setSubject] = useState<Subject | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [round, setRound] = useState<number | undefined>();
  const [queue, setQueue] = useState<Question[] | null>(null);

  const years = useMemo(
    () => [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a),
    [questions]
  );

  if (queue) return <QuizRunner questions={queue} explanations={explanations} progress={progress} />;

  function start() {
    const count = mode === "year" ? undefined : progress.store.settings.perRoundCount;
    setQueue(sampleQuestions(questions, { subject, year, round, count }));
  }

  const pillSelected = "bg-blue-600 text-white border-blue-600";
  const pill = "px-3 py-1 rounded border border-gray-300";

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <a href="#/" className="text-sm text-blue-600">← 回首頁</a>
      <h2 className="text-xl font-bold">
        {mode === "year" ? "年份練習" : mode === "subject" ? "科目練習" : "隨機練習"}
      </h2>

      {mode === "year" && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">年份</div>
          <div className="flex flex-wrap gap-2">
            {years.map((y) => (
              <button key={y} className={`${pill} ${year === y ? pillSelected : ""}`} onClick={() => setYear(y)}>{y} 年</button>
            ))}
          </div>
          <div className="text-sm text-gray-600">次別</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((r) => (
              <button key={r} className={`${pill} ${round === r ? pillSelected : ""}`} onClick={() => setRound(r)}>第{r}次</button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-gray-600">科目{mode !== "subject" ? "（可不選＝全部）" : ""}</div>
        <div className="flex gap-2">
          {SUBJECTS.map((s) => (
            <button key={s.key} className={`${pill} ${subject === s.key ? pillSelected : ""}`}
              onClick={() => setSubject(subject === s.key ? undefined : s.key)}>{s.label}</button>
          ))}
        </div>
      </div>

      {mode !== "year" && (
        <div className="text-sm text-gray-500">每輪題數：{progress.store.settings.perRoundCount} 題</div>
      )}

      <button className="px-4 py-2 bg-green-600 text-white rounded w-full" onClick={start}>開始練習</button>
    </div>
  );
}
