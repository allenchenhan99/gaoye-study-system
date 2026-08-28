import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalProgress } from "../hooks/useLocalProgress";
import type { Question } from "../lib/types";
import { PracticeSetup } from "./PracticeSetup";

const QUESTIONS: Question[] = [
  {
    id: "law-114",
    year: 114,
    round: 1,
    roundLabel: "第1次",
    subject: "law",
    subjectLabel: "法規",
    number: 1,
    stem: "114 年法規題",
    options: { A: "甲", B: "乙", C: "丙", D: "丁" },
    answer: "A",
  },
  {
    id: "finance-113",
    year: 113,
    round: 2,
    roundLabel: "第2次",
    subject: "finance",
    subjectLabel: "財務分析",
    number: 2,
    stem: "113 年財務題",
    options: { A: "甲", B: "乙", C: "丙", D: "丁" },
    answer: "B",
  },
];

function renderSetup(mode: "year" | "random" | "subject", questions = QUESTIONS) {
  const { result } = renderHook(() => useLocalProgress());
  return render(
    <PracticeSetup mode={mode} questions={questions} explanations={new Map()} progress={result.current} />
  );
}

describe("PracticeSetup", () => {
  beforeEach(() => localStorage.clear());

  it("offers year, round, and optional subject filters with pressed state", () => {
    renderSetup("year");

    expect(screen.getByText("年份", { selector: "legend" })).toBeInTheDocument();
    expect(screen.getByText("次別", { selector: "legend" })).toBeInTheDocument();
    expect(screen.getByText(/科目（可不選/)).toBeInTheDocument();

    const year = screen.getByRole("button", { name: "114 年" });
    expect(year).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(year);
    expect(year).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("符合條件題數")).toHaveTextContent("1");
  });

  it("keeps random mode free of year and round filters", () => {
    renderSetup("random");
    expect(screen.queryByText("年份", { selector: "legend" })).not.toBeInTheDocument();
    expect(screen.queryByText("次別", { selector: "legend" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "法規" })).toBeInTheDocument();
  });

  it("starts the existing quiz flow with the filtered fixture question", () => {
    renderSetup("subject", [QUESTIONS[0]]);
    fireEvent.click(screen.getByRole("button", { name: "法規" }));
    fireEvent.click(screen.getByRole("button", { name: "開始練習" }));
    expect(screen.getByText("114 年法規題")).toBeInTheDocument();
  });
});
