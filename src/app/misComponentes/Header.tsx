// components/ui/Header.tsx
"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  // Mientras user === undefined, estamos cargando la sesión
  if (user === undefined) {
    return null;
  }

  return (
    <Menubar>
      {/* Enlaces públicos */}
      <MenubarMenu>
        <MenubarTrigger>
          <Link href="/home">Home</Link>
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          <Link href="/juego">Juego</Link>
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          <Link href="/partidas">Partidas</Link>
        </MenubarTrigger>
      </MenubarMenu>

      {/* Si no hay user, muestro Login y Registrarse */}
      {!user && (
        <>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href="/login">Login</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href="/register">Registrarse</Link>
            </MenubarTrigger>
          </MenubarMenu>
        </>
      )}

      {/* Si hay user, muestro un único menú con su nombre */}
      {user && (
        <MenubarMenu>
          <MenubarTrigger>{user.name}</MenubarTrigger>
          <MenubarContent>
            {/* Opción de Panel Admin solo para admin */}
            {user.role === "admin" && (
              <MenubarItem asChild>
                <Link href="/admin/dashboard">Panel Admin</Link>
              </MenubarItem>
            )}
            {/* Opción de Panel Usuario solo para rol “user” */}
            {user.role === "user" && (
              <MenubarItem asChild>
                <Link href="/user/dashboard">Mi Panel</Link>
              </MenubarItem>
            )}
            <MenubarItem onSelect={logout}>Cerrar sesión</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}
    </Menubar>
  );
}
