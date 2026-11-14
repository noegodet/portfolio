import type { Locale, Section } from "@/i18n/config";

/* ---------------------------------------------------------------------------
   Libellés d'interface (navigation, titres de section, boutons, terminal).
   Le contenu « métier » est dans profile.ts, experiences.ts, association.ts
   et projects.ts.
--------------------------------------------------------------------------- */
const fr = {
  meta: {
    siteTitle: "Noé Godet — Élève-ingénieur data, IA et développement",
    description:
      "Portfolio de Noé Godet, élève-ingénieur à Grenoble INP - Esisar. Recherche un stage de fin d'études de 6 mois en data, IA ou développement à partir de février 2027.",
  },
  nav: {
    label: "Navigation principale",
    home: "Accueil",
    experience: "Expériences",
    association: "Vie associative",
    projects: "Projets",
    skipToContent: "Aller au contenu",
    switchLang: "Read this site in English",
    openTerminal: "Ouvrir le terminal",
  } satisfies Record<Section, string> & Record<string, string>,
  home: {
    command: "whoami",
    portraitAlt: "Portrait de Noé Godet",
    downloadCv: "Télécharger mon CV",
    cvSoon: "CV bientôt disponible",
    email: "E-mail",
    skillsCommand: "skills --list",
    skillsTitle: "Compétences",
    educationCommand: "education --timeline",
    educationTitle: "Formation",
    current: "en cours",
    nextCommand: "cd experience",
    nextLabel: "Voir mes expériences",
  },
  experience: {
    command: "experience --all",
    title: "Expériences professionnelles",
    intro:
      "Deux expériences en entreprise : un projet industriel de six mois mené jusqu'à la mise en production, et un stage au sein d'une équipe data.",
    missions: "Missions",
    stack: "Environnement",
    nextCommand: "cd association",
    nextLabel: "Voir ma vie associative",
  },
  association: {
    command: "association --roadmap",
    title: "Vie associative",
    intro:
      "Une année de présidence du bureau des élèves, et les événements qui l'ont jalonnée.",
    also: "Également",
    roadmapTitle: "Roadmap des événements",
    draft: "Texte provisoire — à compléter",
    photos: "Photos",
    credit: "Photos du Challenge : Le Chauve",
    nextCommand: "cd projects",
    nextLabel: "Voir mes projets",
  },
  projects: {
    command: "projects --status",
    title: "Projets",
    intro: "Projets de recherche et projets personnels, en cours ou à venir.",
    emptyTitle: "Projets en cours de développement",
    emptyBody:
      "Plusieurs projets sont en chantier. Ils seront présentés ici dès qu'ils seront montrables — en attendant, mon GitHub donne un aperçu du travail en cours.",
    emptyLog: ["analyse du dépôt…", "compilation des projets…", "publication : bientôt"],
    githubCta: "Voir mon GitHub",
    status: { "in-progress": "en cours", shipped: "livré", paused: "en pause" },
    repo: "Code source",
    demo: "Démo",
  },
  gallery: {
    open: "Agrandir la photo",
    close: "Fermer",
    previous: "Photo précédente",
    next: "Photo suivante",
    credit: "Photo",
  },
  footer: {
    builtWith: "Conçu et développé avec l'aide de Claude Code",
    stack: "Next.js · TypeScript · Tailwind CSS",
  },
  terminal: {
    title: "terminal",
    placeholder: "tape une commande, ex. help",
    inputLabel: "Commande",
    hint: "Entrée pour valider · Tab pour compléter · Échap pour fermer",
    welcome: "Bienvenue. Tape une commande ou clique sur une suggestion.",
    suggestions: "Suggestions",
    unknown: "Commande inconnue",
    tryHelp: "tape help pour la liste des commandes",
    opening: "Ouverture de",
    cvOpening: "Ouverture du CV…",
    cvMissing: "Le CV n'est pas encore disponible au téléchargement.",
    langUsage: "Usage : lang fr | lang en",
    langSwitch: "Changement de langue…",
    help: {
      help: "affiche cette aide",
      whoami: "qui suis-je, en trois lignes",
      skills: "liste mes compétences",
      home: "ouvre l'accueil",
      experience: "ouvre mes expériences",
      asso: "ouvre ma vie associative",
      projects: "ouvre mes projets",
      contact: "affiche mes coordonnées",
      cv: "télécharge mon CV",
      lang: "change la langue (fr | en)",
      clear: "efface l'écran",
      exit: "ferme le terminal",
    },
  },
  notFound: {
    title: "Page introuvable",
    body: "Cette adresse ne correspond à aucune page du site.",
    back: "Retour à l'accueil",
  },
};

