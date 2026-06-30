export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-1">第 {current} / {total} 題</div>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
