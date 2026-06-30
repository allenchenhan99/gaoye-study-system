import type { Question, Choice, Explanation } from "../lib/types";
import { isCorrect } from "../lib/scoring";
import { ExplanationView } from "./ExplanationView";

const LETTERS: Choice[] = ["A", "B", "C", "D"];

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

  function optionClass(letter: Choice): string {
    const base = "w-full text-left px-4 py-2 rounded border mb-2 transition";
    if (!revealed) {
      return `${base} ${selected === letter ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`;
    }
    if (q.allCredit) return `${base} border-green-400 bg-green-100`;
    if (letter === q.answer) return `${base} border-green-500 bg-green-100`;
    if (letter === selected) return `${base} border-red-500 bg-red-100`;
    return `${base} border-gray-300`;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>{q.year} 年{q.roundLabel}・{q.subjectLabel}・第 {q.number} 題</span>
        <button onClick={onToggleFavorite} aria-label="收藏" className="text-lg">{isFavorite ? "★" : "☆"}</button>
      </div>
      <p className="font-medium mb-3 whitespace-pre-wrap">{q.stem}</p>
      <div>
        {LETTERS.map((letter) => (
          <button key={letter} className={optionClass(letter)}
            disabled={revealed} onClick={() => onSelect(letter)}>
            <span className="font-semibold mr-2">({letter})</span>{q.options[letter]}
          </button>
        ))}
      </div>
      {revealed && (
        <div className="mt-3 text-sm">
          {q.allCredit ? (
            <p className="text-green-700 font-semibold">送分題（官方公告任選皆對）</p>
          ) : (
            <p className={selected && isCorrect(q, selected) ? "text-green-700" : "text-red-700"}>
              {selected && isCorrect(q, selected) ? "答對！" : "答錯"} 正確答案：({q.answer})
            </p>
          )}
          <ExplanationView explanation={explanation} />
        </div>
      )}
    </div>
  );
}
