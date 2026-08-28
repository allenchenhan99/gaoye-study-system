import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalProgress } from "../hooks/useLocalProgress";
import { defaultStore } from "../lib/store";
import { Stats } from "./Stats";

describe("Stats", () => {
  beforeEach(() => localStorage.clear());

  it("renders live records with block meters and no circular SVG chart", () => {
    const store = defaultStore();
    store.stats.totalDone = 100;
    store.stats.perSubject.law = { done: 40, correct: 30 };
    store.stats.perSubject.investment = { done: 20, correct: 15 };
    store.stats.perSubject.finance = { done: 40, correct: 30 };
    store.wrongBook = ["w1", "w2", "w3"];
    store.favorites = ["f1", "f2"];
    localStorage.setItem("gaoye-store-v1", JSON.stringify(store));

    const { result } = renderHook(() => useLocalProgress());
    const { container } = render(<Stats progress={result.current} />);

    expect(screen.getByRole("progressbar", { name: "整體正確率" })).toHaveAttribute("aria-valuenow", "75");
    expect(screen.getByLabelText("錯題本數量")).toHaveTextContent("3");
    expect(screen.getByLabelText("收藏數量")).toHaveTextContent("2");
    expect(screen.getByRole("row", { name: /法規 30 \/ 40 75%/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /投資學 15 \/ 20 75%/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /財務分析 30 \/ 40 75%/ })).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