const en: typeof fr = {
  meta: {
    siteTitle: "Noé Godet — Engineering student in data, AI and software development",
    description:
      "Portfolio of Noé Godet, engineering student at Grenoble INP - Esisar. Looking for a 6-month final-year internship in data, AI or software development from February 2027.",
  },
  nav: {
    label: "Main navigation",
    home: "Home",
    experience: "Experience",
    association: "Student life",
    projects: "Projects",
    skipToContent: "Skip to content",
    switchLang: "Lire ce site en français",
    openTerminal: "Open the terminal",
  },
  home: {
    command: "whoami",
    portraitAlt: "Portrait of Noé Godet",
    downloadCv: "Download my CV",
    cvSoon: "CV available soon",
    email: "Email",
    skillsCommand: "skills --list",
    skillsTitle: "Skills",
    educationCommand: "education --timeline",
    educationTitle: "Education",
    current: "ongoing",
    nextCommand: "cd experience",
    nextLabel: "See my experience",
  },
  experience: {
    command: "experience --all",
    title: "Professional experience",
    intro:
      "Two roles in industry: a six-month industrial project taken all the way to production, and an internship within a data team.",
    missions: "What I did",
    stack: "Tech stack",
    nextCommand: "cd association",
    nextLabel: "See my student life",
  },
  association: {
    command: "association --roadmap",
    title: "Student life",
    intro: "One year as president of the student union, and the events that marked it.",
    also: "Also",
    roadmapTitle: "Event roadmap",
    draft: "Draft text — to be completed",
    photos: "Photos",
    credit: "Challenge photos: Le Chauve",
    nextCommand: "cd projects",
    nextLabel: "See my projects",
  },
  projects: {
    command: "projects --status",
    title: "Projects",
    intro: "Research and personal projects, ongoing or upcoming.",
    emptyTitle: "Projects in development",
    emptyBody:
      "Several projects are under construction. They will be showcased here as soon as they are ready to show — in the meantime, my GitHub gives a glimpse of the work in progress.",
    emptyLog: ["scanning repository…", "building projects…", "release: coming soon"],
    githubCta: "Visit my GitHub",
    status: { "in-progress": "in progress", shipped: "shipped", paused: "paused" },
    repo: "Source code",
    demo: "Demo",
  },
  gallery: {
    open: "Enlarge photo",
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
    credit: "Photo",
  },
  footer: {
    builtWith: "Designed and built with the help of Claude Code",
    stack: "Next.js · TypeScript · Tailwind CSS",
  },
  terminal: {
    title: "terminal",
    placeholder: "type a command, e.g. help",
    inputLabel: "Command",
    hint: "Enter to run · Tab to complete · Esc to close",
    welcome: "Welcome. Type a command or click a suggestion.",
    suggestions: "Suggestions",
    unknown: "Unknown command",
    tryHelp: "type help for the list of commands",
    opening: "Opening",
    cvOpening: "Opening the CV…",
    cvMissing: "The CV is not available for download yet.",
    langUsage: "Usage: lang fr | lang en",
    langSwitch: "Switching language…",
    help: {
      help: "show this help",
      whoami: "who I am, in three lines",
      skills: "list my skills",
      home: "open the home page",
      experience: "open my experience",
      asso: "open my student life",
      projects: "open my projects",
      contact: "show my contact details",
      cv: "download my CV",
      lang: "switch language (fr | en)",
      clear: "clear the screen",
      exit: "close the terminal",
    },
  },
  notFound: {
    title: "Page not found",
    body: "This address does not match any page of the site.",
    back: "Back to home",
  },
};

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}
