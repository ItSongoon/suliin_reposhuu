"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (registerNumber: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("zamzuur_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (registerNumber: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerNumber, password }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem("zamzuur_user", JSON.stringify(userData.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (userData: Omit<User, "id" | "createdAt">): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const newUser = await response.json();
        setUser(newUser.user);
        localStorage.setItem("zamzuur_user", JSON.stringify(newUser.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zamzuur_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

