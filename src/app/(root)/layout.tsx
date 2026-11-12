import type { Metadata } from "next";
import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import "../globals.css";

export const metadata: Metadata = { title: profile.name };

/** Layout minimal de la racine `/`, qui ne sert qu'à rediriger vers /fr ou /en. */
export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-full items-center justify-center font-mono">{children}</body>
    </html>
  );
}
