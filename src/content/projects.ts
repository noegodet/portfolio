import type { Localized, Text } from "@/i18n/config";

/* ---------------------------------------------------------------------------
   Projets personnels.

   La liste est vide pour l'instant : la page affiche alors un état
   « en cours de développement ». Pour publier un projet, ajouter un bloc dans
   `projects` en suivant le modèle ci-dessous — la grille se met à jour seule.

   {
     id: "mon-projet",
     title: "Nom du projet",
     summary: { fr: "Ce que fait le projet, en une ou deux phrases.", en: "..." },
     status: "in-progress",          // "in-progress" | "shipped" | "paused"
     stack: ["Python", "PyTorch"],
     repo: "https://github.com/noegodet/mon-projet",   // facultatif
     demo: "https://...",                               // facultatif
   },
--------------------------------------------------------------------------- */
export type ProjectStatus = "in-progress" | "shipped" | "paused";

export type Project = {
  id: string;
  title: Text;
  summary: Localized;
  status: ProjectStatus;
  stack: Text[];
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [];
