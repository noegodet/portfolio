import { existsSync } from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";

/**
 * Adresse du CV téléchargeable, ou `null` s'il n'a pas encore été déposé.
 *
 * Il suffit de placer le PDF (sans numéro de téléphone) dans `public/cv/` :
 *   - public/cv/cv-noe-godet-fr.pdf  → version française
 *   - public/cv/cv-noe-godet-en.pdf  → version anglaise (facultative)
 * Le bouton « Télécharger mon CV » s'active alors tout seul. Sans version
 * anglaise, le site anglais propose la version française.
 */
export function getCvHref(lang: Locale): string | null {
  const candidates = [`cv-noe-godet-${lang}.pdf`, "cv-noe-godet-fr.pdf"];
  const found = candidates.find((file) =>
    existsSync(path.join(process.cwd(), "public", "cv", file)),
  );
  return found ? `/cv/${found}` : null;
}
