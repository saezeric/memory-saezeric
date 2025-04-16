// context/GlobalCounterContext.tsx
"use client";

import React, { createContext, useState, useContext } from "react";

// Definición de la interfaz para tipar el contexto
interface GlobalCounterContextType {
  counter: number;
  increment: () => void;
  decrement: () => void;
}

// Creamos el contexto con un valor inicial undefined
const GlobalCounterContext = createContext<
  GlobalCounterContextType | undefined
>(undefined);

export const GlobalCounterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [counter, setCounter] = useState<number>(0);

  const increment = () => setCounter((prev) => prev + 1);
  const decrement = () => setCounter((prev) => prev - 1);

  return (
    <GlobalCounterContext.Provider value={{ counter, increment, decrement }}>
      {children}
    </GlobalCounterContext.Provider>
  );
};

// Hook para facilitar el uso del contexto
export const useGlobalCounter = () => {
  const context = useContext(GlobalCounterContext);
  if (!context) {
    throw new Error(
      "useGlobalCounter debe usarse dentro de GlobalCounterProvider"
    );
  }
  return context;
};
