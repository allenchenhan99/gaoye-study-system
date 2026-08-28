import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Timer } from "./Timer";

describe("Timer", () => {
  it("shows the normal system state when more than one minute remains", () => {
    render(<Timer minutes={2} onExpire={() => {}} />);
    expect(screen.getByRole("timer")).toHaveAttribute("data-state", "normal");
    expect(screen.getByRole("timer")).toHaveTextContent("2:00");
  });

  it("switches to warning state for the final minute", () => {
    render(<Timer minutes={1} onExpire={() => {}} />);
    expect(screen.getByRole("timer")).toHaveAttribute("data-state", "warning");
  });

  it("expires immediately when no time remains", () => {
    const onExpire = vi.fn();
    render(<Timer minutes={0} onExpire={onExpire} />);
    expect(onExpire).toHaveBeenCalledOnce();
  });
});
