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
}

interface RankingEntry {
  user_id: number;
  best_time: number;
  min_clicks: number;
  max_points: number;
  user: { id: number; name: string; created_at: string };
}

interface User {
  id: number;
  name: string;
}

const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

export default function PartidasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Sólo redirigir si sabemos que no hay usuario
  useEffect(() => {
    if (user === undefined) return; // aún cargando
    setAuthChecked(true);
    if (user === null) router.push("/login");
  }, [user, router]);

  const isAdmin = user?.role === "admin";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [myGames, setMyGames] = useState<MyGame[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingRank, setLoadingRank] = useState(true);

  const [tab, setTab] = useState<"my" | "all" | "ranking">("my");

  // Edición modal
  const [editing, setEditing] = useState<MyGame | null>(null);
  const [editClicks, setEditClicks] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editDuration, setEditDuration] = useState("");

  const parseISO = (iso?: string) => {
    if (typeof iso !== "string") return new Date("");
    const [base] = iso.split(".");
    return new Date(base + "Z");
  };

  // Fetch de mis partidas (o todas si admin)
  useEffect(() => {
    if (!authChecked || !token) {
      setLoadingMy(false);
      return;
    }
    setLoadingMy(true);
    fetch(`${API_BASE}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        setMyGames(json.data);
      })
      .catch(console.error)
      .finally(() => setLoadingMy(false));
  }, [authChecked, token]);

  // Fetch ranking
  useEffect(() => {
    if (!authChecked) return;
    setLoadingRank(true);
    fetch(`${API_BASE}/ranking`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((json) => setRanking(json.data))
      .catch(console.error)
      .finally(() => setLoadingRank(false));
  }, [authChecked, token]);

  // Fetch usuarios solo si admin
  useEffect(() => {
    if (!authChecked || !isAdmin || !token) return;
    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        const map: Record<number, string> = {};
        json.data.forEach((u: User) => {
          map[u.id] = u.name;
        });
        setUsersMap(map);
      })
      .catch(console.error);
  }, [authChecked, isAdmin, token]);

  // Eliminar partida
  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta partida?")) return;
    await fetch(`${API_BASE}/games/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`! },
    });
    setMyGames((prev) => prev.filter((g) => g.id !== id));
  };

  // Abrir modal de edición
  const openEdit = (g: MyGame) => {
    setEditing(g);
    setEditClicks(String(g.clicks));
    setEditPoints(String(g.points));
    setEditDuration(g.duration != null ? String(g.duration) : "");
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!editing) return;
    const body = {
      clicks: Number(editClicks),
      points: Number(editPoints),
      duration: editDuration === "" ? null : Number(editDuration),
    };
    const res = await fetch(`${API_BASE}/games/${editing.id}/finish`, {
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
    setMyGames((prev) =>
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
  };

  if (user === undefined || !authChecked) {
    // esperando auth
    return null;
  }

  // Agrupar si admin
  const grouped: Record<string, MyGame[]> = {};
  if (isAdmin) {
    myGames.forEach((g) => {
      const name = usersMap[g.user_id] ?? `Usuario ${g.user_id}`;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(g);
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

      {/* My tab */}
      {tab === "my" && (
        <section>
          {loadingMy ? (
            <p>Cargando tus partidas...</p>
          ) : myGames.length === 0 ? (
            <p>No tienes partidas guardadas.</p>
          ) : (
            <ul className="space-y-4">
              {myGames.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1 text-blue-600">
                      <TrophyIcon className="w-5 h-5" />
                      <span>{g.points}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{g.duration ?? "-"}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ZapIcon className="w-5 h-5" />
                      <span>{g.clicks}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {parseISO(g.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex gap-2">
                    <button
                      onClick={() => openEdit(g)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
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

      {/* All tab */}
      {tab === "all" && isAdmin && (
        <section>
          {Object.entries(grouped).map(([player, list]) => (
            <div key={player} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{player}</h3>
              <ul className="space-y-4">
                {list.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center gap-1 text-blue-600">
                        <TrophyIcon className="w-5 h-5" />
                        <span>{g.points}</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <ClockIcon className="w-5 h-5" />
                        <span>{g.duration ?? "-"}s</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <ZapIcon className="w-5 h-5" />
                        <span>{g.clicks}</span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {parseISO(g.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex gap-2">
                      <button
                        onClick={() => openEdit(g)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2Icon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
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

      {/* Ranking tab */}
      {tab === "ranking" && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Ranking Global</h2>
          {loadingRank ? (
            <p>Cargando ranking...</p>
          ) : ranking.length === 0 ? (
            <p>No hay datos de ranking.</p>
          ) : (
            <ul className="space-y-4">
              {ranking.map((e, i) => (
                <li
                  key={`${e.user_id}-${i}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
                    <span className="font-semibold">#{i + 1}</span>
                    <span className="font-medium">{e.user.name}</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <TrophyIcon className="w-5 h-5" />
                      <span>{e.max_points}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{e.best_time}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ZapIcon className="w-5 h-5" />
                      <span>{e.min_clicks}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {parseISO(e.user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Editar Partida #{editing.id}
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
                onClick={() => setEditing(null)}
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
