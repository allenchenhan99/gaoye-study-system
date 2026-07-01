import type { Question, Choice, Explanation } from "../lib/types";
import { isCorrect } from "../lib/scoring";
import { ExplanationView } from "./ExplanationView";

const LETTERS: Choice[] = ["A", "B", "C", "D"];

const SUBJECT_TAG: Record<string, string> = {
  law: "法規",
  investment: "投資學",
  finance: "財務分析",
};

interface Props {
  question: Question;
  explanation?: Explanation;
  mode: "immediate" | "deferred";
  selected: Choice | null;
  revealed: boolean;
  onSelect: (c: Choice) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function QuestionCard(props: Props) {
  const { question: q, explanation, selected, revealed, onSelect, isFavorite, onToggleFavorite } = props;
  const answeredRight = !!selected && isCorrect(q, selected);

  function optionState(letter: Choice): "idle" | "picked" | "correct" | "wrong" | "muted" {
    if (!revealed) return selected === letter ? "picked" : "idle";
    if (q.allCredit) return "correct";
    if (letter === q.answer) return "correct";
    if (letter === selected) return "wrong";
    return "muted";
  }

  function optionClass(letter: Choice): string {
    const base =
      "group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150";
    switch (optionState(letter)) {
      case "picked":
        return `${base} border-pine bg-pine/[0.06] shadow-inset`;
      case "correct":
        return `${base} border-correct bg-correct-bg animate-pop`;
      case "wrong":
        return `${base} border-wrong bg-wrong-bg animate-shake`;
      case "muted":
        return `${base} border-line bg-surface opacity-60`;
      default:
        return `${base} border-line bg-surface-raised hover:-translate-y-px hover:border-gold hover:shadow-card`;
    }
  }

  function badgeClass(letter: Choice): string {
    const base =
      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-sm font-medium transition-colors";
    switch (optionState(letter)) {
      case "picked":
        return `${base} border-pine bg-pine text-paper`;
      case "correct":
        return `${base} border-correct bg-correct text-paper`;
      case "wrong":
        return `${base} border-wrong bg-wrong text-paper`;
      case "muted":
        return `${base} border-line bg-paper text-ink-faint`;
      default:
        return `${base} border-line bg-paper text-ink-soft group-hover:border-gold group-hover:text-gold-deep`;
    }
  }

  return (
    <article className="card animate-fade-rise overflow-hidden">
      {/* 頂端金線 */}
      <div className="h-1 bg-gradient-to-r from-gold/70 via-gold to-transparent" />
      <div className="p-5 sm:p-6">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="eyebrow">{SUBJECT_TAG[q.subject] ?? q.subject}</span>
            <p className="mt-1 font-mono text-xs text-ink-faint">
              {q.year} 年 {q.roundLabel} · 第 {q.number} 題
            </p>
          </div>
          <button
            onClick={onToggleFavorite}
            aria-label="收藏"
            aria-pressed={isFavorite}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-lg transition-all duration-150 ${
              isFavorite
                ? "border-gold bg-gold/10 text-gold"
                : "border-line text-ink-faint hover:border-gold hover:text-gold"
            }`}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </header>

        <p className="mb-5 whitespace-pre-wrap font-serif text-lg leading-8 text-ink">{q.stem}</p>

        <div className="space-y-2.5">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              className={optionClass(letter)}
              disabled={revealed}
              onClick={() => onSelect(letter)}
            >
              <span className={badgeClass(letter)}>{letter}</span>
              <span className="pt-0.5 leading-7 text-ink">{q.options[letter]}</span>
            </button>
          ))}
        </div>

        {revealed && (
          <div className="mt-5 border-t border-line pt-4">
            {q.allCredit ? (
              <div className="flex items-center gap-2 font-semibold text-correct">
                <VerdictDot tone="correct" />
                送分題（官方公告任選皆對）
              </div>
            ) : (
              <div
                className={`flex items-center gap-2 font-semibold ${
                  answeredRight ? "text-correct" : "text-wrong"
                }`}
              >
                <VerdictDot tone={answeredRight ? "correct" : "wrong"} />
                {answeredRight ? "答對！" : "答錯"}
                <span className="ml-1 font-normal text-ink-soft">
                  正確答案：<span className="font-mono font-semibold text-ink">({q.answer})</span>
                </span>
              </div>
            )}
            <ExplanationView explanation={explanation} />
          </div>
        )}
      </div>
    </article>
  );
}

function VerdictDot({ tone }: { tone: "correct" | "wrong" }) {
  return (
    <span
      aria-hidden
      className={`grid h-5 w-5 place-items-center rounded-full text-xs text-paper ${
        tone === "correct" ? "bg-correct" : "bg-wrong"
      }`}
    >
      {tone === "correct" ? "✓" : "✕"}
    </span>
  );
}
