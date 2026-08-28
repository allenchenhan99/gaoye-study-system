import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublicLanding } from "./PublicLanding";

describe("PublicLanding", () => {
  it("presents the project and has one primary Google login action", () => {
    const signIn = vi.fn();
    render(
      <PublicLanding
        configured
        busy={false}
        error={null}
        onSignIn={signIn}
      />
    );

    expect(screen.getByRole("heading", { name: "高業學習系統" })).toBeInTheDocument();
    expect(screen.getByText("證券商高級業務員考古題練習平台")).toBeInTheDocument();
    const loginButton = screen.getByRole("button", { name: "使用 Google 登入" });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "隱私權政策" })).toHaveAttribute(
      "href",
      "./privacy.html"
    );

    fireEvent.click(loginButton);
    expect(signIn).toHaveBeenCalledOnce();
  });

  it("shows a setup state and disables login when Supabase is not configured", () => {
    render(
      <PublicLanding
        configured={false}
        busy={false}
        error={null}
        onSignIn={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "使用 Google 登入" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("登入服務設定中");
  });

  it("shows authentication errors without removing the login action", () => {
    render(
      <PublicLanding
        configured
        busy={false}
        error="Google 登入未完成，請再試一次。"
        onSignIn={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Google 登入未完成");
    expect(screen.getByRole("button", { name: "使用 Google 登入" })).toBeEnabled();
  });
});
