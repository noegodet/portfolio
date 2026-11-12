import type { StaticImageData } from "next/image";
import type { Localized, Text } from "@/i18n/config";
import condorcetLogo from "@/assets/logos/condorcet.png";
import esisarLogo from "@/assets/logos/esisar.png";
import upbLogo from "@/assets/logos/upb.png";

/* ---------------------------------------------------------------------------
   Identité, statut et liens — affichés sur la page d'accueil, dans le pied de
   page et dans le terminal. Pour modifier un texte : changer `fr` et `en`.
--------------------------------------------------------------------------- */
export const profile = {
  name: "Noé Godet",
  role: {
    fr: "Élève-ingénieur en data, IA et développement",
    en: "Engineering student in data, AI and software development",
  },
  status: {
    fr: "Recherche un stage de fin d'études",
    en: "Looking for a final-year internship",
  },
  statusDetail: {
    fr: "6 mois · à partir de février 2027",
    en: "6 months · from February 2027",
  },
  summary: {
    fr: "En 3ᵉ année de cycle ingénieur à Grenoble INP - Esisar, actuellement en semestre Erasmus+ à l'Université Politehnica de Bucarest, centré sur l'intelligence artificielle et le big data. Six mois de projet industriel pour Arthur Loyd : une plateforme d'estimation immobilière et sa chaîne de traitement de données, déployées en production.",
    en: "Third-year engineering student at Grenoble INP - Esisar, currently on an Erasmus+ semester at Politehnica University of Bucharest focused on artificial intelligence and big data. Six months of industrial project work for Arthur Loyd: a property valuation platform and its data pipeline, deployed in production.",
  },
  facts: [
    {
      label: { fr: "année en cours", en: "current year" },
      value: {
        fr: "3ᵉ année de cycle ingénieur",
        en: "3rd year of the engineering degree",
      },
      detail: { fr: "Grenoble INP - Esisar", en: "Grenoble INP - Esisar" },
    },
    {
      label: { fr: "en ce moment", en: "right now" },
      value: { fr: "Semestre Erasmus+ à Bucarest", en: "Erasmus+ semester in Bucharest" },
      detail: {
        fr: "IA et big data · sept. 2026 – févr. 2027",
        en: "AI and big data · Sept 2026 – Feb 2027",
      },
    },
    {
      label: { fr: "disponibilité", en: "availability" },
      value: { fr: "Stage de fin d'études, 6 mois", en: "Final-year internship, 6 months" },
      detail: {
        fr: "Data, IA ou développement · dès février 2027",
        en: "Data, AI or development · from February 2027",
      },
    },
  ] satisfies { label: Localized; value: Localized; detail: Localized }[],
  links: {
    email: "noegodet@gmail.com",
    linkedin: "https://www.linkedin.com/in/noegodet/",
    github: "https://github.com/noegodet",
  },
} as const;

/* ---------------------------------------------------------------------------
   Compétences — une carte par catégorie. `highlight` met la carte en avant,
   `wide` lui donne une double largeur (la grille compte 4 colonnes).
--------------------------------------------------------------------------- */
export type SkillGroup = {
  title: Localized;
  items: Text[];
  note?: Localized;
  highlight?: boolean;
  wide?: boolean;
};

export const skills: SkillGroup[] = [
  {
    title: { fr: "Développement assisté par IA", en: "AI-assisted development" },
    items: ["Claude Code"],
    note: {
      fr: "Utilisé pour construire et livrer la plateforme Arthur Loyd — et ce site.",
      en: "Used to build and ship the Arthur Loyd platform — and this website.",
    },
    highlight: true,
    wide: true,
  },
  {
    title: { fr: "IA et data", en: "AI and data" },
    wide: true,
    items: [
      "PyTorch",
      "OpenCV",
      { fr: "Réseaux de neurones", en: "Neural networks" },
      { fr: "Vision par ordinateur", en: "Computer vision" },
      "Big data",
      { fr: "Contrôle qualité de données", en: "Data quality control" },
    ],
  },
  {
    title: { fr: "Langages", en: "Programming languages" },
    items: ["Python", "SQL", "R", "C", "Java", "MATLAB"],
  },
  {
    title: { fr: "Bases de données et API", en: "Databases and APIs" },
    items: ["PostgreSQL / PostGIS", { fr: "API REST", en: "REST APIs" }],
  },
  {
    title: { fr: "DevOps et cloud", en: "DevOps and cloud" },
    items: ["Docker", "Git / GitHub", "Scalingo", "Linux"],
  },
  {
    title: { fr: "Systèmes embarqués", en: "Embedded systems" },
    items: ["RISC-V", "VHDL"],
  },
  {
    title: { fr: "Méthodes", en: "Methods" },
    wide: true,
    items: [
      "Agile (GitHub Projects)",
      { fr: "Relation client", en: "Client relations" },
      { fr: "Recette fonctionnelle", en: "Functional acceptance testing" },
    ],
  },
  {
    title: { fr: "Langues", en: "Languages" },
    wide: true,
    items: [
      { fr: "Français — langue maternelle", en: "French — native" },
      { fr: "Anglais B2+ — TOEIC 850/990 (2026)", en: "English B2+ — TOEIC 850/990 (2026)" },
    ],
  },
];

/* ---------------------------------------------------------------------------
   Formation — de la plus récente à la plus ancienne.
--------------------------------------------------------------------------- */
export type School = {
  logo: StaticImageData;
  school: string;
  city: Localized;
  title: Localized;
  period: Localized;
  description?: Localized;
  current?: boolean;
};

export const education: School[] = [
  {
    logo: upbLogo,
    school: "Universitatea Politehnica din București",
    city: { fr: "Bucarest, Roumanie", en: "Bucharest, Romania" },
    title: { fr: "Semestre Erasmus+ en IA et data", en: "Erasmus+ semester in AI and data" },
    period: { fr: "Sept. 2026 – Févr. 2027", en: "Sept 2026 – Feb 2027" },
    description: {
      fr: "Cours en anglais : réseaux de neurones, vision par ordinateur, représentation des connaissances et raisonnement, analyse de big data. Travaux pratiques en PyTorch et OpenCV.",
      en: "Courses taught in English: neural networks, computer vision, knowledge representation and reasoning, big data analytics. Lab work in PyTorch and OpenCV.",
    },
    current: true,
  },
  {
    logo: esisarLogo,
    school: "Grenoble INP - Esisar",
    city: { fr: "Valence, France", en: "Valence, France" },
    title: { fr: "Diplôme d'ingénieur", en: "Engineering degree (Diplôme d'ingénieur)" },
    period: { fr: "Sept. 2024 – Sept. 2027", en: "Sept 2024 – Sept 2027" },
    description: {
      fr: "Cursus en informatique, réseaux et systèmes embarqués.",
      en: "Curriculum in computer science, networks and embedded systems.",
    },
  },
  {
    logo: condorcetLogo,
    school: "Lycée Condorcet",
    city: { fr: "Paris, France", en: "Paris, France" },
    title: {
      fr: "Classe préparatoire aux grandes écoles",
      en: "Preparatory classes for the grandes écoles",
    },
    period: { fr: "Sept. 2021 – Juin 2024", en: "Sept 2021 – June 2024" },
    description: {
      fr: "Filière physique-chimie.",
      en: "Physics and chemistry track.",
    },
  },
];
