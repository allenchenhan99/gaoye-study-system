export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mt-6">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="eyebrow">進度</span>
        <span className="font-mono text-xs text-ink-faint">
          第 {current} / {total} 題
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pine to-pine-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
