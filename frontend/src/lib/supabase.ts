import { createClient } from "@supabase/supabase-js";

interface PublicSupabaseEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export type SupabaseConfig =
  | {
      configured: true;
      url: string;
      publishableKey: string;
    }
  | {
      configured: false;
      reason: "missing" | "invalid-url";
    };

export function readSupabaseConfig(env: PublicSupabaseEnv): SupabaseConfig {
  const url = env.VITE_SUPABASE_URL?.trim();
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return { configured: false, reason: "missing" };
  }

  try {
    const parsedUrl = new URL(url);
    const hostedProject = parsedUrl.protocol === "https:"
      && parsedUrl.hostname.endsWith(".supabase.co");
    const localProject = (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")
      && (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1");
    if (!hostedProject && !localProject) {
      return { configured: false, reason: "invalid-url" };
    }
  } catch {
    return { configured: false, reason: "invalid-url" };
  }

  return { configured: true, url, publishableKey };
}

export const supabaseConfig = readSupabaseConfig(import.meta.env);

export const supabase = supabaseConfig.configured
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;
