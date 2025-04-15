// app/page.tsx
import { redirect } from "next/navigation";

export default function Index() {
  // Redirige a /home cada vez que se acceda a "/"
  redirect("/home");
}
