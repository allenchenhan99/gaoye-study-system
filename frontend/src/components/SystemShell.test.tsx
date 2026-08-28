import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SystemShell } from "./SystemShell";

describe("SystemShell", () => {
  it("provides the study-system application landmarks and live database status", () => {
    render(
      <MemoryRouter initialEntries={["/stats"]}>
        <SystemShell bankSize={5400}>
          <p>統計內容</p>
        </SystemShell>
      </MemoryRouter>
    );

    expect(screen.getByRole("banner")).toHaveTextContent("高業學習系統");
    expect(screen.getByRole("navigation", { name: "系統選單" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("統計內容");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("LOCAL DATA READY");
    expect(screen.getByText("5,400 records")).toBeInTheDocument();

    const supportLink = screen.getByRole("link", { name: "支持網站維護" });
    expect(supportLink).toHaveAttribute("href", "https://buymeacoffee.com/allenchenhan99");
    expect(supportLink).toHaveAttribute("target", "_blank");
    expect(supportLink).toHaveAttribute("rel", "noreferrer");
  });
});
