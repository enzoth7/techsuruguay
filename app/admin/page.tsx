import type { Metadata } from "next";
import TechUruguayAdmin from "@/src/components/techsuruguay/TechUruguayAdmin";

export const metadata: Metadata = {
  title: "Admin",
  description: "Panel privado para editar la base de Techs Uruguay.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminPage() {
  return <TechUruguayAdmin />;
}
