// app/user/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserCardsPage from "../cards/page";
import UserCategoriesPage from "../categories/page";

export default function UserDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<"cards" | "categories">("cards");

  // 1) Verificar autenticación
  useEffect(() => {
    if (user === undefined) return; // aún cargando
    setAuthChecked(true);
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!authChecked || user === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Navegación móvil */}
      <div className="md:hidden bg-gray-100 dark:bg-gray-800 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setView("cards")}
          className={`flex-1 min-w-0 text-center text-sm px-2 py-1 rounded ${
            view === "cards"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Mis Cartas
        </button>
        <button
          onClick={() => setView("categories")}
          className={`flex-1 min-w-0 text-center text-sm px-2 py-1 rounded ${
            view === "categories"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Mis Categorías
        </button>
      </div>

      {/* Sidebar escritorio */}
      <nav className="hidden md:block w-56 bg-gray-100 dark:bg-gray-800 p-4">
        <button
          onClick={() => setView("cards")}
          className={`block w-full text-left mb-2 px-3 py-2 rounded text-base ${
            view === "cards"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Mis Cartas
        </button>
        <button
          onClick={() => setView("categories")}
          className={`block w-full text-left mb-2 px-3 py-2 rounded text-base ${
            view === "categories"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          Mis Categorías
        </button>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        {view === "cards" && <UserCardsPage />}
        {view === "categories" && <UserCategoriesPage />}
      </main>
    </div>
  );
}
