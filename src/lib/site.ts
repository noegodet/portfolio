import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

/**
 * Adresse publique du site, utilisée pour les balises SEO (adresse canonique,
 * versions linguistiques, aperçu de partage).
 *
 * Tant que le site n'est pas en ligne, elle est inconnue et ces balises ne
 * sont pas émises. Le jour de la mise en ligne :
 *   - sur Vercel, elle est détectée automatiquement ;
 *   - ailleurs, définir la variable d'environnement NEXT_PUBLIC_SITE_URL
 *     (ex. https://noegodet.fr).
 */
export const siteUrl: URL | undefined = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const value = explicit ?? (vercel ? `https://${vercel}` : undefined);
  return value ? new URL(value) : undefined;
})();

/** Balises « canonique » et « autres langues » d'une page (`path` sans la langue, ex. "/experience"). */
export function alternatesFor(lang: Locale, path = ""): Metadata["alternates"] {
  if (!siteUrl) return undefined;
  return {
    canonical: `/${lang}${path}`,
    languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}${path}`])),
  };
}
