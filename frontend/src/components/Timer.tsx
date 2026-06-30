import { useEffect, useState } from "react";

export function Timer({ minutes, onExpire }: { minutes: number; onExpire: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);
  const m = Math.floor(left / 60), s = left % 60;
  return <span className="font-mono">{m}:{String(s).padStart(2, "0")}</span>;
}
