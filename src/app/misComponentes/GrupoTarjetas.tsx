"use client";

import * as React from "react";
import Tarjeta, { TarjetaProps } from "@/app/misComponentes/Tarjeta";

interface GrupoTarjetasProps {
  // Array de propiedades para cada tarjeta
  tarjetas: TarjetaProps[];
}

export default function GrupoTarjetas({ tarjetas }: GrupoTarjetasProps) {
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 md:px-8 w-full max-w-7xl mx-auto">
      {tarjetas.map((tarjeta, index) => (
        <Tarjeta key={index} nom={tarjeta.nom} imatge={tarjeta.imatge} />
      ))}
    </div>
  );
}
