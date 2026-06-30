import type { useLocalProgress } from "../hooks/useLocalProgress";

const SUBJECTS: { key: "law" | "investment" | "finance"; label: string }[] = [
  { key: "law", label: "法規" },
  { key: "investment", label: "投資學" },
  { key: "finance", label: "財務分析" },
];

export function Stats({ progress }: { progress: ReturnType<typeof useLocalProgress> }) {
  const { stats, wrongBook, favorites } = progress.store;
  const rate = (c: number, d: number) => (d ? Math.round((c / d) * 100) : 0);
  return (
    <div className="p-4 max-w-md mx-auto space-y-2">
      <a href="#/" className="text-sm text-blue-600">← 首頁</a>
      <h2 className="text-xl font-bold">統計</h2>
      <p>總作答：{stats.totalDone} 題</p>
      <p>整體正確率：{rate(SUBJECTS.reduce((a, s) => a + stats.perSubject[s.key].correct, 0), stats.totalDone)}%</p>
      <p>錯題本：{wrongBook.length} 題　收藏：{favorites.length} 題</p>
      <div className="mt-2 border-t pt-2">
        {SUBJECTS.map((s) => (
          <p key={s.key}>
            {s.label}：{stats.perSubject[s.key].correct}/{stats.perSubject[s.key].done}
            （{rate(stats.perSubject[s.key].correct, stats.perSubject[s.key].done)}%）
          </p>
        ))}
      </div>
    </div>
  );
}
