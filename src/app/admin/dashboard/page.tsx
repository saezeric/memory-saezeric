// src/app/admin/dashboard/page.tsx
"use client";

import { useState } from "react";
import UsersManagement from "../users/page";
import GamesManagement from "../games/page";
import CardsManagement from "../cards/page";
import CategoriesManagement from "../categories/page";

export default function AdminDashboard() {
  // Vista activa: 'users' | 'games' | 'cards' | 'categories'
  const [view, setView] = useState<"users" | "games" | "cards" | "categories">(
    "users"
  );

  const tabs = [
    { key: "users", label: "Usuarios" },
    { key: "games", label: "Partidas" },
    { key: "cards", label: "Cartas" },
    { key: "categories", label: "Categorías" },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Navegación móvil (oculta en md+) */}
      <div className="md:hidden bg-gray-100 dark:bg-gray-800 p-2 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`
              flex-1 min-w-0 text-center
              text-sm px-2 py-1 rounded
              ${
                view === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sidebar escritorio (md+) */}
      <nav className="hidden md:block w-56 bg-gray-100 dark:bg-gray-800 p-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`
              block w-full text-left mb-2 px-3 py-2 rounded text-base
              ${
                view === t.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        {view === "users" && <UsersManagement />}
        {view === "games" && <GamesManagement />}
        {view === "cards" && <CardsManagement />}
        {view === "categories" && <CategoriesManagement />}
      </main>
    </div>
  );
}
