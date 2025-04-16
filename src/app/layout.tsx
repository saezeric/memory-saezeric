// app/layout.tsx

import "./globals.css";
import { GlobalCounterProvider } from "@/context/GlobalCounterContext";
import { Header } from "./misComponentes/Header";

export const metadata = {
  title: "Memory Game",
  description: "Proyecto del juego Memory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <GlobalCounterProvider>
          <Header />
          <main>{children}</main>
        </GlobalCounterProvider>
      </body>
    </html>
  );
}
