"use client";

import React, { createContext, useContext, useEffect, useMemo, useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import { Api } from "@/api";
import { useRouter, usePathname } from "next/navigation";

// --- Types ---

export interface User {
  id: string;
  email: string;
  full_name: string;
  [key: string]: any;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<boolean>;
}

// --- Constants ---
const LOCAL_STORAGE_KEY = "auth_session";
const REFRESH_THRESHOLD_MS = 60 * 1000; // 1 minute before expiry

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helpers ---

// Safe JSON parse
const safeParse = <T,>(json: string | null): T | null => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// decode JWT exp
const getJwtExp = (token: string): number | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Refresh timer ref
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize from LocalStorage
  useEffect(() => {
    const initAuth = async () => {
      const stored = safeParse<AuthSession>(localStorage.getItem(LOCAL_STORAGE_KEY));
      if (stored && stored.token) {
         // Check rough validity immediately
         const exp = getJwtExp(stored.token);
         if (exp && exp > Date.now()) {
             setSession(stored);
             // Optionally validate with /me
             try {
                // We rely on the stored token being attached by the Api interceptor
                // But we must make sure the interceptor pulls from localStorage or we explicitly set it?
                // The current Api interceptor pulls from localStorage(localStorageAuthKey).
                // Our key is LOCAL_STORAGE_KEY. We must match the key used in Api interceptor or update Api interceptor.
                // Re-reading Api implementation: it uses `localStorageAuthKey` from "@/context/authContext".
                // So as long as we export `localStorageAuthKey` matching "auth", we are good.
                // Wait, I am changing the file exporting it. 
                // Let's ensure consistency.
             } catch(e) {}
         } else {
             localStorage.removeItem(LOCAL_STORAGE_KEY);
         }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 2. Persist Session & Schedule Refresh
  useEffect(() => {
    if (!session) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));

    // Schedule Refresh
    const exp = getJwtExp(session.token);
    if (!exp) return;

    const msUntilRefresh = exp - Date.now() - REFRESH_THRESHOLD_MS;
    
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

    if (msUntilRefresh <= 0) {
      // Token is close to expiring or expired, refresh now
      refreshToken();
    } else {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken();
      }, msUntilRefresh);
    }

    return () => {
        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    }
  }, [session]);

  const refreshToken = async () => {
      try {
          const res = await Api.client.refreshToken();
          const data = res.data || res;
          if (data && data.token) {
              setSession(prev => prev ? { ...prev, token: data.token } : null);
          }
      } catch (error) {
          console.error("Token refresh failed", error);
          logout(); 
      }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await Api.client.login({ email, password });
      const data = res.data || res;
      
      // Data expected: { token: string, user: User }
      if (data && data.token) {
        setSession({
            token: data.token,
            user: data.user || { id: "", email, full_name: "User" } // Fallback
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const msg = error.message || error.error || "Login failed";
      toast.error(msg);
      throw error; // Propagate to form
    }
  };

  const register = async (payload: any): Promise<boolean> => {
      try {
        await Api.client.register(payload);
        return true;
      } catch (error: any) {
        toast.error(error.message || "Registration failed");
        throw error;
      }
  };

  const logout = async () => {
    try {
        await Api.client.logout(); 
    } catch(e) { /* ignore */ }
    setSession(null);
    router.push("/login");
    toast.info("Logged out");
  };

  // Export constant for API client usage
  // The Api client imports `localStorageAuthKey` from here.
  // We must ensure we export it with the same name.
  
  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || null,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
    register
  }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export for Api Client
export const localStorageAuthKey = LOCAL_STORAGE_KEY;
