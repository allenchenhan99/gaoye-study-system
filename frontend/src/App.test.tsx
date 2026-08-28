import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Question } from "./lib/types";

// 用單題題庫取代真實 fetch，讓練習流程可決定性測試
const q: Question = {
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

vi.mock("./hooks/useQuestionBank", () => ({
  useQuestionBank: () => ({
    questions: [q],
    byId: new Map([[q.id, q]]),
    explanations: new Map(),
    loading: false,
  }),
}));

import App from "./App";

describe("App 練習流程", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "#/practice/random";
  });

  it("作答後停在原題顯示正解，不因 App 重繪而卸載重掛（回歸：答完跳掉）", () => {
    render(<App />);

    expect(screen.getByText("高業學習系統")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("LOCAL DATA READY");

    // 進入設定頁 → 開始練習
    fireEvent.click(screen.getByText("開始練習"));
    expect(screen.getByText("題目一")).toBeInTheDocument();

    // 作答（會呼叫 progress.answer → 觸發 App 重繪）
    fireEvent.click(screen.getByText("丙"));

    // 修好後：仍停在題目、顯示正解，且沒有退回設定頁
    expect(screen.getByText("題目一")).toBeInTheDocument();
    expect(screen.getByText(/正確答案/)).toBeInTheDocument();
    expect(screen.queryByText("開始練習")).not.toBeInTheDocument();
  });
});
