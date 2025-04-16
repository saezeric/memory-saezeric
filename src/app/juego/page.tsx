/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import GrupoTarjetas, { Card } from "@/app/misComponentes/GrupoTarjetas";
import { PlayIcon, RotateCwIcon, TimerIcon, TrophyIcon } from "lucide-react";

export default function Juego() {
  // Tarjetas base para el juego (sin estado)
  const tarjetasDePrueba = [
    { nom: "Cristiano Ronaldo", imatge: "/juego/images/cristiano.png" },
    { nom: "Lionel Messi", imatge: "/juego/images/messi.png" },
    { nom: "Erling Haaland", imatge: "/juego/images/haaland.png" },
    { nom: "Lamine Yamal", imatge: "/juego/images/lamine.png" },
    { nom: "Raphinha", imatge: "/juego/images/raphinha.png" },
    { nom: "Pedri", imatge: "/juego/images/pedri.png" },
  ];

  // Definición del tipo de carta con estado (extendemos el Card de GrupoTarjetas)
  interface CardType extends Card {}

  // Función para inicializar el mazo:
  // Duplicamos, asignamos id usando Math.random() (solo en el cliente) y barajamos
  const initializeDeck = (): CardType[] => {
    const duplicatedCards = tarjetasDePrueba.flatMap((card) => [
      { ...card, id: Math.random(), flipped: false, matched: false },
      { ...card, id: Math.random(), flipped: false, matched: false },
    ]);

    // Algoritmo de Fisher-Yates para barajar
    for (let i = duplicatedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicatedCards[i], duplicatedCards[j]] = [
        duplicatedCards[j],
        duplicatedCards[i],
      ];
    }
    return duplicatedCards;
  };

  // Estados del juego
  const [cards, setCards] = useState<CardType[]>([]);
  const [firstCard, setFirstCard] = useState<CardType | null>(null);
  const [secondCard, setSecondCard] = useState<CardType | null>(null);
  const [clickCount, setClickCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Inicializamos el mazo y marcamos que se ha montado (se ejecuta solo en el cliente)
  useEffect(() => {
    setCards(initializeDeck());
    setHasMounted(true);
  }, []);

  // Temporizador: decrementa el tiempo cada segundo hasta que llega a 0
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Efecto para comparar cartas cuando se han volteado dos
  useEffect(() => {
    if (firstCard && secondCard) {
      setIsChecking(true);
      if (firstCard.nom === secondCard.nom) {
        // Si coinciden, las marcamos como aparejadas y sumamos puntos
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.nom === firstCard.nom ? { ...card, matched: true } : card
          )
        );
        setScore((prev) => prev + 1);
        resetTurn();
      } else {
        // Si no, esperamos 1 segundo y las volvemos a ocultar (flip back)
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, flipped: false }
                : card
            )
          );
          resetTurn();
        }, 1000);
      }
    }
  }, [firstCard, secondCard]);

  // Función para reiniciar la selección de cartas
  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setIsChecking(false);
  };

  // Manejo del clic en una carta
  const handleCardClick = (clickedCard: CardType) => {
    if (
      isChecking ||
      clickedCard.flipped ||
      clickedCard.matched ||
      timeLeft <= 0
    )
      return;

    // Se incrementa el contador de clics
    setClickCount((prev) => prev + 1);
    // Se voltea la carta (actualizamos el estado)
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === clickedCard.id ? { ...card, flipped: true } : card
      )
    );

    // Guardamos la carta en firstCard o secondCard según corresponda
    if (!firstCard) {
      setFirstCard({ ...clickedCard, flipped: true });
    } else if (!secondCard) {
      setSecondCard({ ...clickedCard, flipped: true });
    }
  };

  // Función para reiniciar el juego por completo
  const resetGame = () => {
    setCards(initializeDeck());
    setFirstCard(null);
    setSecondCard(null);
    setClickCount(0);
    setScore(0);
    setTimeLeft(20);
  };

  // Siempre renderizamos la estructura principal. Si aún no se ha montado, mostramos un placeholder (por ejemplo, un contenedor vacío)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 relative overflow-hidden">
      {/* Efectos decorativos */}
      <div className="absolute inset-0 overflow-hidden -z-20">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-purple-400/10 rounded-full filter blur-[100px]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-block bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-700/50 mb-6 transform transition-all hover:scale-[1.02]">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%]">
              Memory Football Stars
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-3 font-medium">
              ¡Empareja a tus estrellas de fútbol favoritas!
            </p>
          </div>

          {/* Estadísticas */}
          <div className="flex justify-center gap-4 md:gap-8 mb-8">
            {/* Pares */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3 group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
              <div className="p-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200/50 dark:group-hover:bg-blue-800/40 transition-colors">
                <TrophyIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pares
                </p>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {score}/{tarjetasDePrueba.length}
                </p>
              </div>
            </div>

            {/* Tiempo */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3 group hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
              <div className="p-2 bg-purple-100/80 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200/50 dark:group-hover:bg-purple-800/40 transition-colors">
                <TimerIcon className="text-purple-600 dark:text-purple-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tiempo
                </p>
                <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                  {timeLeft < 10 ? `0:0${timeLeft}` : `0:${timeLeft}`}
                </p>
              </div>
            </div>

            {/* Intentos */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3 group hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors">
              <div className="p-2 bg-green-100/80 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200/50 dark:group-hover:bg-green-800/40 transition-colors">
                <PlayIcon className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
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
        </div>

        {/* Área de juego con el grupo de tarjetas */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 mb-10 transform transition-all hover:shadow-2xl">
          <GrupoTarjetas cards={cards} onCardClick={handleCardClick} />
        </div>

        {/* Botón de reiniciar */}
        <div className="flex justify-center gap-6">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all hover:-translate-y-1"
          >
            <RotateCwIcon className="w-5 h-5" />
            Reiniciar Juego
          </button>
        </div>
      </div>

      {/* Efectos decorativos adicionales */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50 pointer-events-none -z-10"></div>
    </div>
  );
}
