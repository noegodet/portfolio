import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";
import { fontClasses } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Page introuvable · Page not found",
};

/**
 * Page 404 servie pour toute adresse qui ne correspond à aucune page
 * (ex. /fr/inconnu). Elle ne passe pas par le layout du site : elle doit donc
 * fournir elle-même le document complet, les styles et les polices.
 */
export default function GlobalNotFound() {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${fontClasses} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NotFoundContent />
      </body>
    </html>
  );
}
