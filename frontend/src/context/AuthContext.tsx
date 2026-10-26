import { useState, type ReactNode } from "react";
import { login as loginRequest, register as registerRequest, logout as clearToken } from "../services/auth";
import { AuthContext, type User } from "./auth-context";

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const data = await loginRequest({ email, password });

    if (!data.access_token || !data.user) {
      throw new Error("Login response was missing required fields");
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    await registerRequest({ username, email, password });
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}