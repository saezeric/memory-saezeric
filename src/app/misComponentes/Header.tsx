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

  return (
    <Menubar>
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

      {user && (
        <MenubarMenu>
          <MenubarTrigger>{user.name}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={logout}>Cerrar sesión</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}
    </Menubar>
  );
}
