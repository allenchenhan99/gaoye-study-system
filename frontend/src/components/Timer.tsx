import { useEffect, useState } from "react";

export function Timer({ minutes, onExpire }: { minutes: number; onExpire: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    if (left <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const low = left <= 60;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm tabular-nums ${
        low ? "animate-pulse border-wrong/40 bg-wrong-bg text-wrong" : "border-line bg-surface text-ink-soft"
      }`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${low ? "bg-wrong" : "bg-pine-500"}`} />
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}
