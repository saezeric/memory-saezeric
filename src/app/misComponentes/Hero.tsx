/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, type ButtonProps } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, ListIcon, Github } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";
import { ReactNode } from "react";
import Screenshot from "@/components/ui/screenshot";
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
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "Memory Cards Challenge",
  description = "¡Pon a prueba tu memoria! Encuentra todas las parejas antes de que se acabe el tiempo y demuestra que tienes la mejor memoria.",
  mockup = (
    <Screenshot
      srcLight="/memory-game-light.png"
      srcDark="/memory-game-dark.png"
      alt="Memory Game screenshot"
      width={1248}
      height={765}
      className="w-full rounded-lg border-4 border-primary/20 shadow-lg"
    />
  ),
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
      href: "/acerca",
      text: "Mis Partidas",
      variant: "outline",
      icon: <ListIcon className="mr-2 size-5" />,
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section className={cn("fade-bottom overflow-hidden pb-0", className)}>
      <div className="max-w-container mx-auto flex flex-col gap-8 pt-12 sm:gap-16">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-10">
          {badge !== false && badge}

          <div className="space-y-4">
            <h1 className="animate-appear relative z-10 text-5xl font-extrabold tracking-tight text-balance sm:text-6xl md:text-7xl">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {title}
              </span>
              <span className="block mt-3 text-xl sm:text-2xl md:text-3xl font-medium text-muted-foreground">
                ¿Cuántas parejas puedes encontrar?
              </span>
            </h1>

            <p className="text-lg animate-appear text-muted-foreground relative z-10 max-w-[720px] opacity-0 delay-100 sm:text-xl">
              {description}
            </p>
          </div>

          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative z-10 flex flex-wrap justify-center gap-4 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant}
                  size="lg"
                  className="text-lg font-semibold px-8 py-6 rounded-xl hover:shadow-md transition-all"
                  asChild
                >
                  <a href={button.href}>
                    {button.icon}
                    {button.text}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>

        {mockup !== false && (
          <div className="relative w-full pt-8 sm:pt-12">
            <div className="animate-appear opacity-0 delay-500">
              <div className="relative overflow-hidden rounded-2xl border-4 border-primary/10 shadow-2xl">
                {mockup}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e525_0%,transparent_70%)]" />
              </div>
            </div>

            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-700 from-primary/20 to-purple-500/20"
            />
            <Glow
              variant="bottom"
              className="animate-appear-zoom opacity-0 delay-700 from-blue-400/20 to-purple-500/20"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
