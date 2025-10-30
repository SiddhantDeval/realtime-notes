import React, { createContext, useContext, useEffect, useMemo, useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import { Api } from "@/apis";

interface User {
  token: string;
  user: { id: string; full_name: string; email: string; [x: string]: any };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
export const localStorageAuthKey = "auth";

// ----------------- storage helpers -----------------
const readAuth = (): User | null => {
  try {
    const raw = localStorage.getItem(localStorageAuthKey);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};
const writeAuth = (value: User | null) => {
  try {
    if (!value) localStorage.removeItem(localStorageAuthKey);
    else localStorage.setItem(localStorageAuthKey, JSON.stringify(value));
  } catch {}
};

// ----------------- JWT helpers -----------------
/** base64url -> JSON */
const b64urlToJson = (b64url: string) => {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  try {
    const json = atob(b64 + pad);
    return JSON.parse(json);
  } catch {
    return null;
  }
};
/** returns ms epoch of exp, or null if missing/invalid */
const getTokenExpiryMs = (jwt?: string | null): number | null => {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payload = b64urlToJson(parts[1]);
  const expSec = payload?.exp;
  if (typeof expSec !== "number") return null;
  return expSec * 1000;
};

// Lead time before expiry to refresh (e.g., 60s)
const REFRESH_LEEWAY_MS = 60_000;
// Extra safety for skew
const SKEW_MS = 5_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  // refresh scheduling state
  const refreshTimerRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);
  const unmountedRef = useRef(false);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleRefresh = useCallback(
    (token?: string | null) => {
      clearRefreshTimer();
      const expMs = getTokenExpiryMs(token ?? user?.token);
      if (!expMs) return; // no exp → nothing to schedule

      const now = Date.now();
      // Time at which we want to refresh
      const refreshAt = expMs - REFRESH_LEEWAY_MS - SKEW_MS;
      let delay = refreshAt - now;

      if (delay <= 0) {
        // overdue → refresh immediately (microtask to avoid setState during render)
        refreshNow();
        return;
      }

      refreshTimerRef.current = window.setTimeout(() => {
        refreshNow();
      }, delay);
    },
    [user?.token]
  );

  const applyNewSession = useCallback(
    (data: User) => {
      writeAuth(data);
      setUser(data);
      scheduleRefresh(data.token);
    },
    [scheduleRefresh]
  );

  const logout = useCallback(async () => {
    try {
      await Api.client.logout?.();
    } catch {}
    clearRefreshTimer();
    writeAuth(null);
    setUser(null);
  }, []);

  const refreshNow = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const { data, error } = await Api.client.refreshToken();
      if (error || !data) {
        toast.error("Session expired. Please log in again.");
        await logout();
        return;
      }
      applyNewSession(data);

      // // (Optional) fetch profile post-refresh
      // try {
      //   const me = await Api.client.me();
      //   if (me?.data) {
      //     const updated = { ...data, user: me.data };
      //     applyNewSession(updated);
      //   }
      // } catch {}
    } catch (e) {
      toast.error("Could not refresh session.");
      await logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [applyNewSession, logout]);

  // Validate/refresh on mount based on existing session
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const existing = readAuth();
      if (!existing) {
        setIsLoading(false);
        return;
      }

      // If token already near expiry, refresh first
      const expMs = getTokenExpiryMs(existing.token);
      const now = Date.now();

      if (!expMs || expMs - now <= REFRESH_LEEWAY_MS) {
        await refreshNow();
      } else {
        setUser(existing);
        scheduleRefresh(existing.token);
        // fetch profile in background
        try {
          const res = await Api.client.me();
          if (res?.error) {
            if (!cancelled) {
              toast.error(res.error);
              await logout();
            }
            return;
          }
          if (res?.data && !cancelled) {
            const updated = { ...existing, user: res.data };
            applyNewSession(updated);
          }
        } catch {
          /* ignore */
        }
      }
    })().finally(() => !cancelled && setIsLoading(false));

    // cross-tab sync (token refreshed/logged out elsewhere)
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === localStorageAuthKey) {
        const next = readAuth();
        setUser(next);
        if (next?.token) scheduleRefresh(next.token);
        else clearRefreshTimer();
      }
    };
    window.addEventListener("storage", onStorage);

    // refresh if we come back foreground and are within the leeway
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const expMs = getTokenExpiryMs(user?.token);
      if (!expMs) return;
      const now = Date.now();
      if (expMs - now <= REFRESH_LEEWAY_MS) {
        refreshNow();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      unmountedRef.current = true;
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      clearRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await Api.client.login({ email, password });
      if (error || !data) {
        toast.error(error ?? "Login failed");
        return;
      }
      applyNewSession(data);

      // optional: fetch profile right after login
      try {
        const me = await Api.client.me();
        if (me?.data) {
          const updated = { ...data, user: me.data };
          applyNewSession(updated);
        }
      } catch {}
    },
    [applyNewSession]
  );

  const value = useMemo<AuthState>(
    () => ({ isAuthenticated, isLoading, user, login, logout }),
    [isAuthenticated, isLoading, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
