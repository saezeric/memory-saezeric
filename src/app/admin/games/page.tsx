// app/admin/games/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  TrophyIcon,
  ClockIcon,
  ZapIcon,
  Trash2Icon,
  Edit2Icon,
  PlusIcon,
} from "lucide-react";

interface User {
  id: number;
  name: string;
}

interface Game {
  id: number;
  user_id: number;
  clicks: number;
  points: number;
  duration: number | null;
  created_at: string;
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function GamesManagement() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // Modal edit/create
  const [editing, setEditing] = useState<Game | null>(null);
  const [formClicks, setFormClicks] = useState("");
  const [formPoints, setFormPoints] = useState("");
  const [formDuration, setFormDuration] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch users and games en paralelo
  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    setLoading(true);

    // Obtener todos los usuarios
    const fetchUsers = fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    // Obtener todas las partidas
    const fetchGames = fetch(`${API_BASE}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    Promise.all([fetchUsers, fetchGames])
      .then(([ujson, gjson]) => {
        // Construir el mapa de usuarios
        const map: Record<number, string> = {};
        ujson.data.forEach((u: User) => {
          map[u.id] = u.name;
        });
        setUsersMap(map);

        // Guardar partidas
        setGames(gjson.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, user]);

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-red-600 mt-10">Acceso denegado</p>
      </div>
    );
  }

  // Agrupar por nombre de usuario
  const grouped: Record<string, Game[]> = {};
  games.forEach((g) => {
    const name = usersMap[g.user_id] ?? `Usuario ${g.user_id}`;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(g);
  });

  // Modal helpers
  const openModal = (game: Game) => {
    setEditing(game);
    setFormClicks(String(game.clicks));
    setFormPoints(String(game.points));
    setFormDuration(game.duration != null ? String(game.duration) : "");
  };

  const handleNew = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/games`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`! },
      });
      const json = await res.json();
      const newGame: Game = json.data;
      // Insertar al inicio del estado y agrupar
      setGames((prev) => [newGame, ...prev]);
      openModal(newGame);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta partida?")) return;
    try {
      await fetch(`${API_BASE}/games/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`! },
      });
      setGames((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar.");
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    const body = {
      clicks: Number(formClicks),
      points: Number(formPoints),
      duration: formDuration === "" ? null : Number(formDuration),
    };
    try {
      const res = await fetch(`${API_BASE}/games/${editing.id}/finish`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`!,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Fallo al guardar");
      setGames((prev) =>
        prev.map((g) =>
          g.id === editing.id
            ? {
                ...g,
                clicks: body.clicks,
                points: body.points,
                duration: body.duration,
              }
            : g
        )
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Partidas</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <PlusIcon className="w-5 h-5" /> Nueva Partida
        </button>
      </div>

      {loading ? (
        <p className="text-center">Cargando…</p>
      ) : (
        Object.entries(grouped).map(([player, list]) => (
          <div key={player} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{player}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((game) => (
                <div
                  key={game.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrophyIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{game.points} pts</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">
                        {game.duration != null ? `${game.duration}s` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <ZapIcon className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{game.clicks} clics</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(game.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => openModal(game)}
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
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Editar Partida #{editing.id}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Puntos</label>
                <input
                  type="number"
                  value={formPoints}
                  onChange={(e) => setFormPoints(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Clicks</label>
                <input
                  type="number"
                  value={formClicks}
                  onChange={(e) => setFormClicks(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Duración (s)</label>
                <input
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
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
