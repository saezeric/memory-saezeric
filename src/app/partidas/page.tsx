// app/partidas/page.tsx
"use client"; // Necesario para usar useState/useEffect y localStorage
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

interface GameRecord {
  id: string; // identificador único
  username: string; // usuario que jugó
  timestamp: string; // ISO string de fecha/hora
  score: number; // puntos obtenidos
  clicks: number; // intentos realizados
}

export default function PartidasPage() {
  const { user } = useAuth(); // para saber quién está logueado
  const [records, setRecords] = useState<GameRecord[]>([]);

  // Al montar, cargamos del localStorage
  useEffect(() => {
    const stored = localStorage.getItem("games");
    if (stored) setRecords(JSON.parse(stored));
  }, []);

  // Guarda en state + localStorage
  const updateRecords = (newRecs: GameRecord[]) => {
    setRecords(newRecs);
    localStorage.setItem("games", JSON.stringify(newRecs));
  };

  // Elimina una partida propia
  const handleDelete = (id: string) => {
    if (!confirm("¿Seguro que quieres borrar esta partida?")) return;
    updateRecords(records.filter((r) => r.id !== id));
  };

  // Separa en propias y globales
  const own = user ? records.filter((r) => r.username === user.email) : [];
  const global = records;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Histórico de Partidas</h1>

      {/* Mis partidas */}
      {user && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Mis Partidas</h2>
          {own.length === 0 ? (
            <p className="text-gray-500">Aún no has jugado ninguna partida.</p>
          ) : (
            <ul className="space-y-2">
              {own.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <p>
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(r.timestamp).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Puntuación:</span> {r.score}
                    </p>
                    <p>
                      <span className="font-medium">Intentos:</span> {r.clicks}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="Eliminar partida"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Partidas globales */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Partidas Globales</h2>
        {global.length === 0 ? (
          <p className="text-gray-500">No hay partidas registradas.</p>
        ) : (
          <ul className="space-y-2">
            {global.map((r) => (
              <li key={r.id} className="border p-3 rounded-lg">
                <p>
                  <span className="font-medium">Usuario:</span> {r.username}
                </p>
                <p>
                  <span className="font-medium">Fecha:</span>{" "}
                  {new Date(r.timestamp).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Puntuación:</span> {r.score}
                </p>
                <p>
                  <span className="font-medium">Intentos:</span> {r.clicks}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
