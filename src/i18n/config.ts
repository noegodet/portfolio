export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Un texte disponible dans chaque langue du site. */
export type Localized = Record<Locale, string>;

/** Un texte identique dans toutes les langues (nom propre, techno…) ou traduit. */
export type Text = string | Localized;

/**
 * Renvoie le texte dans la langue demandée, tel qu'écrit dans le contenu.
 * Il peut contenir des nombres entre accolades (ex. "TOEIC {850}/990") : ce
 * sont les chiffres à animer à l'écran — voir `Counted` dans Effects.tsx.
 */
export function raw(text: Text, lang: Locale): string {
  return typeof text === "string" ? text : text[lang];
}

/** Renvoie le texte dans la langue demandée, sans les accolades des chiffres animés. */
export function tr(text: Text, lang: Locale): string {
  return raw(text, lang).replace(/[{}]/g, "");
}

/** Sections du site, dans l'ordre des onglets. Le chemin est le même dans les deux langues. */
export const sections = ["home", "experience", "association", "projects"] as const;

export type Section = (typeof sections)[number];

/** Section correspondant à une adresse (`/fr/experience` → "experience"). */
export function sectionFromPath(pathname: string): Section {
  const segment = pathname.split("/")[2] ?? "";
  return (sections as readonly string[]).includes(segment) ? (segment as Section) : "home";
}

/**
 * Sens de la transition entre deux onglets : vers un onglet situé plus à
 * droite, la page glisse vers l'avant ; vers la gauche, elle revient en arrière.
 */
export function navDirection(from: Section | null, to: Section): string[] {
  if (from === null || from === to) return [];
  return [sections.indexOf(to) > sections.indexOf(from) ? "nav-forward" : "nav-back"];
}

export function sectionPath(section: Section, lang: Locale): string {
  return section === "home" ? `/${lang}` : `/${lang}/${section}`;
}
