import { Link } from "react-router-dom";
import type { useLocalProgress } from "../hooks/useLocalProgress";

interface ModeItem {
  to: string;
  label: string;
  desc: string;
  glyph: string;
  accent?: boolean;
}

const PRACTICE: ModeItem[] = [
  { to: "/practice/year", label: "年份練習", desc: "選年份 · 次別 · 科目", glyph: "◷" },
  { to: "/practice/random", label: "隨機練習", desc: "全題庫隨機抽題", glyph: "⁙" },
  { to: "/practice/subject", label: "科目練習", desc: "三科擇一深耕", glyph: "❖" },
];

const REVIEW: ModeItem[] = [
  { to: "/review/wrong", label: "錯題本", desc: "答錯自動收錄", glyph: "✎" },
  { to: "/review/favorites", label: "收藏", desc: "標星題目重練", glyph: "★" },
  { to: "/stats", label: "統計", desc: "作答與正確率", glyph: "◔" },
];

export function Home({
  progress,
  bankSize,
}: {
  progress: ReturnType<typeof useLocalProgress>;
  bankSize: number;
}) {
  const { totalDone, perSubject } = progress.store.stats;
  const correct = perSubject.law.correct + perSubject.investment.correct + perSubject.finance.correct;
  const overall = totalDone ? Math.round((correct / totalDone) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      {/* Hero */}
      <header className="animate-fade-rise">
        <div className="eyebrow">證券商 · 高級業務員</div>
        <h1 className="mt-2 font-serif text-[2.6rem] font-black leading-[1.1] text-ink sm:text-5xl">
          考古題
          <span className="relative ml-1 inline-block text-pine">
            應試精練
            <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-gold to-transparent" />
          </span>
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-ink-soft">
          {bankSize.toLocaleString()} 題歷屆試題，逐題官方答案與詳解。即時對錯、模擬計時、錯題自動收錄，進度存於本機。
        </p>
      </header>

      {/* 進度條 */}
      <div
        className="card animate-fade-rise mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 p-5 sm:p-6"
        style={{ animationDelay: "60ms" }}
      >
        <Metric label="已作答" value={totalDone} unit="題" />
        <Divider />
        <Metric label="正確率" value={overall} unit="%" tone="pine" />
        <Divider />
        <Metric label="錯題本" value={progress.store.wrongBook.length} unit="題" tone="wrong" />
        <Link to="/exam" className="btn-primary ml-auto">
          開始模擬考 <span aria-hidden>→</span>
        </Link>
      </div>

      {/* 練習模式 */}
      <Section title="題庫練習" />
      <div className="grid gap-4 sm:grid-cols-3">
        {PRACTICE.map((m, i) => (
          <ModeCard key={m.to} item={m} delay={120 + i * 55} />
        ))}
      </div>

      <Section title="複習與追蹤" />
      <div className="grid gap-4 sm:grid-cols-3">
        {REVIEW.map((m, i) => (
          <ModeCard key={m.to} item={m} delay={300 + i * 55} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          className="text-sm text-ink-faint underline decoration-line underline-offset-4 transition-colors hover:text-wrong"
          onClick={() => {
            if (confirm("確定清除所有進度？")) progress.clearAll();
          }}
        >
          清除所有進度
        </button>
      </div>
    </div>
  );
}

function ModeCard({ item, delay }: { item: ModeItem; delay: number }) {
  return (
    <Link
      to={item.to}
      style={{ animationDelay: `${delay}ms` }}
      className="card animate-fade-rise group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-card-hover"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-xl text-pine transition-colors group-hover:border-gold group-hover:text-gold-deep">
          {item.glyph}
        </span>
        <span className="text-ink-faint transition-transform duration-200 group-hover:translate-x-1">→</span>
      </div>
      <h3 className="mt-4 font-serif text-xl font-bold text-ink">{item.label}</h3>
      <p className="mt-1 text-sm text-ink-soft">{item.desc}</p>
    </Link>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="mb-4 mt-10 flex items-center gap-3">
      <h2 className="eyebrow">{title}</h2>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone?: "pine" | "wrong";
}) {
  const color = tone === "pine" ? "text-pine" : tone === "wrong" ? "text-wrong" : "text-ink";
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className={`mt-1 font-serif text-3xl font-black tabular-nums ${color}`}>
        {value}
        <span className="ml-0.5 text-base font-normal text-ink-faint">{unit}</span>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-10 w-px bg-line sm:block" />;
}
