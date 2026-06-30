export type Choice = "A" | "B" | "C" | "D";
export type Subject = "law" | "investment" | "finance";

export interface Question {
  id: string;
  year: number;
  round: number;
  roundLabel: string;
  subject: Subject;
  subjectLabel: string;
  number: number;
  stem: string;
  options: Record<Choice, string>;
  answer: Choice | null;
  allCredit?: boolean;
}

export interface Explanation {
  id: string;
  explanation: string;
  flagged?: boolean;
}
