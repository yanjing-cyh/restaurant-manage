"use client";

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AuthContextType {
  user: { id: string; username: string; name: string; role: string } | null;
  login: (user: { id: string; username: string; name: string; role: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; username: string; name: string; role: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const login = useCallback((u: { id: string; username: string; name: string; role: string }) => {
    setUser(u);
    try { localStorage.setItem('restaurant_user', JSON.stringify(u)); } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem('restaurant_user'); } catch {}
  }, []);

  // 恢复登录状态（只在客户端执行）
  useEffect(() => {
    try {
      const saved = localStorage.getItem('restaurant_user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}