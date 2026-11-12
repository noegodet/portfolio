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

/** Renvoie le texte dans la langue demandée. */
export function tr(text: Text, lang: Locale): string {
  return typeof text === "string" ? text : text[lang];
}

/** Sections du site, dans l'ordre des onglets. Le chemin est le même dans les deux langues. */
export const sections = ["home", "experience", "association", "projects"] as const;

export type Section = (typeof sections)[number];

export function sectionPath(section: Section, lang: Locale): string {
  return section === "home" ? `/${lang}` : `/${lang}/${section}`;
}
