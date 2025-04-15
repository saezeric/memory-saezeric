/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";

export function Header() {
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
          <Link href="/acerca">Acerca</Link>
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
