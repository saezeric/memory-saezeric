// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null | undefined; // undefined = cargando, null = no auth, User = auth
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // 1) Al montar, recupera token y llama a /me
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("No autorizado");
        const json = await res.json();
        setUser(json.data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    };
    initAuth();
  }, []);

  // 2) Registro → sólo crea cuentas y redirige al login
  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: password,
        role: "user",
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al registrar usuario");
    }
    // No auto-login: rediriges desde el componente de página a /login
  };

  // 3) Login → guarda token, obtiene /me y setea user
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al iniciar sesión");
    }
    const json = await res.json();
    localStorage.setItem("token", json.token);
    // Obtener datos de usuario justo tras el login:
    const meRes = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${json.token}` },
    });
    if (!meRes.ok) throw new Error("Error al obtener usuario tras login");
    const meJson = await meRes.json();
    setUser(meJson.data);
  };

  // 4) Logout → llama logout API, limpia token y user
  const logout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
};
