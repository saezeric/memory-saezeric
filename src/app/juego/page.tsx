/* eslint-disable @typescript-eslint/no-empty-object-type */ // Desactiva alerta de TS para tipos vacíos
/* eslint-disable @typescript-eslint/no-unused-vars */ // Desactiva alerta de TS para variables no usadas
"use client"; // Marca este componente para que se renderice en el cliente

import * as React from "react"; // Importa React completo
import { useState, useEffect } from "react"; // Importa hooks de estado y efecto
import GrupoTarjetas, { Card } from "@/app/misComponentes/GrupoTarjetas"; // Importa componente de tarjetas y su tipo
import { PlayIcon, RotateCwIcon, TimerIcon, TrophyIcon } from "lucide-react"; // Importa iconos
import { useGlobalCounter } from "@/context/GlobalCounterContext"; // Hook para contador global
import GlobalCounter from "../misComponentes/GlobalCounter";

export default function Juego() {
  // Datos base de las cartas (sin estado)
  const tarjetasDePrueba = [
    { nom: "Cristiano Ronaldo", imatge: "/juego/images/cristiano.png" },
    { nom: "Lionel Messi", imatge: "/juego/images/messi.png" },
    { nom: "Erling Haaland", imatge: "/juego/images/haaland.png" },
    { nom: "Lamine Yamal", imatge: "/juego/images/lamine.png" },
    { nom: "Raphinha", imatge: "/juego/images/raphinha.png" },
    { nom: "Pedri", imatge: "/juego/images/pedri.png" },
  ];

  // Extendemos Card para incluir contador local

  // Esto esta haciendo varias cosas:
  // 1. La primera es que cada carta que este presente dentro del juego, si o si tiene que tener un localClicks, por lo que sirve a modo de refuerzo
  // 2. Si construimos alguna carta sin localClicks, TypeScript nos va a dar un error
  interface CardType extends Card {
    localClicks: number;
  }

  // Inicializa el mazo con cartas duplicadas y barajadas
  const initializeDeck = (): CardType[] => {
    const duplicated: CardType[] = tarjetasDePrueba.flatMap((card) => [
      {
        ...card,
        id: Math.random(),
        flipped: false,
        matched: false,
        localClicks: 0,
      },
      {
        ...card,
        id: Math.random(),
        flipped: false,
        matched: false,
        localClicks: 0,
      },
    ]);
    for (let i = duplicated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]]; // Intercambia
    }
    return duplicated;
  };

  // Estados del juego
  const [cards, setCards] = useState<CardType[]>([]); // Cartas con estado
  const [firstCard, setFirstCard] = useState<CardType | null>(null); // Primera carta seleccionada
  const [secondCard, setSecondCard] = useState<CardType | null>(null); // Segunda carta seleccionada
  const [score, setScore] = useState(0); // Puntos (pares acertados)
  const [timeLeft, setTimeLeft] = useState(20); // Tiempo restante
  const [isChecking, setIsChecking] = useState(false); // Bloqueo de clics durante comprobación

  // Contador global de clics
  const { totalClicks, incrementTotal } = useGlobalCounter();

  // Montaje: inicializa cartas
  useEffect(() => {
    setCards(initializeDeck());
  }, []);

  // Temporizador que se detiene al acabar el juego
  useEffect(() => {
    const totalPairs = tarjetasDePrueba.length;
    if (timeLeft <= 0 || score === totalPairs) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, score]);

  // Comparación de parejas
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

  // Limpia la selección de cartas
  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setIsChecking(false);
  };

  // Maneja el clic en una carta
  const handleCardClick = (clicked: CardType) => {
    if (isChecking || clicked.flipped || clicked.matched || timeLeft <= 0)
      return;
    // Incrementa contador global
    incrementTotal();
    // Voltea y cuenta local
    setCards((prev) =>
      prev.map((c) =>
        c.id === clicked.id
          ? { ...c, flipped: true, localClicks: c.localClicks + 1 }
          : c
      )
    );
    // Guarda primera/segunda carta
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

  // Reinicia el juego completo
  const resetGame = () => {
    setCards(initializeDeck());
    setFirstCard(null);
    setSecondCard(null);
    setScore(0);
    setTimeLeft(20);
  };

  // Renderizado
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      {/* Encabezado y estadísticas */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-block bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-700/50 mb-6 transition hover:scale-[1.02]">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
            Memory Football Stars
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-3 font-medium">
            ¡Empareja a tus estrellas de fútbol favoritas!
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
        {/* Mensaje de fin de partida */}
        {score === tarjetasDePrueba.length ? (
          <p className="text-center text-2xl font-semibold text-green-600 mb-6">
            ¡Felicidades! Has ganado la partida
          </p>
        ) : timeLeft <= 0 ? (
          <p className="text-center text-2xl font-semibold text-red-600 mb-6">
            La partida ha finalizado
          </p>
        ) : null}
      </div>
      {/* Área de juego */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 mb-10">
        <GrupoTarjetas cards={cards} onCardClick={handleCardClick} />
      </div>
      {/* Botón de reiniciar */}
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
