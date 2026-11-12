import type { Localized, Text } from "@/i18n/config";

/* ---------------------------------------------------------------------------
   Expériences professionnelles — de la plus récente à la plus ancienne.
   Pour en ajouter une : copier un bloc { ... } et adapter les textes.
--------------------------------------------------------------------------- */
export type Experience = {
  id: string;
  role: Localized;
  company: string;
  location: Localized;
  period: Localized;
  duration: Localized;
  context: Localized;
  /** Chiffre clé mis en avant en haut de la fiche (facultatif). */
  metric?: { before: Localized; after: Localized; caption: Localized };
  missions: Localized[];
  stack: Text[];
  stackNote?: Localized;
};

export const experiences: Experience[] = [
  {
    id: "arthur-loyd",
    role: {
      fr: "Développeur data et logiciel — projet industriel ORYEM",
      en: "Data and software developer — ORYEM industrial project",
    },
    company: "Arthur Loyd",
    location: { fr: "Valence", en: "Valence, France" },
    period: { fr: "Janv. 2026 – Juin 2026", en: "Jan 2026 – June 2026" },
    duration: { fr: "6 mois", en: "6 months" },
    context: {
      fr: "Équipe de 3 élèves-ingénieurs, pour le directeur des agences de Valence et d'Avignon.",
      en: "Team of 3 engineering students, working for the director of the Valence and Avignon agencies.",
    },
    metric: {
      before: { fr: "1,5 jour", en: "1.5 days" },
      after: { fr: "< 1 heure", en: "< 1 hour" },
      caption: {
        fr: "pour produire un avis de valeur immobilier",
        en: "to produce a property valuation report",
      },
    },
    missions: [
      {
        fr: "Plateforme web qui réduit la production d'un avis de valeur immobilier de 1,5 jour à moins d'une heure, déployée en production sur Scalingo.",
        en: "Web platform that cuts the production of a property valuation report from 1.5 days to under an hour, deployed in production on Scalingo.",
      },
      {
        fr: "Conception et développement du module d'analyse de marché et du module de comparaison de biens, du recueil du besoin à l'implémentation.",
        en: "Designed and built the market analysis module and the property comparison module, from requirements gathering to implementation.",
      },
      {
        fr: "Chaîne d'import des données DVF et des fichiers des agences, avec contrôles qualité automatisés : formats, doublons, valeurs aberrantes (prix, surfaces, coordonnées hors périmètre).",
        en: "Import pipeline for DVF data (French open data on property sales) and agency files, with automated quality checks: formats, duplicates, outliers (prices, surface areas, out-of-area coordinates).",
      },
      {
        fr: "Conteneurisation Docker, maquettage des interfaces et correction de bugs à partir des retours utilisateurs.",
        en: "Docker containerisation, interface mock-ups and bug fixes based on user feedback.",
      },
      {
        fr: "Méthode Agile : réunions quotidiennes, point hebdomadaire avec le client, suivi des tâches sur GitHub Projects.",
        en: "Agile method: daily stand-ups, weekly review with the client, task tracking on GitHub Projects.",
      },
    ],
    stack: [
      "Python",
      "FastAPI",
      "React",
      "TypeScript",
      "PostgreSQL / PostGIS",
      "Docker",
      "Scalingo",
      "Git",
    ],
    stackNote: {
      fr: "Développement assisté par IA avec Claude Code",
      en: "AI-assisted development with Claude Code",
    },
  },
  {
    id: "dxc",
    role: { fr: "Stagiaire data", en: "Data intern" },
    company: "DXC Technology",
    location: { fr: "Courbevoie", en: "Courbevoie, France" },
    period: { fr: "Juil. 2025 – Août 2025", en: "July 2025 – Aug 2025" },
    duration: { fr: "2 mois", en: "2 months" },
    context: {
      fr: "Stage technicien au sein de l'équipe data.",
      en: "Technician internship within the data team.",
    },
    missions: [
      {
        fr: "Conception de l'architecture fonctionnelle d'une application de détection de jeunes talents du rugby via les réseaux sociaux, avec un data engineer et un data architect ; schéma validé par l'équipe data.",
        en: "Designed the functional architecture of an application that spots young rugby talent through social media, working with a data engineer and a data architect; diagram validated by the data team.",
      },
      {
        fr: "Tests de collecte de données en Python (Instaloader, API Meta / Instagram Graph, gestion des access tokens) et documentation des limites techniques.",
        en: "Data collection tests in Python (Instaloader, Meta / Instagram Graph API, access token management) and documentation of the technical limits.",
      },
      {
        fr: "Analyse des contraintes RGPD et des conditions d'utilisation de Meta ; choix d'indicateurs d'engagement exploitables légalement.",
        en: "Analysis of GDPR constraints and Meta's terms of use; selection of engagement metrics that can lawfully be used.",
      },
    ],
    stack: [
      "Python",
      { fr: "API REST", en: "REST APIs" },
      { fr: "Plateformes cloud", en: "Cloud platforms" },
      "Draw.io",
    ],
  },
];
