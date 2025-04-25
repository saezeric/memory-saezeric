/* eslint-disable @typescript-eslint/no-unused-vars */
// components/CounterCard.tsx
"use client";

import React from "react";
import { useGlobalCounter } from "@/context/GlobalCounterContext";

interface CounterCardProps {
  // Recibe cuántos clics tiene esta carta
  localClicks: number;
}

// Muestra sólo el contador de clics para una carta específica
const CounterCard = ({ localClicks }: CounterCardProps) => {
  return (
    <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full shadow">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {localClicks}
      </p>
    </div>
  );
};

export default CounterCard;
