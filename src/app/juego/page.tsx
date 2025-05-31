// app/juego/page.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import GrupoTarjetas, { Card } from "@/app/misComponentes/GrupoTarjetas";
import { PlayIcon, RotateCwIcon, TimerIcon, TrophyIcon } from "lucide-react";
import { useGlobalCounter } from "@/context/GlobalCounterContext";
import GlobalCounter from "@/app/misComponentes/GlobalCounter";
import { useAuth } from "@/context/AuthContext";

interface Category {
  id: number;
  name: string;
}

interface ApiCard {
  id: number;
  name: string;
  image_url: string;
  category_id: number;
  user_id: number | null;
}

export default function Juego() {
  const router = useRouter();
  const { user } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Esperar a que termine de cargar auth y redirigir si no hay usuario
  useEffect(() => {
    if (user === undefined) return; // todavía cargando
    setAuthChecked(true);
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  // --- Parámetros generales ---
  const API_BASE = "https://m7-laravel-saezeric-production.up.railway.app/api";
  const NUM_CARDS = 6;
  const INITIAL_TIME = 20;

  // --- Estados de pre-arranque ---
  type SourceOption = "external" | "internal";
  const [chosenSource, setChosenSource] = useState<SourceOption>("external");

  // Lista de categorías para la API interna
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [internalVisibility, setInternalVisibility] = useState<
    "public" | "private"
  >("public");

  // Mensaje de error si no hay suficientes cartas
  const [prestartError, setPrestartError] = useState<string>("");

  // --- Estados de flujo del juego ---
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del juego (mazo, lógica de parejas, score, timer…)
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

  // Contador global de clicks
  const { totalClicks, incrementTotal, resetTotal } = useGlobalCounter();

  // --- Función para simplificar la cabecera Authorization ---
  // Devuelve { Authorization: "Bearer XXX" } si hay token, o undefined si no lo hay
  const tokenHeader = (): HeadersInit | undefined => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { Authorization: `Bearer ${t}` } : undefined;
  };

  // --- Carga de categorías (API Interna) al montar ---
  useEffect(() => {
    if (!authChecked) return;
    // Solo si el usuario existe, cargamos categorías
    fetch(`${API_BASE}/categories`, {
      headers: tokenHeader(),
    })
      .then((res) => res.json())
      .then((json) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let raw: any[] = [];
        if (Array.isArray(json)) {
          raw = json;
        } else if (Array.isArray(json.data)) {
          raw = json.data;
        }
        const list: Category[] = raw.map((c) => ({
          id: c.id,
          name: c.name,
        }));
        setCategories(list);
      })
      .catch(console.error);
  }, [authChecked]);

  // --- Funciones para PokeAPI (API Externa) ---
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
  const getRandomPokemon = async (count: number): Promise<PokemonResponse> => {
    while (true) {
      const id = Math.floor(Math.random() * count) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (res.ok) return res.json();
    }
  };

  // Baraja y carga mazo desde PokéAPI
  const fetchDeckExternal = useCallback(async () => {
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
      // Fisher–Yates shuffle
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
  }, []);

  // --- Funciones para API Interna ---
  // Carga mazo desde nuestra API interna (según categoría y visibilidad)
  const fetchDeckInternal = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (internalVisibility === "public") {
        endpoint = `/cards/category/${selectedCategory}`;
      } else {
        // “private” → solo mis cartas → filtramos por category localmente
        endpoint = `/my-cards`;
      }
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: tokenHeader(),
      });
      const json = await res.json();
      // Dependiendo del endpoint, json.data es array de cartas
      const rawCards: ApiCard[] = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];

      // Si private, filtramos aquellas que tengan category_id === selectedCategory
      const filtered: ApiCard[] =
        internalVisibility === "private"
          ? rawCards.filter((c) => c.category_id === Number(selectedCategory))
          : rawCards;

      // Tomamos las primeras NUM_CARDS cartas distintas
      const uniqueCandidates = filtered.slice(0, NUM_CARDS).map((c) => ({
        nom: c.name,
        imatge: c.image_url,
        id: c.id + Math.random(), // ID único
        flipped: false,
        matched: false,
        localClicks: 0,
      }));

      // Crear pares duplicados (flatMap)
      const deck: Card[] = uniqueCandidates.flatMap((p) => [
        { ...p },
        { ...p, id: Math.random() },
      ]);

      // Shuffle Fisher–Yates
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      setCards(deck);
    } catch (err) {
      console.error("Error cargando cartas internas:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, internalVisibility]);

  // --- Función para crear partida en el backend (se usa en ambos casos) ---
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
  }, []);

  // --- Función para finalizar partida en el backend ---
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
  }, [gameId, score, totalClicks, finished]);

  // --- Lógica de comparación de parejas ---
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
    if (!firstCard) {
      setFirstCard({
        ...clicked,
        flipped: true,
        localClicks: clicked.localClicks + 1,
      });
    } else if (!secondCard) {
      setSecondCard({
        ...clicked,
        flipped: true,
        localClicks: clicked.localClicks + 1,
      });
    }
  };

  // --- Comprobar si la categoría interna tiene suficientes cartas ---
  const canStartInternal = async () => {
    setPrestartError("");
    if (selectedCategory === "") {
      setPrestartError("Debes seleccionar una categoría.");
      return false;
    }

    // Construimos URL según visibilidad
    let url = "";
    if (internalVisibility === "public") {
      url = `${API_BASE}/cards/category/${selectedCategory}`;
    } else {
      // Privada: cargar “my-cards” y filtrar por categoría
      url = `${API_BASE}/my-cards`;
    }
    try {
      const res = await fetch(url, { headers: tokenHeader() });
      const json = await res.json();
      const rawCards: ApiCard[] = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];
      // Si es privada, filtramos por category_id
      const filtered: ApiCard[] =
        internalVisibility === "private"
          ? rawCards.filter((c) => c.category_id === Number(selectedCategory))
          : rawCards;
      if (filtered.length < NUM_CARDS) {
        setPrestartError(
          "La categoría seleccionada no tiene al menos 6 cartas disponibles."
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      setPrestartError(
        "No se pudieron verificar las cartas. Intenta de nuevo."
      );
      return false;
    }
  };

  // --- Handler al pulsar “Iniciar Partida” ---
  const handleStartClick = async () => {
    // Reiniciamos el contador global en cada intento de partida
    resetTotal();

    if (chosenSource === "external") {
      // Siempre podemos arrancar con PokéAPI
      setStarted(true);
      return;
    }
    // Si fuente interna, comprobamos antes
    const ok = await canStartInternal();
    if (ok) {
      setStarted(true);
    }
  };

  // --- Efecto que dispara la carga/creación cuando 'started' pasa a true ---
  useEffect(() => {
    if (!started) return;

    // 1) Creamos partida en backend
    createGame();

    // 2) Cargamos mazo según source
    if (chosenSource === "external") {
      fetchDeckExternal();
    } else {
      fetchDeckInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

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

  const resetGame = () => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    resetTotal(); // El usuario puede pulsar “Reiniciar Juego” también
    setFinished(false);
    setStarted(false);
  };

  // --- Pre-arranque: pantalla de selección de fuente / parámetros ---
  if (!authChecked || user === undefined) {
    return null;
  }
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Selecciona Fuente de Cartas
          </h2>

          {/* Radio para elegir API Externa o Interna */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="source"
                value="external"
                checked={chosenSource === "external"}
                onChange={() => {
                  setChosenSource("external");
                  setPrestartError("");
                }}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-lg">PokéAPI (Externa)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="source"
                value="internal"
                checked={chosenSource === "internal"}
                onChange={() => {
                  setChosenSource("internal");
                  setPrestartError("");
                }}
                className="h-4 w-4 text-green-600"
              />
              <span className="text-lg">API Interna</span>
            </label>
          </div>

          {/* Si API Interna, mostramos selects de categoría y visibilidad */}
          {chosenSource === "internal" && (
            <div className="space-y-4 mb-6">
              {/* Seleccionar Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(
                      e.target.value === "" ? "" : Number(e.target.value)
                    );
                    setPrestartError("");
                  }}
                >
                  <option value="">— Selecciona categoría —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleccionar Pública / Privada */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Visibilidad
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={internalVisibility}
                  onChange={(e) => {
                    setInternalVisibility(
                      e.target.value === "public" ? "public" : "private"
                    );
                    setPrestartError("");
                  }}
                >
                  <option value="public">Públicas</option>
                  <option value="private">Privadas (Mis Cartas)</option>
                </select>
              </div>
            </div>
          )}

          {/* Mensaje de error si no hay suficientes cartas */}
          {prestartError && (
            <p className="text-red-600 text-center mb-4">{prestartError}</p>
          )}

          {/* Botón Iniciar Partida */}
          <div className="flex justify-center">
            <button
              onClick={handleStartClick}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
            >
              <PlayIcon className="w-5 h-5" /> Iniciar Partida
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Carga (si loading === true) ---
  if (loading) {
    return <p className="text-center mt-20 text-xl">Cargando...</p>;
  }

  // --- Pantalla de juego ya iniciado ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      {/* Estadísticas */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-block bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-700/50 mb-6 transition hover:scale-[1.02]">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
            {chosenSource === "external"
              ? "Memory Pokémon"
              : "Memory Cartas Internas"}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-3 font-medium">
            ¡Encuentra las parejas de{" "}
            {chosenSource === "external" ? "Pokémon" : "Cartas"}!
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
