"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface Clinician {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  avatar: string;
}

const VALID_CREDENTIALS = {
  email: "sarah.chen@carelink.health",
  password: "carelink2025",
  clinician: {
    id: "clinician-001",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@carelink.health",
    role: "Lead Clinician",
    specialty: "Cardiology",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  } as Clinician,
};

interface AuthContextType {
  clinician: Clinician | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clinician, setClinician] = useState<Clinician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("carelink_session");
    if (stored) {
      try {
        setClinician(JSON.parse(stored));
      } catch {
        localStorage.removeItem("carelink_session");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!clinician && pathname !== "/login") {
      router.replace("/login");
    }
    if (clinician && pathname === "/login") {
      router.replace("/");
    }
  }, [clinician, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));

    if (
      email.toLowerCase() === VALID_CREDENTIALS.email &&
      password === VALID_CREDENTIALS.password
    ) {
      const c = VALID_CREDENTIALS.clinician;
      setClinician(c);
      localStorage.setItem("carelink_session", JSON.stringify(c));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setClinician(null);
    localStorage.removeItem("carelink_session");
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{ clinician, isAuthenticated: !!clinician, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
