// components/GlobalCounter.tsx
"use client";

import React from "react";
import { useGlobalCounter } from "@/context/GlobalCounterContext";

// Muestra sólo el total de clics acumulados en todas las cartas
const GlobalCounter = () => {
  const { totalClicks } = useGlobalCounter();

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">Intentos Totales</h2>
      <p className="text-3xl font-semibold">{totalClicks}</p>
    </div>
  );
};

export default GlobalCounter;
