"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export interface TarjetaProps {
  nom: string;
  imatge: string;
}

export default function Tarjeta({ nom, imatge }: TarjetaProps) {
  return (
    <Card className="w-full max-w-xs rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      <CardHeader className="relative aspect-square p-0 overflow-hidden">
        <Image
          src={imatge}
          alt={nom}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 px-4 py-2 backdrop-blur-sm">
          <CardTitle className="text-center text-lg font-medium text-gray-800 dark:text-gray-200">
            {nom}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
