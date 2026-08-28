import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getAuthRedirectUrl, useAuth, type AuthClient } from "./useAuth";

function createAuthClient(session: { user: { id: string; email?: string } } | null = null) {
  const signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const unsubscribe = vi.fn();
  const client: AuthClient = {
    getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ unsubscribe }),
    signInWithOAuth,
    signOut,
  };
  return { client, signInWithOAuth, signOut, unsubscribe };
}

describe("getAuthRedirectUrl", () => {
  it("keeps the GitHub Pages repository path and removes hash/query state", () => {
    expect(
      getAuthRedirectUrl(new URL("https://allenchenhan99.github.io/gaoye-study-system/?code=x#/stats"))
    ).toBe("https://allenchenhan99.github.io/gaoye-study-system/");
  });
});

describe("useAuth", () => {
  it("reports an unconfigured state when no client is available", () => {
    const { result } = renderHook(() => useAuth(null));
    expect(result.current.status).toBe("unconfigured");
    expect(result.current.user).toBeNull();
  });

  it("restores a signed-in Google session", async () => {
    const { client, unsubscribe } = createAuthClient({
      user: { id: "user-1", email: "learner@example.com" },
    });
    const { result, unmount } = renderHook(() => useAuth(client));

    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(result.current.user).toMatchObject({ id: "user-1", email: "learner@example.com" });

    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("starts Google OAuth with the current Pages path as redirect", async () => {
    const { client, signInWithOAuth } = createAuthClient();
    const { result } = renderHook(() => useAuth(client));
    await waitFor(() => expect(result.current.status).toBe("anonymous"));

    await act(async () => result.current.signIn());

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      redirectTo: "http://localhost:3000/",
    });
  });
});
