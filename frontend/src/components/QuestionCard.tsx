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
  const { question: q, explanation, mode, selected, revealed, onSelect, isFavorite, onToggleFavorite } = props;
  const answeredRight = !!selected && isCorrect(q, selected);

  function optionState(letter: Choice): "idle" | "picked" | "correct" | "wrong" | "muted" {
    if (!revealed) return selected === letter ? "picked" : "idle";
    if (q.allCredit) return "correct";
    if (letter === q.answer) return "correct";
    if (letter === selected) return "wrong";
    return "muted";
  }

  return (
    <article className="question-document system-window overflow-hidden border-l-[10px] border-l-instruction">
      <header className="grid grid-cols-[1fr_auto] items-start gap-3 border-b-[3px] border-charcoal bg-machine p-3 sm:p-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-charcoal bg-crt font-mono text-xl font-black text-document">
            {String(q.number).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span className="system-label">QUESTION DATA / {SUBJECT_TAG[q.subject] ?? q.subject}</span>
            <p className="mt-1 font-mono text-xs text-ink-faint">
              {q.year} 年 {q.roundLabel} · 第 {q.number} 題
            </p>
            <p className="mt-1 font-mono text-[0.58rem] font-bold text-crt">
              {mode === "immediate" ? "INSTANT CHECK" : "DEFERRED CHECK"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label="收藏"
          aria-pressed={isFavorite}
          className="favorite-key"
          data-active={isFavorite ? "true" : "false"}
        >
          <span aria-hidden>{isFavorite ? "★" : "☆"}</span>
          <small>FAV</small>
        </button>
      </header>

      <div className="p-4 sm:p-6">
        <p className="question-stem mb-6 whitespace-pre-wrap border-b-[3px] border-double border-line pb-5 text-lg font-bold leading-8 text-ink">
          {q.stem}
        </p>

        <div className="grid gap-3" aria-label="答案選項">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              className="answer-option"
              data-state={optionState(letter)}
              disabled={revealed}
              onClick={() => onSelect(letter)}
            >
              <span className="answer-option-key">{letter}</span>
              <span className="answer-option-copy">{q.options[letter]}</span>
              <span className="answer-option-status" aria-hidden>
                {optionState(letter) === "correct" ? "OK" : optionState(letter) === "wrong" ? "NG" : "↵"}
              </span>
            </button>
          ))}
        </div>

        {revealed && (
          <div className="mt-6 border-t-[3px] border-charcoal pt-4">
            {q.allCredit ? (
              <div className="answer-verdict" data-tone="correct">
                <VerdictDot tone="correct" />
                送分題（官方公告任選皆對）
              </div>
            ) : (
              <div
                className="answer-verdict"
                data-tone={answeredRight ? "correct" : "wrong"}
              >
                <VerdictDot tone={answeredRight ? "correct" : "wrong"} />
                {answeredRight ? "答對！" : "答錯"}
                <span className="ml-1 font-normal">
                  正確答案：<span className="font-mono font-black">[{q.answer}]</span>
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
      className="grid h-6 w-6 place-items-center border-2 border-current bg-document font-mono text-xs font-black"
    >
      {tone === "correct" ? "✓" : "✕"}
    </span>
  );
}
