// components/GlobalCounter.tsx
"use client";

import React from "react";
import { useGlobalCounter } from "@/context/GlobalCounterContext";

const GlobalCounter = () => {
  const { counter, increment, decrement } = useGlobalCounter();

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">Contador Global</h2>
      <p className="mb-2">Valor: {counter}</p>
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded"
          onClick={increment}
        >
          Incrementar
        </button>
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded"
          onClick={decrement}
        >
          Decrementar
        </button>
      </div>
    </div>
  );
};

export default GlobalCounter;
