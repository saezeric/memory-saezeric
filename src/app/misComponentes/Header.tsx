"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Asegúrate de que esta ruta coincide

export function Header() {
  const { user, logout } = useAuth(); // Obtenemos info de usuario y acción de logout

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

      {/* Solo mostrar Login/Registro si NO hay usuario */}
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

      {/* Si hay usuario conectado, mostramos un Menú con su nombre y opción de Logout */}
      {user && (
        <MenubarMenu>
          <MenubarTrigger>
            {user.email /* o el campo que uses para mostrar su nombre */}
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={logout}>Cerrar sesión</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}
    </Menubar>
  );
}
