"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, ListIcon, Github } from "lucide-react";
import { Section } from "@/components/ui/section";
import Glow from "@/components/ui/glow";
import Link from "next/link"; // <-- Importa Link
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "Memory Cards Challenge",
  description = "¡Pon a prueba tu memoria! Encuentra todas las parejas antes de que se acabe el tiempo y demuestra que tienes la mejor memoria.",
  badge = (
    <Badge
      variant="outline"
      className="animate-appear bg-white dark:bg-gray-900 border-primary text-primary hover:bg-primary/10"
    >
      <a
        href="https://github.com/saezeric/memory-saezeric"
        className="flex items-center gap-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github className="size-4" />
        Ver código en GitHub
      </a>
    </Badge>
  ),
  buttons = [
    {
      href: "/juego",
      text: "¡Jugar Ahora!",
      variant: "default",
      icon: <PlayIcon className="mr-2 size-5" />,
    },
    {
      href: "/partidas",
      text: "Mis Partidas",
      variant: "outline",
      icon: <ListIcon className="mr-2 size-5" />,
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section className={cn("fade-bottom overflow-hidden pb-0", className)}>
      <div className="relative max-w-container mx-auto flex flex-col gap-8 pt-12 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-10 relative z-10">
          {badge !== false && badge}
          <div className="space-y-4">
            <h1 className="animate-appear text-5xl font-extrabold tracking-tight text-balance sm:text-6xl md:text-7xl">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {title}
              </span>
              <span className="block mt-3 text-xl sm:text-2xl md:text-3xl font-medium text-muted-foreground">
                ¿Cuántas parejas puedes encontrar?
              </span>
            </h1>
            <p className="animate-appear text-lg text-muted-foreground max-w-[720px] opacity-0 delay-100 sm:text-xl">
              {description}
            </p>
          </div>
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative flex flex-wrap justify-center gap-4 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  asChild // Hacemos que Button delegue a su hijo
                  variant={button.variant}
                  size="lg"
                  className="text-lg font-semibold px-8 py-6 rounded-xl hover:shadow-md transition-all"
                >
                  {/* Aquí usamos Link en lugar de <a> para navegación SPA */}
                  <Link href={button.href} className="flex items-center">
                    {button.icon}
                    {button.text}
                    {button.iconRight}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
        {/* Glow como decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <Glow
            variant="top"
            className="animate-appear-zoom opacity-0 delay-700 from-primary/20 to-purple-500/20"
          />
          <Glow
            variant="bottom"
            className="animate-appear-zoom opacity-0 delay-700 from-blue-400/20 to-purple-500/20"
          />
        </div>
      </div>
    </Section>
  );
}
