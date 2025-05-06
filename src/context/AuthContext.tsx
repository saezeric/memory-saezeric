// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// Ahora el usuario lleva también un username
interface User {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const stored = localStorage.getItem("users");
    const users: User[] = stored ? JSON.parse(stored) : [];

    // ningún usuario existente con el mismo email o username
    if (users.find((u) => u.email === email)) {
      throw new Error("Ese email ya está registrado.");
    }
    if (users.find((u) => u.username === username)) {
      throw new Error("Ese nombre de usuario ya existe.");
    }

    const newUser: User = { username, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (identifier: string, password: string) => {
    const stored = localStorage.getItem("users");
    const users: User[] = stored ? JSON.parse(stored) : [];

    // buscamos por email o username
    const found = users.find(
      (u) =>
        (u.email === identifier || u.username === identifier) &&
        u.password === password
    );
    if (!found) {
      throw new Error("Credenciales incorrectas.");
    }

    localStorage.setItem("currentUser", JSON.stringify(found));
    setUser(found);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
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
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
