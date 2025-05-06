// app/layout.tsx
import "./globals.css";
import { GlobalCounterProvider } from "@/context/GlobalCounterContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "./misComponentes/Header";

export const metadata = {
  title: "Memory Game",
  description: "Proyecto del juego Memory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <GlobalCounterProvider>
            <Header />
            <main>{children}</main>
          </GlobalCounterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
