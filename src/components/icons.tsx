// src/components/icons.tsx
"use client";

import * as React from "react";
import { Command, Home, Gamepad2, Info } from "lucide-react";

/**
 * Define aquí los iconos que necesites.
 * El ejemplo incluye un icono para logo, home, juego y acerca.
 */
export const Icons = {
  // Icono para el logo de la aplicación
  logo: (props: React.SVGProps<SVGSVGElement>) => <Command {...props} />,

  // Iconos para las rutas principales
  home: (props: React.SVGProps<SVGSVGElement>) => <Home {...props} />,
  juego: (props: React.SVGProps<SVGSVGElement>) => <Gamepad2 {...props} />,
  acerca: (props: React.SVGProps<SVGSVGElement>) => <Info {...props} />,

  // Puedes agregar más iconos según los necesites.
};
