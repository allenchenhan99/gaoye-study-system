import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultStore } from "../lib/store";
import type { Question } from "../lib/types";
import { ExamRunner } from "./ExamRunner";

vi.mock("../components/Timer", () => ({
  Timer: () => <span>60:00</span>,
}));

const question: Question = {
  id: "114-1-law-001",
  year: 114,
  round: 1,
  roundLabel: "第1次",
  subject: "law",
  subjectLabel: "L",
  number: 1,
  stem: "題目一",
  options: { A: "甲", B: "乙", C: "丙", D: "丁" },
  answer: "C",
};

describe("ExamRunner", () => {
  it("records both question answers and the completed exam result", () => {
    const answer = vi.fn();
    const recordExam = vi.fn();
    const progress = {
      store: defaultStore(),
      answer,
      toggleFav: vi.fn(),
      removeWrong: vi.fn(),
      recordExam,
      clearAll: vi.fn(),
    };
    window.scrollTo = vi.fn();

    render(
      <ExamRunner
        questions={[question]}
        explanations={new Map()}
        progress={progress}
      />
    );

    fireEvent.click(screen.getByText("丙"));
    fireEvent.click(screen.getAllByRole("button", { name: /交卷/ })[0]);

    expect(answer).toHaveBeenCalledWith(question, "C");
    expect(recordExam).toHaveBeenCalledWith(1, 1);
    expect(screen.getByRole("status", { name: "模擬考成績" })).toHaveTextContent("100%");
  });
});
