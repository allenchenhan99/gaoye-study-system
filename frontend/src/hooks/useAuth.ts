import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

interface AuthError {
  message: string;
}

export interface AuthClient {
  getSession: () => Promise<{ data: { session: AuthSession | null }; error: AuthError | null }>;
  onAuthStateChange: (callback: (session: AuthSession | null) => void) => { unsubscribe: () => void };
  signInWithOAuth: (options: {
    provider: "google";
    redirectTo: string;
  }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export type AuthStatus = "loading" | "anonymous" | "authenticated" | "unconfigured";

function toAuthUser(user: AuthSession["user"]): AuthUser {
  const name = user.user_metadata?.full_name;
  const avatarUrl = user.user_metadata?.avatar_url;
  return {
    id: user.id,
    email: user.email ?? null,
    name: typeof name === "string" ? name : null,
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
  };
}

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      user_metadata: session.user.user_metadata,
    },
  };
}

function createDefaultAuthClient(): AuthClient | null {
  const client = supabase;
  if (!client) return null;

  return {
    async getSession() {
      const { data, error } = await client.auth.getSession();
      return {
        data: { session: toAuthSession(data.session) },
        error: error ? { message: error.message } : null,
      };
    },
    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        callback(toAuthSession(session));
      });
      return { unsubscribe: () => data.subscription.unsubscribe() };
    },
    async signInWithOAuth({ provider, redirectTo }) {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      return { error: error ? { message: error.message } : null };
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      return { error: error ? { message: error.message } : null };
    },
  };
}

const defaultAuthClient = createDefaultAuthClient();

export function getAuthRedirectUrl(location: Pick<URL, "origin" | "pathname">): string {
  return `${location.origin}${location.pathname}`;
}

export function useAuth(client: AuthClient | null = defaultAuthClient) {
  const [status, setStatus] = useState<AuthStatus>(client ? "loading" : "unconfigured");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setStatus("unconfigured");
      setUser(null);
      return;
    }

    let active = true;
    void client.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError("登入狀態讀取失敗，請重新整理頁面。");
        setStatus("anonymous");
        return;
      }
      setUser(data.session ? toAuthUser(data.session.user) : null);
      setStatus(data.session ? "authenticated" : "anonymous");
    });

    const subscription = client.onAuthStateChange((session) => {
      if (!active) return;
      setUser(session ? toAuthUser(session.user) : null);
      setStatus(session ? "authenticated" : "anonymous");
      setBusy(false);
      setError(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn = useCallback(async () => {
    if (!client) return;
    setBusy(true);
    setError(null);
    const result = await client.signInWithOAuth({
      provider: "google",
      redirectTo: getAuthRedirectUrl(new URL(window.location.href)),
    });
    if (result.error) {
      setBusy(false);
      setError("Google 登入未完成，請再試一次。");
    }
  }, [client]);

  const signOut = useCallback(async () => {
    if (!client) return;
    setBusy(true);
    setError(null);
    const result = await client.signOut();
    setBusy(false);
    if (result.error) {
      setError("登出失敗，請再試一次。");
    }
  }, [client]);

  return { status, user, busy, error, signIn, signOut };
}
