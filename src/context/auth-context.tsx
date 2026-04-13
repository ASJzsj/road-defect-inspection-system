import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/index";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: User[] = [
  { id: "u-001", username: "admin", displayName: "管理员", role: "admin" },
  { id: "u-002", username: "inspector", displayName: "张工", role: "inspector" },
];

const AUTH_KEY = "uav_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const user = JSON.parse(stored) as User;
      setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock: admin/admin123 或 inspector/123456
    const validCreds: Record<string, string> = {
      admin: "admin123",
      inspector: "123456",
    };
    if (validCreds[username] === password) {
      const user = MOCK_USERS.find(u => u.username === username)!;
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
