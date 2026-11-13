import type { Localized, Text } from "@/i18n/config";

/* ---------------------------------------------------------------------------
   Projets (de recherche ou personnels).

   Pour publier un projet, ajouter un bloc dans `projects` en suivant le
   modèle ci-dessous — la page se met à jour seule. Si la liste est vide, la
   page affiche un état « en cours de développement ».

   {
     id: "mon-projet",
     title: "Nom du projet",
     context: { fr: "Cadre et dates du projet.", en: "..." },   // facultatif
     summary: { fr: "Ce que fait le projet, en quelques phrases.", en: "..." },
     status: "in-progress",          // "in-progress" | "shipped" | "paused"
     stack: ["Python", "PyTorch"],   // laisser [] tant qu'elle n'est pas définie
     repo: "https://github.com/noegodet/mon-projet",   // facultatif
     demo: "https://...",                               // facultatif
   },
--------------------------------------------------------------------------- */
export type ProjectStatus = "in-progress" | "shipped" | "paused";

export type Project = {
  id: string;
  title: Text;
  /** Cadre du projet : type, établissement, dates. */
  context?: Localized;
  summary: Localized;
  status: ProjectStatus;
  stack: Text[];
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    id: "text-to-sql",
    title: { fr: "Fiabilité du text-to-SQL", en: "Text-to-SQL reliability" },
    context: {
      fr: "Projet de recherche · Université Politehnica de Bucarest (master IA) · sept. 2026 – janv. 2027",
      en: "Research project · Politehnica University of Bucharest (AI master's) · Sept 2026 – Jan 2027",
    },
    summary: {
      fr: "Les modèles de langage savent traduire une question en langage naturel en requête SQL, ce qui permettrait à n'importe qui d'interroger une base de données. Mais une requête peut s'exécuter sans erreur et renvoyer pourtant un résultat faux. Mon projet de recherche porte sur ce problème de fiabilité : mesurer à quel point ces systèmes sont fiables et repérer les cas où ils se trompent. Rapport et soutenance prévus en janvier 2027 ; le code sera publié sur mon GitHub.",
      en: "Language models can now turn a plain-language question into an SQL query, which could let anyone query a database. But a query can run without errors and still return the wrong result. My research project is about this reliability problem: measuring how reliable these systems are and identifying the cases where they get things wrong. Report and presentation are due in January 2027, and the code will be published on my GitHub.",
    },
    status: "in-progress",
    // À compléter quand la stack technique et le dépôt GitHub seront définis.
    stack: [],
  },
];
