import type { useLocalProgress } from "../hooks/useLocalProgress";
import type { Subject } from "../lib/types";

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
    <div className="mx-auto max-w-lg p-4 sm:p-6">
      <a href="#/" className="btn-ghost">
        <span aria-hidden>←</span> 首頁
      </a>

      <header className="mt-5">
        <div className="eyebrow">學習儀表</div>
        <h2 className="mt-1 font-serif text-3xl font-black text-ink">統計</h2>
      </header>

      <div className="card mt-5 flex items-center gap-6 p-6">
        <Ring pct={overall} />
        <div className="space-y-1">
          <p className="text-sm text-ink-faint">整體正確率</p>
          <p className="font-serif text-2xl font-bold text-ink">
            {totalCorrect}
            <span className="text-ink-faint"> / {stats.totalDone}</span>
          </p>
          <p className="text-sm text-ink-soft">累積作答 {stats.totalDone} 題</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat label="錯題本" value={wrongBook.length} suffix="題" tone="wrong" />
        <Stat label="收藏" value={favorites.length} suffix="題" tone="gold" />
      </div>

      <div className="card mt-4 divide-y divide-line p-2">
        {SUBJECTS.map((s) => {
          const d = stats.perSubject[s.key];
          const r = rate(d.correct, d.done);
          return (
            <div key={s.key} className="p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-medium text-ink">{s.label}</span>
                <span className="font-mono text-sm text-ink-soft">
                  {d.correct}/{d.done}
                  <span className="ml-2 font-semibold text-pine">{r}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pine to-pine-500 transition-all duration-500"
                  style={{ width: `${r}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct / 100);
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#EBE3D2" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#17493A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <span className="absolute font-serif text-xl font-black tabular-nums text-pine">{pct}%</span>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix: string;
  tone: "wrong" | "gold";
}) {
  return (
    <div className="card p-4">
      <div className="eyebrow">{label}</div>
      <p className="mt-1 font-serif text-3xl font-black tabular-nums">
        <span className={tone === "wrong" ? "text-wrong" : "text-gold-deep"}>{value}</span>
        <span className="ml-1 text-base font-normal text-ink-faint">{suffix}</span>
      </p>
    </div>
  );
}
