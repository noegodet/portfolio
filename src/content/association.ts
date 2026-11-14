import type { StaticImageData } from "next/image";
import type { Localized } from "@/i18n/config";
import anniversaryGroup from "@/assets/asso/30-ans-group.webp";
import anniversaryPresidents from "@/assets/asso/30-ans-presidents.webp";
import bdeTeam from "@/assets/asso/bde-team.webp";
import challengeCrowd from "@/assets/asso/challenge-2026-crowd.webp";
import challengeCup from "@/assets/asso/challenge-2026-cup.webp";
import challengeParade from "@/assets/asso/challenge-2026-parade.webp";
import challengePodium from "@/assets/asso/challenge-2026-podium.webp";
import galaTeam from "@/assets/asso/gala-2025-team.webp";

/* ---------------------------------------------------------------------------
   Vie associative — présidence du BDE et roadmap des événements.

   Pour ajouter un événement : copier un bloc de `events`, adapter les textes,
   et le placer à la bonne position (ordre chronologique).
   Pour ajouter une photo : la déposer dans sources/, l'ajouter à
   scripts/optimize-images.mjs, lancer `npm run images`, puis l'importer ici.

   Un texte encore provisoire peut être signalé par `draft: true` : il
   s'affiche alors avec une étiquette « à compléter » sur le site.
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
  /** Points clés à lister sous le texte (facultatif, peut rester vide). */
  highlights: Localized[];
  photos: Photo[];
  draft?: boolean;
};

export const mandate: {
  role: Localized;
  school: string;
  period: Localized;
  body: Localized;
  draft?: boolean;
  photo: Photo;
  also: Localized[];
} = {
  role: { fr: "Président du Cercle (BDE)", en: "President of the Cercle (Student Union)" },
  school: "Grenoble INP - Esisar",
  period: { fr: "Mai 2025 – Mai 2026", en: "May 2025 – May 2026" },
  body: {
    fr: "Une année de Cercle, c’est palpitant : des défis, des rencontres, des projets et des souvenirs pour la vie. À la tête d’une équipe de 13 personnes, j’ai fait vivre l’association pour les 500 étudiants de l’école, avec un budget de plus de 100 000 €. J’ai aussi représenté l’Esisar dans la vie associative valentinoise, aux côtés des autres BDE et de l’AVE. Ma plus grande fierté restera d'avoir ramené la Coupe du Challenge de l’étudiant à l’école, la victoire d’une équipe soudée et investie. Cette année m’a appris à fédérer et à prendre des responsabilités, et m’a donné envie de piloter à terme des équipes et des projets tech.",
    en: "A year leading the Cercle is a thrill: challenges, new people, projects and memories for life. Heading a team of 13, I kept the association running for the school’s 500 students, on a budget of over €100,000. I also represented Esisar in Valence’s student community, alongside the other student unions and the AVE. My proudest achievement is bringing the Challenge de l’étudiant cup back to the school, a win for a close-knit, committed team. This year taught me to bring people together and take on responsibility, and made me want to lead tech teams and projects in the long run.",
  },
  photo: {
    src: bdeTeam,
    alt: {
      fr: "L'équipe du BDE de l'Esisar, en veste violette.",
      en: "The Esisar student union team in their purple jackets.",
    },
  },
  /** Autres engagements, repris du CV. */
  also: [
    { fr: "Délégué de classe", en: "Class representative" },
    { fr: "Membre actif du bureau des sports", en: "Active member of the sports committee" },
  ],
};

const leChauve = "Le Chauve";

export const events: AssoEvent[] = [
  {
    id: "gala-2025",
    date: { fr: "Mai 2025", en: "May 2025" },
    title: { fr: "Gala de l'Esisar 2025", en: "Esisar Gala 2025" },
    body: {
      fr: "Organisateur et responsable du gala annuel, j'ai coordonné une soirée pour 180 étudiants et professeurs avec un budget d'environ 5 000 €. Après avoir obtenu l'accord de la direction pour l'organiser à l'école, j'ai géré tous les prestataires : traiteur local, agents de sécurité SSIAP et groupe de musique de l'école. J'ai appris à tenir un budget, un planning et mes engagements envers chaque partenaire.",
      en: "As lead organiser of the annual gala, I coordinated an evening for 180 students and professors on a budget of around €5,000. After getting approval from school management to host it on campus, I managed every supplier: a local caterer, certified SSIAP security staff and the school's band. It taught me how to keep to a budget and a schedule, and how to deliver on my commitments to each partner.",
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
  },
  {
    id: "30-ans-2025",
    date: { fr: "24 octobre 2025", en: "24 October 2025" },
    title: { fr: "Les 30 ans du BDE", en: "Student Union 30th Anniversary" },
    body: {
      fr: "Pour les 30 ans de l'association, j'ai voulu réunir celles et ceux qui l'ont fait vivre depuis sa création. J'ai retrouvé et invité plus de 200 anciens présidents et membres des bureaux successifs, et 80 d'entre eux ont répondu présent. Cette soirée a relié plusieurs générations d'Esisariens et aura été source de souvenirs et de partage émouvant.",
      en: "For the association's 30th anniversary, I wanted to bring together the people who had kept it alive since it was founded. I tracked down and invited more than 200 former presidents and board members, and 80 of them came. The evening connected several generations of Esisar students and was a source of memories and moving moments shared together.",
    },
    highlights: [],
    photos: [
      {
        src: anniversaryGroup,
        alt: {
          fr: "Photo de groupe des anciens et des membres actuels du BDE aux 30 ans de l'association, avec la mascotte pieuvre violette.",
          en: "Group photo of former and current student union members at the association's 30th anniversary, with the purple octopus mascot.",
        },
      },
      {
        src: anniversaryPresidents,
        alt: {
          fr: "Les présidents successifs du BDE réunis sur scène devant le visuel « 30 ans ».",
          en: "The student union's successive presidents together on stage in front of the “30 ans” artwork.",
        },
      },
    ],
  },
  {
    id: "challenge-2026",
    date: { fr: "Mars 2026", en: "March 2026" },
    title: { fr: "36ᵉ Challenge de l'étudiant", en: "36th Challenge de l'étudiant" },
    body: {
      fr: "Organisé chaque année à Valence par l'Association Valentinoise des Étudiants (AVE), le Challenge de l'étudiant est l'une des plus grandes compétitions inter-écoles : 17 écoles et plus de 3 000 étudiants. J'ai dirigé toute la préparation côté Esisar : communication, merch sur le thème « Clash of Clans », construction du char, du bar et des drapeaux, et coordination logistique avec l'AVE (escorte policière des chars, entre autres). Résultat : l'Esisar termine première au classement général et remporte la coupe du Challenge.",
      en: "Held every year in Valence by the Association Valentinoise des Étudiants (AVE), the Challenge de l'étudiant is one of the largest inter-school competitions, with 17 schools and over 3,000 students. I led Esisar's entire preparation: communication, Clash of Clans-themed merchandise, building the school's float, bar and flags, and logistics coordination with the AVE (including police escorts for the floats). The result: Esisar finished first overall and won the Challenge cup.",
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
          fr: "La délégation de l'Esisar costumée (casques à cornes et épées) sur les marches d'un théâtre.",
          en: "The Esisar delegation in costume (horned helmets and swords) on the steps of a theatre.",
        },
        credit: leChauve,
      },
    ],
  },
];
