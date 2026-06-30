import type { Question, Choice } from "./types";

export function isCorrect(q: Question, choice: Choice): boolean {
  if (q.allCredit) return true;
  return choice === q.answer;
}
