// context/GlobalCounterContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

// Interfaz ampliada con resetTotal
interface GlobalCounterContextType {
  totalClicks: number;
  incrementTotal: () => void;
  resetTotal: () => void; // <-- añadimos aquí
}

// Creamos el contexto, inicialmente undefined
const GlobalCounterContext = createContext<
  GlobalCounterContextType | undefined
>(undefined);

// Provider que envuelve la app y gestiona el total de clics
export const GlobalCounterProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [totalClicks, setTotalClicks] = useState(0);

  // Incrementa el contador global
  const incrementTotal = () => setTotalClicks((prev) => prev + 1);
  // Reinicia el contador global a cero
  const resetTotal = () => setTotalClicks(0);

  return (
    <GlobalCounterContext.Provider
      value={{ totalClicks, incrementTotal, resetTotal }}
    >
      {children}
    </GlobalCounterContext.Provider>
  );
};

// Hook para acceder al contexto
export const useGlobalCounter = () => {
  const context = useContext(GlobalCounterContext);
  if (!context) {
    throw new Error(
      "useGlobalCounter debe usarse dentro de GlobalCounterProvider"
    );
  }
  return context;
};
