import { describe, expect, it } from "vitest";
import { readSupabaseConfig } from "./supabase";

describe("readSupabaseConfig", () => {
  it("accepts a valid public Supabase URL and publishable key", () => {
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      })
    ).toEqual({
      configured: true,
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it("reports missing public configuration without throwing", () => {
    expect(readSupabaseConfig({})).toEqual({
      configured: false,
      reason: "missing",
    });
  });

  it("accepts the Supabase CLI URL for local development", () => {
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: "http://localhost:54321",
        VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
      })
    ).toEqual({
      configured: true,
      url: "http://localhost:54321",
      publishableKey: "test-key",
    });
  });

  it("rejects unrelated or insecure hosted URLs", () => {
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: "http://example.com",
        VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
      })
    ).toEqual({ configured: false, reason: "invalid-url" });
  });
});
