// components/CounterCard.tsx
"use client";

import React, { useState } from "react";

interface CounterCardProps {
  title: string;
}

const CounterCard = ({ title }: CounterCardProps) => {
  // Estado local para el contador individual
  const [localCounter, setLocalCounter] = useState(0);

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="mb-2">Contador individual: {localCounter}</p>
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => setLocalCounter(localCounter + 1)}
        >
          Incrementar
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={() => setLocalCounter(localCounter - 1)}
        >
          Decrementar
        </button>
      </div>
    </div>
  );
};

export default CounterCard;
