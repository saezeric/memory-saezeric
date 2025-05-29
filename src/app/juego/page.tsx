// app/juego/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import GrupoTarjetas, { Card } from "@/app/misComponentes/GrupoTarjetas";
import { PlayIcon, RotateCwIcon, TimerIcon, TrophyIcon } from "lucide-react";
import { useGlobalCounter } from "@/context/GlobalCounterContext";
import GlobalCounter from "@/app/misComponentes/GlobalCounter";
import { useAuth } from "@/context/AuthContext";

export default function Juego() {
  const router = useRouter();
  const { user } = useAuth();
  const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";

  // Si no hay usuario, redirigir
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const NUM_CARDS = 6;
  const INITIAL_TIME = 20;

  // Estados de flujo
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del juego
  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isChecking, setIsChecking] = useState(false);

  // Partida backend
  const [gameId, setGameId] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Contador global
  const { totalClicks, incrementTotal, resetTotal } = useGlobalCounter();

  // Tipos PokeAPI
  interface PokemonCountResponse {
    count: number;
  }
  interface PokemonResponse {
    name: string;
    sprites: {
      front_default: string | null;
      other: { "official-artwork": { front_default: string | null } };
    };
  }

  // Obtiene un Pokémon válido
  const getRandomPokemon = async (count: number): Promise<PokemonResponse> => {
    while (true) {
      const id = Math.floor(Math.random() * count) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (res.ok) return res.json();
    }
  };

  // Baraja y carga mazo
  const fetchDeck = useCallback(async () => {
    setLoading(true);
    try {
      const resCount = await fetch("https://pokeapi.co/api/v2/pokemon?limit=0");
      const { count } = resCount.ok
        ? ((await resCount.json()) as PokemonCountResponse)
        : { count: 898 };
      const promises = Array.from({ length: NUM_CARDS }).map(() =>
        getRandomPokemon(count)
      );
      const pokemons = await Promise.all(promises);
      const deck: Card[] = pokemons.flatMap((p) => {
        const sprite =
          p.sprites.other["official-artwork"].front_default ??
          p.sprites.front_default ??
          "";
        return [
          {
            nom: p.name,
            imatge: sprite,
            id: Math.random(),
            flipped: false,
            matched: false,
            localClicks: 0,
          },
          {
            nom: p.name,
            imatge: sprite,
            id: Math.random(),
            flipped: false,
            matched: false,
            localClicks: 0,
          },
        ];
      });
      // Fisher–Yates
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      setCards(deck);
    } catch (err) {
      console.error("Error cargando Pokémons:", err);
    } finally {
      setLoading(false);
    }
  }, [NUM_CARDS]);

  // Crea partida en backend
  const createGame = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/games`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setGameId(json.data.id);
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error("No se pudo crear la partida:", err);
    }
  }, [API_BASE]);

  // Finaliza partida
  const finishGame = useCallback(async () => {
    if (finished || gameId == null) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    try {
      await fetch(`${API_BASE}/games/${gameId}/finish`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clicks: totalClicks,
          points: score,
          duration,
        }),
      });
      setFinished(true);
    } catch (err) {
      console.error("Error finalizando partida:", err);
    }
  }, [API_BASE, gameId, score, totalClicks, finished]);

  // Lógica de turno
  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setIsChecking(false);
  };

  const handleCardClick = (clicked: Card) => {
    if (isChecking || clicked.flipped || clicked.matched || timeLeft <= 0)
      return;
    incrementTotal();
    setCards((prev) =>
      prev.map((c) =>
        c.id === clicked.id
          ? { ...c, flipped: true, localClicks: c.localClicks + 1 }
          : c
      )
    );
    if (!firstCard)
      setFirstCard({
        ...clicked,
        flipped: true,
        localClicks: clicked.localClicks + 1,
      });
    else if (!secondCard)
      setSecondCard({
        ...clicked,
        flipped: true,
        localClicks: clicked.localClicks + 1,
      });
  };

  // Efectos:

  // Al comenzar partida (tras pulsar)
  useEffect(() => {
    if (!started) return;
    fetchDeck();
    createGame();
  }, [started, fetchDeck, createGame]);

  // Temporizador
  useEffect(() => {
    if (!started || loading) return;
    if (timeLeft <= 0 || score === NUM_CARDS) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, loading, timeLeft, score]);

  // Comparar parejas
  useEffect(() => {
    if (!firstCard || !secondCard) return;
    setIsChecking(true);
    if (firstCard.nom === secondCard.nom) {
      setCards((prev) =>
        prev.map((c) => (c.nom === firstCard.nom ? { ...c, matched: true } : c))
      );
      setScore((s) => s + 1);
      resetTurn();
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstCard.id || c.id === secondCard.id
              ? { ...c, flipped: false }
              : c
          )
        );
        resetTurn();
      }, 1000);
    }
  }, [firstCard, secondCard]);

  // Finaliza al ganar o perder
  useEffect(() => {
    if (started && (score === NUM_CARDS || timeLeft <= 0)) {
      finishGame();
    }
  }, [started, score, timeLeft, finishGame]);

  // Reiniciar completa
  const resetGame = () => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    resetTotal();
    setFinished(false);
    // Vuelve a preguntar para empezar
    setStarted(false);
  };

  // Render:

  // Pantalla de inicio
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          Empezar Partida
        </button>
      </div>
    );
  }

  // Carga
  if (loading) {
    return <p className="text-center mt-20 text-xl">Cargando...</p>;
  }

  // Juego
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      {/* Estadísticas */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-block bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-700/50 mb-6 transition hover:scale-[1.02]">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
            Memory Pokémon
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-3 font-medium">
            ¡Encuentra las parejas de Pokémon!
          </p>
        </div>
        <div className="flex justify-center gap-4 md:gap-8 mb-2">
          {/* Puntos */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
            <TrophyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Puntos</p>
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {score}
              </p>
            </div>
          </div>
          {/* Tiempo */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
            <TimerIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tiempo</p>
              <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                {timeLeft < 10 ? `0:0${timeLeft}` : `0:${timeLeft}`}
              </p>
            </div>
          </div>
          {/* Intentos globales */}
          <GlobalCounter />
        </div>
        {score === NUM_CARDS ? (
          <p className="text-center text-2xl font-semibold text-green-600 mb-6">
            ¡Felicidades! Has ganado la partida
          </p>
        ) : timeLeft <= 0 ? (
          <p className="text-center text-2xl font-semibold text-red-600 mb-6">
            La partida ha finalizado
          </p>
        ) : null}
      </div>
      {/* Tablero */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 mb-10">
        <GrupoTarjetas cards={cards} onCardClick={handleCardClick} />
      </div>
      {/* Reiniciar */}
      <div className="flex justify-center gap-6">
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition hover:-translate-y-1"
        >
          <RotateCwIcon className="w-5 h-5" /> Reiniciar Juego
        </button>
      </div>
    </div>
  );
}
