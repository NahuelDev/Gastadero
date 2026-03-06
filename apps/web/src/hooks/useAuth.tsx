import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginRequest, RegisterRequest } from "@gastos/shared";
import * as authApi from "../api/auth.api.js";
import { getToken, clearToken } from "../api/client.js";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getUserFromStorage(): User | null {
  const raw = localStorage.getItem("gastos_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!getToken()) return null;
    return getUserFromStorage();
  });

  const login = useCallback(async (data: LoginRequest) => {
    const result = await authApi.login(data);
    setUser(result.user);
    localStorage.setItem("gastos_user", JSON.stringify(result.user));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const result = await authApi.register(data);
    setUser(result.user);
    localStorage.setItem("gastos_user", JSON.stringify(result.user));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("gastos_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
