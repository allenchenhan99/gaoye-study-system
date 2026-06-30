import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionCard } from "./QuestionCard";
import type { Question } from "../lib/types";

const q: Question = {
  id: "x", year: 114, round: 1, roundLabel: "第1次", subject: "law",
  subjectLabel: "證券交易相關法規與實務", number: 7, stem: "題幹內容",
  options: { A: "甲", B: "乙", C: "丙", D: "丁" }, answer: "C",
};

function renderCard(props: Partial<React.ComponentProps<typeof QuestionCard>> = {}) {
  return render(
    <QuestionCard question={q} mode="immediate" selected={null} revealed={false}
      onSelect={() => {}} isFavorite={false} onToggleFavorite={() => {}} {...props} />
  );
}

describe("QuestionCard", () => {
  it("shows stem and four options", () => {
    renderCard();
    expect(screen.getByText("題幹內容")).toBeInTheDocument();
    expect(screen.getByText("甲")).toBeInTheDocument();
    expect(screen.getByText("丁")).toBeInTheDocument();
  });
  it("calls onSelect when an option clicked", () => {
    const onSelect = vi.fn();
    renderCard({ onSelect });
    fireEvent.click(screen.getByText("丙"));
    expect(onSelect).toHaveBeenCalledWith("C");
  });
  it("reveals correct answer marker when revealed", () => {
    renderCard({ selected: "A", revealed: true });
    expect(screen.getByText(/正確答案/)).toBeInTheDocument();
  });
  it("shows 送分題 for allCredit when revealed", () => {
    renderCard({ question: { ...q, answer: null, allCredit: true }, selected: "A", revealed: true });
    expect(screen.getByText(/送分題/)).toBeInTheDocument();
  });
  it("shows placeholder when no explanation", () => {
    renderCard({ selected: "C", revealed: true });
    expect(screen.getByText(/詳解陸續補充中/)).toBeInTheDocument();
  });
});
