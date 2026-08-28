import { BlockMeter } from "./BlockMeter";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <section className="mt-6 border-[3px] border-charcoal bg-machine p-3" aria-label="作答進度">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="system-label">PROGRESS / 進度</span>
        <span className="font-mono text-xs font-black text-ink">
          {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_48px] items-center gap-3">
        <BlockMeter value={pct} label={`作答進度 ${pct}%`} />
        <b className="text-right font-mono text-xs">{pct}%</b>
      </div>
    </section>
  );
}
