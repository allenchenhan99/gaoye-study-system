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
      role="timer"
      aria-label={`剩餘時間 ${m} 分 ${s} 秒`}
      data-state={low ? "warning" : "normal"}
      className="system-timer"
    >
      <span className="system-timer-label">TIME</span>
      <b>{m}:{String(s).padStart(2, "0")}</b>
    </span>
  );
}
