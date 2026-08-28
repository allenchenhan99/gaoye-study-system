import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { QuizRunner } from "./QuizRunner";
import { useLocalProgress } from "../hooks/useLocalProgress";
import type { Question } from "../lib/types";

const mk = (id: string, answer: Question["answer"]): Question => ({
  id,
  year: 114,
  round: 1,
  roundLabel: "第1次",
  subject: "law",
  subjectLabel: "L",
  number: 1,
  stem: `題${id}`,
  options: { A: "甲", B: "乙", C: "丙", D: "丁" },
  answer,
});

describe("QuizRunner", () => {
  beforeEach(() => localStorage.clear());

  it("reveals the answer and explanation after selecting, without auto-advancing", () => {
    const qs = [mk("a", "C"), mk("b", "A")];
    const { result } = renderHook(() => useLocalProgress());
    render(<QuizRunner questions={qs} explanations={new Map()} progress={result.current} />);

    expect(screen.getByRole("progressbar", { name: "作答進度 50%" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("丙")); // 答對 a
    // 停在原題，顯示正解與詳解，不自動跳題
    expect(screen.getByText("題a")).toBeInTheDocument();
    expect(screen.getByText(/正確答案/)).toBeInTheDocument();
    expect(screen.getByText(/詳解陸續補充中/)).toBeInTheDocument();
    expect(screen.queryByText("題b")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("下一題"));
    expect(screen.getByText("題b")).toBeInTheDocument();
  });

  it("stays on the answered question even if the parent shrinks the list (錯題本移除當題)", () => {
    // 模擬錯題本：答對後父層把該題移出清單、重新以較短陣列 rerender
    const full = [mk("a", "C"), mk("b", "A")];
    const { result } = renderHook(() => useLocalProgress());
    const { rerender } = render(
      <QuizRunner questions={full} explanations={new Map()} progress={result.current} />
    );

    fireEvent.click(screen.getByText("丙")); // 答對 a → 錯題本會移除 a
    rerender(
      <QuizRunner questions={[mk("b", "A")]} explanations={new Map()} progress={result.current} />
    );

    // 仍停在 a 並顯示正解，不因清單縮短而跳到 b
    expect(screen.getByText("題a")).toBeInTheDocument();
    expect(screen.getByText(/正確答案/)).toBeInTheDocument();
    expect(screen.queryByText("題b")).not.toBeInTheDocument();
  });

  it("presents a system result status after finishing a round", () => {
    const { result } = renderHook(() => useLocalProgress());
    render(<QuizRunner questions={[mk("a", "C")]} explanations={new Map()} progress={result.current} />);

    fireEvent.click(screen.getByText("丙"));
    fireEvent.click(screen.getByRole("button", { name: /完成/ }));

    expect(screen.getByRole("status", { name: "本輪學習結果" })).toHaveTextContent("100%");
  });
});
