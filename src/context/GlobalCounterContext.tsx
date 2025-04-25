// context/GlobalCounterContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

// Interfaz del contexto con solo el contador total y la función para incrementarlo
interface GlobalCounterContextType {
  totalClicks: number;
  incrementTotal: () => void;
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

  // Sólo incrementamos el contador global
  const incrementTotal = () => setTotalClicks((prev) => prev + 1);

  return (
    <GlobalCounterContext.Provider value={{ totalClicks, incrementTotal }}>
      {children}
    </GlobalCounterContext.Provider>
  );
};

// Hook para acceder al contexto, lanzará error si no está dentro del Provider
export const useGlobalCounter = () => {
  const context = useContext(GlobalCounterContext);
  if (!context) {
    throw new Error(
      "useGlobalCounter debe usarse dentro de GlobalCounterProvider"
    );
  }
  return context;
};
