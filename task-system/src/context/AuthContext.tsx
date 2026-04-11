import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthContextType, User } from "../types";
import api from "../api";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    const res = await api.get<User[]>(`/users?name=${encodeURIComponent(name)}`);
    const users = res.data;

    if (users.length === 0) {
      throw new Error("No account found with that name. Please register first.");
    }

    const matched = users[0];
    if (matched.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }

    const generatedToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("token", generatedToken);
    localStorage.setItem("user", JSON.stringify(matched));
    setToken(generatedToken);
    setUser(matched);
  };

  const register = async (name: string, email: string, password: string) => {
    // Check if name is already taken
    const existing = await api.get<User[]>(`/users?name=${encodeURIComponent(name)}`);
    if (existing.data.length > 0) {
      throw new Error("An account with that name already exists. Please sign in.");
    }

    const avatar = name.charAt(0).toUpperCase();
    const res = await api.post<User>("/users", { name, email, password, avatar });
    const newUser = res.data;

    const generatedToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("token", generatedToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(generatedToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
