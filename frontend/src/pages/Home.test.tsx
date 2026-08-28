import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import { useLocalProgress } from "../hooks/useLocalProgress";
import { defaultStore } from "../lib/store";
import { Home } from "./Home";

function renderPopulatedHome() {
  const store = defaultStore();
  store.stats.totalDone = 326;
  store.stats.perSubject.law = { done: 156, correct: 127 };
  store.stats.perSubject.investment = { done: 122, correct: 93 };
  store.stats.perSubject.finance = { done: 48, correct: 34 };
  store.wrongBook = Array.from({ length: 18 }, (_, index) => `wrong-${index}`);
  store.favorites = Array.from({ length: 24 }, (_, index) => `favorite-${index}`);
  localStorage.setItem("gaoye-store-v1", JSON.stringify(store));

  const { result } = renderHook(() => useLocalProgress());
  render(
    <MemoryRouter>
      <Home progress={result.current} bankSize={5400} />
    </MemoryRouter>
  );
}

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("presents live progress through the study-system lesson index", () => {
    renderPopulatedHome();

    expect(screen.getByText("開始學習")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /年份練習/ })).toHaveAttribute("href", "/practice/year");
    expect(screen.getByRole("link", { name: /隨機練習/ })).toHaveAttribute("href", "/practice/random");
    expect(screen.getByRole("link", { name: /科目練習/ })).toHaveAttribute("href", "/practice/subject");
    expect(screen.getByRole("link", { name: /模擬考/ })).toHaveAttribute("href", "/exam");
    expect(screen.getByText("5,400")).toBeInTheDocument();
    expect(screen.getByLabelText("整體正確率 78%")).toHaveTextContent("78%");
    expect(screen.getByText("127 / 156")).toBeInTheDocument();
  });

  it("clears saved progress after confirmation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderPopulatedHome();

    fireEvent.click(screen.getByRole("button", { name: "清除所有進度" }));

    const saved = JSON.parse(localStorage.getItem("gaoye-store-v1") ?? "{}");
    expect(saved.stats.totalDone).toBe(0);
  });
});
