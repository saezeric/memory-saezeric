// app/partidas/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Trash2Icon,
  TrophyIcon,
  ClockIcon,
  ZapIcon,
  Edit2Icon,
} from "lucide-react";

interface MyGame {
  id: number;
  user_id: number;
  clicks: number;
  points: number;
  duration: number | null;
  created_at: string;
  user?: { id: number; name: string };
}

interface RankingEntry {
  user_id: number;
  best_time: number;
  min_clicks: number;
  max_points: number;
  user: { id: number; name: string; created_at: string };
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function PartidasPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Protege ruta
  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  const [myGames, setMyGames] = useState<MyGame[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingRank, setLoadingRank] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // pestaña activa: 'my' | 'all' | 'ranking'
  const [tab, setTab] = useState<"my" | "all" | "ranking">("my");

  // edición
  const [editingGame, setEditingGame] = useState<MyGame | null>(null);
  const [editClicks, setEditClicks] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // parse ISO sin microsegundos
  const parseISO = (iso?: string) => {
    if (typeof iso !== "string") return new Date("");
    const [base] = iso.split(".");
    return new Date(base + "Z");
  };

  // Carga partidas propias y de todos (admin)
  useEffect(() => {
    if (!token) return setLoadingMy(false);
    setLoadingMy(true);
    fetch(`${API_BASE}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then((json) => setMyGames(json.data as MyGame[]))
      .catch(console.error)
      .finally(() => setLoadingMy(false));
  }, [token]);

  // Carga ranking
  useEffect(() => {
    setLoadingRank(true);
    fetch(`${API_BASE}/ranking`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => setRanking(json.data as RankingEntry[]))
      .catch(console.error)
      .finally(() => setLoadingRank(false));
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta partida?")) return;
    await fetch(`${API_BASE}/games/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`! },
    });
    setMyGames((prev) => prev.filter((g) => g.id !== id));
  };

  const openEdit = (game: MyGame) => {
    setEditingGame(game);
    setEditClicks(String(game.clicks));
    setEditPoints(String(game.points));
    setEditDuration(game.duration !== null ? String(game.duration) : "");
  };

  const saveEdit = async () => {
    if (!editingGame) return;
    const body = {
      clicks: Number(editClicks),
      points: Number(editPoints),
      duration: editDuration === "" ? null : Number(editDuration),
    };
    const res = await fetch(`${API_BASE}/games/${editingGame.id}/finish`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`!,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert("Error actualizando partida");
      return;
    }
    // refresca en local
    setMyGames((prev) =>
      prev.map((g) =>
        g.id === editingGame.id
          ? {
              ...g,
              clicks: body.clicks,
              points: body.points,
              duration: body.duration,
            }
          : g
      )
    );
    setEditingGame(null);
  };

  if (user === null) return null;
  const isAdmin = user.role === "admin";

  // agrupa por usuario si admin
  const groupedByUser: Record<string, MyGame[]> = {};
  if (isAdmin) {
    myGames.forEach((g) => {
      const name = g.user?.name || `Usuario ${g.user_id}`;
      groupedByUser[name] = groupedByUser[name] || [];
      groupedByUser[name].push(g);
    });
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Menú interno */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            tab === "my"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => setTab("my")}
        >
          Mis Partidas
        </button>
        {isAdmin && (
          <button
            className={`px-4 py-2 rounded ${
              tab === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
            onClick={() => setTab("all")}
          >
            Todas las Partidas
          </button>
        )}
        <button
          className={`px-4 py-2 rounded ${
            tab === "ranking"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => setTab("ranking")}
        >
          Ranking Global
        </button>
      </div>

      {/* Pestaña Mis Partidas */}
      {tab === "my" && (
        <section>
          {loadingMy ? (
            <p>Cargando tus partidas...</p>
          ) : myGames.length === 0 ? (
            <p>No tienes partidas guardadas.</p>
          ) : (
            <ul className="space-y-4">
              {myGames.map((game) => (
                <li
                  key={game.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1 text-blue-600">
                      <TrophyIcon className="w-5 h-5" />
                      <span>{game.points}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{game.duration ?? "-"}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ZapIcon className="w-5 h-5" />
                      <span>{game.clicks}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {parseISO(game.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex gap-2">
                    <button
                      onClick={() => openEdit(game)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2Icon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Pestaña Todas las Partidas (solo admin) */}
      {tab === "all" && isAdmin && (
        <section>
          {Object.entries(groupedByUser).map(([playerName, games]) => (
            <div key={playerName} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{playerName}</h3>
              <ul className="space-y-4">
                {games.map((game) => (
                  <li
                    key={game.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center gap-1 text-blue-600">
                        <TrophyIcon className="w-5 h-5" />
                        <span>{game.points}</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <ClockIcon className="w-5 h-5" />
                        <span>{game.duration ?? "-"}s</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <ZapIcon className="w-5 h-5" />
                        <span>{game.clicks}</span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {parseISO(game.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex gap-2">
                      <button
                        onClick={() => openEdit(game)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2Icon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Pestaña Ranking Global */}
      {tab === "ranking" && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Ranking Global</h2>
          {loadingRank ? (
            <p>Cargando ranking...</p>
          ) : ranking.length === 0 ? (
            <p>No hay datos de ranking.</p>
          ) : (
            <ul className="space-y-4">
              {ranking.map((entry, idx) => (
                <li
                  key={`${entry.user_id}-${idx}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                    <span className="font-semibold">#{idx + 1}</span>
                    <span className="font-medium">{entry.user.name}</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <TrophyIcon className="w-5 h-5" />
                      <span>{entry.max_points}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{entry.best_time}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ZapIcon className="w-5 h-5" />
                      <span>{entry.min_clicks}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {parseISO(entry.user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Modal edición */}
      {editingGame && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Editar Partida #{editingGame.id}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm">Puntos</label>
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Clicks</label>
                <input
                  type="number"
                  value={editClicks}
                  onChange={(e) => setEditClicks(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Duración (s)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setEditingGame(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
