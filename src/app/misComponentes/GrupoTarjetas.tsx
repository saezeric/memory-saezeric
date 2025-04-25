"use client";

import React from "react";
import CounterCard from "@/app/misComponentes/CounterCard"; // Importa el componente de contador de cartas

// Definimos la interfaz de cada carta, incluyendo el contador individual
export interface Card {
  nom: string;
  imatge: string;
  id: number;
  flipped: boolean;
  matched: boolean;
  localClicks: number; // Clics en esta carta
}

interface GrupoTarjetasProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

const GrupoTarjetas: React.FC<GrupoTarjetasProps> = ({
  cards,
  onCardClick,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick(card)}
          className="relative cursor-pointer rounded-xl overflow-hidden shadow-lg"
          style={{ perspective: "800px" }}
        >
          <div
            className="flipper w-full h-56 transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform:
                card.flipped || card.matched
                  ? "rotateY(0deg)"
                  : "rotateY(180deg)",
            }}
          >
            {/* Frente de la carta: imagen del jugador */}
            <div
              className="front absolute w-full h-full flex items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <img
                src={card.imatge}
                alt={card.nom}
                className="object-contain max-h-52 max-w-[95%]"
              />
            </div>
            {/* Reverso de la carta: oculta la imagen */}
            <div
              className="back absolute w-full h-full flex items-center justify-center bg-gray-700"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-white text-4xl font-bold">?</span>
            </div>
          </div>
          {/* Contador individual encima de la carta */}
          <CounterCard localClicks={card.localClicks} />
        </div>
      ))}
    </div>
  );
};

export default GrupoTarjetas;
