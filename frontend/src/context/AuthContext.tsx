"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api, getToken, setToken, clearToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    const { token, user } = await api.login({ emailOrUsername, password });
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (data: { username: string; email: string; password: string; displayName?: string }) => {
      const { token, user } = await api.register(data);
      setToken(token);
      setUser(user);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  return ctx;
}
