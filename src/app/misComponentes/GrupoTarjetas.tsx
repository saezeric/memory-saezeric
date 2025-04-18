"use client";

import * as React from "react";

export interface Card {
  nom: string;
  imatge: string;
  id: number;
  flipped: boolean;
  matched: boolean;
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
    <div className="grid grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick(card)}
          className="flip-container"
          style={{ perspective: "1000px" }}
        >
          {/* El contenedor interno "flipper" rota según el estado de la carta.
              Cuando no está volteada, se le aplica rotateY(180deg) para mostrar la cara trasera,
              la cual tendrá un fondo opaco que oculta cualquier pista */}
          <div
            className="flipper relative w-full h-56 transition-transform duration-600"
            style={{
              transformStyle: "preserve-3d",
              transform:
                card.flipped || card.matched
                  ? "rotateY(0deg)"
                  : "rotateY(180deg)",
            }}
          >
            {/* Cara frontal: contiene la imagen del jugador */}
            <div
              className="front absolute w-full h-full flex items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <img
                src={card.imatge}
                alt={card.nom}
                className="object-contain max-h-52 max-w-[95%] transition duration-300"
              />
            </div>
            {/* Cara trasera: se muestra cuando la carta NO está volteada.
                Tiene fondo sólido para que no se vea nada de la imagen de la cara frontal */}
            <div
              className="back absolute w-full h-full flex items-center justify-center bg-[#1f2937]"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-white text-4xl font-bold">?</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GrupoTarjetas;
