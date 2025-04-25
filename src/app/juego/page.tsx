/* eslint-disable @typescript-eslint/no-empty-object-type */ // Desactiva alerta de TS para tipos vacíos
/* eslint-disable @typescript-eslint/no-unused-vars */ // Desactiva alerta de TS para variables no usadas
"use client"; // Marca este componente para que se renderice en el cliente

import * as React from "react"; // Importa React completo
import { useState, useEffect } from "react"; // Importa hooks de estado y efecto
import GrupoTarjetas, { Card } from "@/app/misComponentes/GrupoTarjetas"; // Importa componente de tarjetas y su tipo
import { PlayIcon, RotateCwIcon, TimerIcon, TrophyIcon } from "lucide-react"; // Importa iconos

export default function Juego() {
  // Componente principal del juego
  const tarjetasDePrueba = [
    // Lista de objetos con nombre e imagen de cada jugador
    { nom: "Cristiano Ronaldo", imatge: "/juego/images/cristiano.png" },
    { nom: "Lionel Messi", imatge: "/juego/images/messi.png" },
    { nom: "Erling Haaland", imatge: "/juego/images/haaland.png" },
    { nom: "Lamine Yamal", imatge: "/juego/images/lamine.png" },
    { nom: "Raphinha", imatge: "/juego/images/raphinha.png" },
    { nom: "Pedri", imatge: "/juego/images/pedri.png" },
  ];

  interface CardType extends Card {} // Define CardType igual que Card (puede extenderse)

  const initializeDeck = (): CardType[] => {
    // Función que crea y baraja el mazo
    const duplicated = tarjetasDePrueba.flatMap((card) => [
      // Duplica cada carta
      { ...card, id: Math.random(), flipped: false, matched: false },
      { ...card, id: Math.random(), flipped: false, matched: false },
    ]);
    for (let i = duplicated.length - 1; i > 0; i--) {
      // Bucle para barajar
      const j = Math.floor(Math.random() * (i + 1));
      [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]]; // Intercambia elementos
    }
    return duplicated; // Devuelve mazo barajado
  };

  const [cards, setCards] = useState<CardType[]>([]); // Estado array de cartas
  const [firstCard, setFirstCard] = useState<CardType | null>(null); // Estado primera carta seleccionada
  const [secondCard, setSecondCard] = useState<CardType | null>(null); // Estado segunda carta seleccionada
  const [clickCount, setClickCount] = useState(0); // Estado contador de clics
  const [score, setScore] = useState(0); // Estado puntos (cartas pares acertadas)
  const [timeLeft, setTimeLeft] = useState(20); // Estado tiempo restante
  const [isChecking, setIsChecking] = useState(false); // Estado evita clics durante comprobación

  useEffect(() => {
    // Efecto al montar: inicializa mazo
    setCards(initializeDeck());
  }, []);

  // Efecto del temporizador
  useEffect(() => {
    const totalPairs = tarjetasDePrueba.length; // Número de parejas totales
    if (timeLeft <= 0 || score === totalPairs) return; // Si la partida es finalizada, sale del useEffect y termina la partida
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000); // Decrementa cada segundo
    return () => clearInterval(timer); // Limpia intervalo para evitar problemas en segundo plano, queremos el estado limpio
  }, [timeLeft, score]);

  // Efecto para comprobar parejas
  useEffect(() => {
    if (!firstCard || !secondCard) return; // Si falta alguna carta, sale
    setIsChecking(true); // Evita más clics
    if (firstCard.nom === secondCard.nom) {
      // Si coinciden nombres
      setCards(
        (
          prev // Marca matched como true
        ) =>
          prev.map((c) =>
            c.nom === firstCard.nom ? { ...c, matched: true } : c
          )
      );
      setScore((s) => s + 1); // Aumenta puntos
      resetTurn(); // Limpia selección
    } else {
      setTimeout(() => {
        // Si no coinciden, espera 1s
        setCards(
          (
            prev // Vuelve a ocultar
          ) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, flipped: false }
                : c
            )
        );
        resetTurn(); // Limpia selección
      }, 1000);
    }
  }, [firstCard, secondCard]);

  // Función para limpiar selección
  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setIsChecking(false);
  };

  const handleCardClick = (clicked: CardType) => {
    // Al clicar una carta
    if (isChecking || clicked.flipped || clicked.matched || timeLeft <= 0)
      return; // Valida
    setClickCount((c) => c + 1); // Suma clic
    setCards(
      (
        prev // Voltea la carta clicada
      ) => prev.map((c) => (c.id === clicked.id ? { ...c, flipped: true } : c))
    );
    if (!firstCard) setFirstCard({ ...clicked, flipped: true }); // Si es la 1a
    else if (!secondCard) setSecondCard({ ...clicked, flipped: true }); // Si es la 2a
  };

  // Reiniciamos el juego o partida
  const resetGame = () => {
    // Creamos un nuevo mazo
    setCards(initializeDeck());
    setFirstCard(null);
    setSecondCard(null);
    setClickCount(0);
    setScore(0);
    setTimeLeft(20);
  };

  return (
    // Render principal
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden -z-20">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-purple-400/10 rounded-full filter blur-[100px]" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-block bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-700/50 mb-6 transform transition-all hover:scale-[1.02]">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
              Memory Football Stars
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-3 font-medium">
              ¡Empareja a tus estrellas de fútbol favoritas!
            </p>
          </div>
          <div className="flex justify-center gap-4 md:gap-8 mb-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
              <TrophyIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Puntos
                </p>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {score}
                </p>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
              <TimerIcon className="text-purple-600 dark:text-purple-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tiempo
                </p>
                <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                  {timeLeft < 10 ? `0:0${timeLeft}` : `0:${timeLeft}`}
                </p>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
              <PlayIcon className="text-green-600 dark:text-green-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Intentos
                </p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  {clickCount}
                </p>
              </div>
            </div>
          </div>
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
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 mb-10">
          <GrupoTarjetas cards={cards} onCardClick={handleCardClick} />
        </div>
        <div className="flex justify-center gap-6">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-ỳ-1"
          >
            {" "}
            <RotateCwIcon className="w-5 h-5" /> Reiniciar Juego
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50 pointer-events-none -z-10" />
    </div>
  );
}
