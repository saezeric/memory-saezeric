// components/GlobalCounter.tsx
"use client";

import React from "react";
import { useGlobalCounter } from "@/context/GlobalCounterContext";
import { PlayIcon } from "lucide-react";

// Muestra sólo el total de clics acumulados en todas las cartas
const GlobalCounter = () => {
  const { totalClicks } = useGlobalCounter();

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
      <PlayIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Intentos</p>
        <p className="font-bold text-lg text-green-600 dark:text-green-400">
          {totalClicks}
        </p>
      </div>
    </div>
  );
};

export default GlobalCounter;
