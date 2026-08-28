import { render, screen } from "@testing-library/react";
import { BlockMeter } from "./BlockMeter";

describe("BlockMeter", () => {
  it("represents a percentage with ten discrete system blocks", () => {
    render(<BlockMeter value={78} label="整體正確率" />);

    const meter = screen.getByRole("progressbar", { name: "整體正確率" });
    expect(meter).toHaveAttribute("aria-valuenow", "78");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter.querySelectorAll("[data-segment]")).toHaveLength(10);
    expect(meter.querySelectorAll('[data-filled="true"]')).toHaveLength(8);
  });

  it("clamps values outside the percentage range", () => {
    const { rerender } = render(<BlockMeter value={140} label="進度" />);
    expect(screen.getByRole("progressbar", { name: "進度" })).toHaveAttribute("aria-valuenow", "100");

    rerender(<BlockMeter value={-20} label="進度" />);
    expect(screen.getByRole("progressbar", { name: "進度" })).toHaveAttribute("aria-valuenow", "0");
  });
});
