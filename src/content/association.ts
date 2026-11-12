import type { StaticImageData } from "next/image";
import type { Localized } from "@/i18n/config";
import bdeTeam from "@/assets/asso/bde-team.webp";
import challengeCrowd from "@/assets/asso/challenge-2026-crowd.webp";
import challengeCup from "@/assets/asso/challenge-2026-cup.webp";
import challengeParade from "@/assets/asso/challenge-2026-parade.webp";
import challengePodium from "@/assets/asso/challenge-2026-podium.webp";
import galaTeam from "@/assets/asso/gala-2025-team.webp";

/* ---------------------------------------------------------------------------
   Vie associative — présidence du BDE et roadmap des événements.

   ⚠ Les textes marqués `draft: true` sont PROVISOIRES : ils s'affichent avec
   une étiquette « à compléter » sur le site. Remplace le texte (fr + en) par
   le vrai contenu, puis supprime la ligne `draft: true`.

   Pour ajouter un événement : copier un bloc de `events`, adapter les textes,
   et le placer à la bonne position (ordre chronologique).
   Pour ajouter une photo : la déposer dans sources/, l'ajouter à
   scripts/optimize-images.mjs, lancer `npm run images`, puis l'importer ici.
--------------------------------------------------------------------------- */
export type Photo = {
  src: StaticImageData;
  alt: Localized;
  /** Crédit du photographe, affiché sous la photo agrandie. */
  credit?: string;
};

export type AssoEvent = {
  id: string;
  date: Localized;
  title: Localized;
  body: Localized;
  /** Points clés du rôle tenu (laisser vide tant qu'ils ne sont pas rédigés). */
  highlights: Localized[];
  photos: Photo[];
  draft?: boolean;
};

export const mandate = {
  role: { fr: "Président du BDE", en: "President of the student union (BDE)" },
  school: "Grenoble INP - Esisar",
  period: { fr: "Mai 2025 – Mai 2026", en: "May 2025 – May 2026" },
  body: {
    fr: "Un an à la tête du bureau des élèves de l'Esisar : organisation d'événements et de rencontres étudiantes. Présentation du mandat à compléter.",
    en: "One year leading the Esisar student union: organising student events and gatherings. Description of the term to be completed.",
  },
  draft: true,
  photo: {
    src: bdeTeam,
    alt: {
      fr: "L'équipe du BDE de l'Esisar, en veste violette.",
      en: "The Esisar student union team in their purple jackets.",
    },
  } satisfies Photo,
  /** Autres engagements, repris du CV. */
  also: [
    { fr: "Délégué de classe", en: "Class representative" },
    { fr: "Membre actif du bureau des sports", en: "Active member of the sports club" },
  ] satisfies Localized[],
};

const leChauve = "Le Chauve";

export const events: AssoEvent[] = [
  {
    id: "gala-2025",
    date: { fr: "Mai 2025", en: "May 2025" },
    title: { fr: "Gala de l'Esisar 2025", en: "Esisar Gala 2025" },
    body: {
      fr: "Organisation du gala annuel de l'école. Présentation de mon rôle à rédiger : préparation, équipe, déroulé de la soirée.",
      en: "Organisation of the school's annual gala. Description of my role to be written: preparation, team, how the evening went.",
    },
    highlights: [],
    photos: [
      {
        src: galaTeam,
        alt: {
          fr: "L'équipe organisatrice en tenue de soirée devant le décor « Gala Esisar 2025 ».",
          en: "The organising team in formal wear in front of the “Gala Esisar 2025” backdrop.",
        },
      },
    ],
    draft: true,
  },
  {
    id: "challenge-2026",
    date: { fr: "Mars 2026", en: "March 2026" },
    title: { fr: "36ᵉ Challenge de l'étudiant", en: "36th Challenge de l'étudiant" },
    body: {
      fr: "36ᵉ édition du Challenge de l'étudiant. Présentation de mon rôle à rédiger : organisation, équipe, participants, résultats.",
      en: "36th edition of the Challenge de l'étudiant. Description of my role to be written: organisation, team, participants, results.",
    },
    highlights: [],
    photos: [
      {
        src: challengePodium,
        alt: {
          fr: "Les étudiants de l'Esisar posent avec la coupe et les trophées du Challenge.",
          en: "Esisar students posing with the Challenge cup and trophies.",
        },
        credit: leChauve,
      },
      {
        src: challengeCup,
        alt: {
          fr: "La coupe du Challenge portée à bout de bras au milieu de la foule et des confettis.",
          en: "The Challenge cup held aloft in the middle of the crowd and confetti.",
        },
        credit: leChauve,
      },
      {
        src: challengeCrowd,
        alt: {
          fr: "Photo de groupe de la délégation de l'Esisar dans le gymnase, bras levés.",
          en: "Group photo of the Esisar delegation in the sports hall, arms raised.",
        },
        credit: leChauve,
      },
      {
        src: challengeParade,
        alt: {
          fr: "La délégation de l'Esisar déguisée en Vikings sur les marches d'un théâtre.",
          en: "The Esisar delegation dressed as Vikings on the steps of a theatre.",
        },
        credit: leChauve,
      },
    ],
    draft: true,
  },
];
