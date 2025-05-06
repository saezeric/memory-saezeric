// Desactiva alerta de TS para tipos vacíos
/* eslint-disable @typescript-eslint/no-unused-vars */ // Desactiva alerta de TS para variables no usadas
"use client"; // Marca este componente para que se renderice en el cliente

import * as React from "react"; // Importa React completo
import { useState, useEffect } from "react"; // Importa hooks de estado y efecto
import GrupoTarjetas, { Card } from "@/app/misComponentes/GrupoTarjetas"; // Importa componente de tarjetas y su tipo
import { PlayIcon, RotateCwIcon, TimerIcon, TrophyIcon } from "lucide-react"; // Importa iconos
import { useGlobalCounter } from "@/context/GlobalCounterContext"; // Hook para contador global
import GlobalCounter from "@/app/misComponentes/GlobalCounter"; // Componente para mostrar intentos globales

export default function Juego() {
  // Número de cartas por partida
  const NUM_CARDS = 6;

  // Estado de las cartas (mazo)
  const [cards, setCards] = useState<Card[]>([]); // Array de cartas dinámicas
  const [loading, setLoading] = useState<boolean>(true); // Controla el mensaje de "Cargando..."

  // Estados de selección y lógica de juego
  const [firstCard, setFirstCard] = useState<Card | null>(null); // Primera carta clicada
  const [secondCard, setSecondCard] = useState<Card | null>(null); // Segunda carta clicada
  const [score, setScore] = useState<number>(0); // Puntos (pares acertados)
  const [timeLeft, setTimeLeft] = useState<number>(20); // Tiempo restante
  const [isChecking, setIsChecking] = useState<boolean>(false); // Bloquea más clics mientras se compara

  // Contador global de clics
  const { totalClicks, incrementTotal } = useGlobalCounter();

  // Función para cargar y preparar el mazo de Pokémon
  // Función auxiliar para obtener un Pokémon válido
  const getRandomPokemon = async (count: number): Promise<any> => {
    while (true) {
      const id = Math.floor(Math.random() * count) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (res.ok) {
        return res.json();
      }
      // Si responde 404, probamos otro id
    }
  };

  // Función para cargar y preparar el mazo de Pokémon
  const fetchDeck = async () => {
    setLoading(true);
    try {
      // 1. Obtener número total de pokémons para un rango dinámico
      const resCount = await fetch("https://pokeapi.co/api/v2/pokemon?limit=0");
      const { count } = resCount.ok ? await resCount.json() : { count: 898 }; // fallback si hay error

      // 2. Promesas para 6 pokémons aleatorios válidos
      const promises = Array.from({ length: NUM_CARDS }).map(() =>
        getRandomPokemon(count)
      );

      // 3. Esperar todas las respuestas y procesar
      const pokemons = await Promise.all(promises);

      // 4. Construir y duplicar cartas, usando la imagen oficial o frontal
      const deck: Card[] = pokemons.flatMap((p: any) => {
        const sprite =
          p.sprites.other["official-artwork"].front_default ||
          p.sprites.front_default;
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

      // 5. Barajar con Fisher-Yates
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      // 6. Actualizar estado de cartas
      setCards(deck);
    } catch (error) {
      console.error("Error cargando Pokémons:", error);
    } finally {
      setLoading(false); // Quitar mensaje de carga
    }
  };

  // Al montar y al reiniciar, cargar nuevo mazo
  useEffect(() => {
    fetchDeck();
  }, []);

  // Temporizador: decrementa cada segundo, se detiene al acabar partida o mientras carga
  useEffect(() => {
    // No iniciar el tiempo hasta que el mazo esté cargado
    if (loading) return;
    // Detener si el tiempo llegó a cero o si hemos ganado todas las parejas
    if (timeLeft <= 0 || score === NUM_CARDS) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer); // Limpia intervalo
  }, [loading, timeLeft, score]);

  // Maneja clic en carta: voltear, contar local y global
  const handleCardClick = (clicked: Card) => {
    if (isChecking || clicked.flipped || clicked.matched || timeLeft <= 0)
      return;
    incrementTotal(); // Sumar al total global
    setCards((prev) =>
      prev.map((c) =>
        c.id === clicked.id
          ? { ...c, flipped: true, localClicks: c.localClicks + 1 }
          : c
      )
    );
    // Guardar primera o segunda carta para comparar
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

  // Reinicia totalmente la partida: puntos, tiempo y nuevo mazo
  const resetGame = () => {
    setScore(0);
    setTimeLeft(20);
    fetchDeck();
  };

  // Mostrar "Cargando..." mientras llega el mazo
  if (loading) {
    return <p className="text-center mt-20 text-xl">Cargando...</p>;
  }

  // Render del juego
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      {/* Encabezado y estadísticas */}
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
          {/* Puntos (pares acertados) */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
            <TrophyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Puntos</p>
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {score}
              </p>
            </div>
          </div>
          {/* Tiempo restante */}
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
        {/* Mensaje de fin de partida */}
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
      {/* Área de juego con cartas */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 mb-10">
        <GrupoTarjetas cards={cards} onCardClick={handleCardClick} />
      </div>
      {/* Botón de reiniciar partida */}
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
