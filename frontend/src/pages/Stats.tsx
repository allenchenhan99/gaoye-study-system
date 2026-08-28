import type { useLocalProgress } from "../hooks/useLocalProgress";
import type { Subject } from "../lib/types";
import { BlockMeter } from "../components/BlockMeter";

const SUBJECTS: { key: Subject; label: string }[] = [
  { key: "law", label: "法規" },
  { key: "investment", label: "投資學" },
  { key: "finance", label: "財務分析" },
];

export function Stats({ progress }: { progress: ReturnType<typeof useLocalProgress> }) {
  const { stats, wrongBook, favorites } = progress.store;
  const rate = (c: number, d: number) => (d ? Math.round((c / d) * 100) : 0);
  const totalCorrect = SUBJECTS.reduce((a, s) => a + stats.perSubject[s.key].correct, 0);
  const overall = rate(totalCorrect, stats.totalDone);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <header className="flex items-end justify-between gap-4 border-b-4 border-charcoal pb-4">
        <div>
          <span className="system-label">RECORDS / PAGE 06</span>
          <h2 className="mt-2 text-3xl font-black text-ink">學習統計</h2>
          <p className="mt-1 text-sm text-ink-faint">所有數據會同步至你的個人學習空間。</p>
        </div>
        <a href="#/" className="system-button shrink-0">
          <kbd className="font-mono text-[0.58rem]">ESC</kbd> 首頁
        </a>
      </header>

      <section className="system-window mt-6 overflow-hidden" aria-label="整體學習記錄">
        <header className="flex items-center justify-between border-b-[3px] border-charcoal bg-crt px-4 py-2 text-document">
          <b className="font-mono text-xs">OVERALL PERFORMANCE</b>
          <span className="font-mono text-[0.58rem] font-bold">CLOUD RECORD</span>
        </header>
        <div className="grid items-stretch sm:grid-cols-[190px_1fr]">
          <div className="grid place-items-center border-b-[3px] border-charcoal bg-machine p-6 text-center sm:border-b-0 sm:border-r-[3px]">
            <span>
              <small className="system-label block">ACCURACY</small>
              <strong className="mt-2 block font-mono text-5xl font-black tabular-nums text-crt">{overall}%</strong>
            </span>
          </div>
          <div className="grid content-center gap-5 p-5 sm:p-7">
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>整體正確率</span>
                <span className="font-mono">{totalCorrect} / {stats.totalDone}</span>
              </div>
              <BlockMeter value={overall} label="整體正確率" />
            </div>
            <div className="grid grid-cols-2 border-[3px] border-charcoal bg-machine text-sm">
              <span className="border-r-[3px] border-charcoal p-3"><b className="system-label block">TOTAL DONE</b><strong className="font-mono text-xl">{stats.totalDone}</strong> 題</span>
              <span className="p-3"><b className="system-label block">TOTAL CORRECT</b><strong className="font-mono text-xl">{totalCorrect}</strong> 題</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <RecordCell href="#/review/wrong" label="錯題本" ariaLabel="錯題本數量" value={wrongBook.length} code="ERROR RECORDS" tone="wrong" />
        <RecordCell href="#/review/favorites" label="收藏" ariaLabel="收藏數量" value={favorites.length} code="FAVORITE DATA" tone="warning" />
      </div>

      <section className="system-window mt-5 overflow-hidden" aria-label="科目別記錄">
        <header className="flex items-center justify-between border-b-[3px] border-charcoal bg-machine px-4 py-2">
          <b className="system-label">SUBJECT RECORDS</b>
          <span className="font-mono text-[0.58rem] font-bold">3 FILES</span>
        </header>
        <div className="overflow-x-auto">
          <table className="system-table min-w-[600px]">
            <thead>
              <tr><th>科目</th><th>答對 / 作答</th><th>正確率</th><th>區塊圖</th></tr>
            </thead>
            <tbody>
              {SUBJECTS.map((s) => {
                const d = stats.perSubject[s.key];
                const r = rate(d.correct, d.done);
                return (
                  <tr key={s.key}>
                    <th scope="row" className="font-bold text-ink">{s.label}</th>
                    <td className="font-mono font-bold">{d.correct} / {d.done}</td>
                    <td className="font-mono font-black text-crt">{r}%</td>
                    <td className="w-[240px]"><BlockMeter value={r} label={`${s.label}正確率`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RecordCell({
  href,
  label,
  ariaLabel,
  value,
  code,
  tone,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  value: number;
  code: string;
  tone: "wrong" | "warning";
}) {
  return (
    <a href={href} aria-label={ariaLabel} className="system-window grid grid-cols-[10px_1fr_auto] items-stretch overflow-hidden no-underline">
      <span className={tone === "wrong" ? "bg-wrong" : "bg-warning"} />
      <span className="p-3">
        <b className="block text-sm">{label}</b>
        <small className="font-mono text-[0.55rem] font-bold text-ink-faint">{code}</small>
      </span>
      <strong className={`grid place-items-center border-l-[3px] border-charcoal px-4 font-mono text-3xl ${tone === "wrong" ? "text-wrong" : "text-warning"}`}>{value}</strong>
    </a>
  );
}
