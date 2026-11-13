# Portfolio — Noé Godet

Site personnel de Noé Godet, élève-ingénieur en data, IA et développement à Grenoble INP - Esisar.
**En ligne : [portfolio-noegodet.vercel.app](https://portfolio-noegodet.vercel.app)**

Bilingue (français / anglais), conçu et développé avec l'aide de [Claude Code](https://claude.com/claude-code).

> 🎯 À la recherche d'un stage de fin d'études de 6 mois en data, IA ou développement, à partir de février 2027.

## Aperçu

| Page | Contenu |
|---|---|
| **Accueil** | Présentation, statut, compétences et formation |
| **Expériences** | Projet industriel Arthur Loyd et stage chez DXC Technology |
| **Vie associative** | Présidence du BDE et roadmap des événements (gala, 30 ans du BDE, Challenge de l'étudiant), avec galerie photo |
| **Projets** | Projet de recherche sur la fiabilité du text-to-SQL, et projets à venir |

## Fonctionnalités

- **Terminal interactif** — `Ctrl+K` ouvre une invite de commande pour naviguer dans le site (`help`, `whoami`, `contact`, `lang en`…)
- **Arrière-plan animé** — des impulsions lumineuses circulent sur une trame de points, comme des données dans un pipeline
- **Transitions de page** — glissement directionnel entre les onglets, grâce aux View Transitions natives
- **Animations au défilement** — apparitions en cascade, chiffres qui se comptent, titres « décodés », barre de progression
- **Bilingue** — chaque page existe en français et en anglais
- **Accessible** — navigation au clavier, contrastes conformes AA, animations coupées si le visiteur a activé « réduire les animations »

## Technologies

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, pages générées en statique) |
| Langage | TypeScript |
| Styles | Tailwind CSS 4 |
| Animations | [Motion](https://motion.dev), View Transitions, Canvas |
| Développement | Assisté par IA avec Claude Code |

## Lancer le projet

```bash
npm install      # une seule fois
npm run dev      # puis ouvrir http://localhost:3000
```

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le site en local, avec rechargement automatique |
| `npm run build` | Vérifie le projet et génère la version de production |
| `npm run lint` | Signale les erreurs de code |
| `npm run images` | Régénère les images du site à partir du dossier `sources/` |

## Organisation du code

```
src/
├─ app/          Pages et mise en page (une version par langue : /fr, /en)
├─ components/   Composants : en-tête, terminal, galerie, effets animés
├─ content/      Tous les textes du site, en français et en anglais
├─ i18n/         Langues et sections du site
└─ lib/          Utilitaires (CV, adresse du site)
```

Le contenu est séparé du code : tous les textes se modifient dans `src/content/`, sans toucher aux composants.

<details>
<summary><strong>Guide de mise à jour du contenu</strong></summary>

### Modifier un texte

Chaque texte existe en français (`fr`) et en anglais (`en`) dans `src/content/` :

| Fichier | Contenu |
|---|---|
| `profile.ts` | Identité, statut, liens, compétences, formation |
| `experiences.ts` | Expériences professionnelles |
| `association.ts` | Présidence du BDE et roadmap des événements |
| `projects.ts` | Projets (un modèle à copier est en tête du fichier) |
| `ui.ts` | Libellés de l'interface : menus, boutons, titres, terminal |

- Un texte encore provisoire peut être marqué `draft: true` : il s'affiche alors avec une étiquette « à compléter ».
- Un nombre entre accolades, par exemple `"TOEIC {850}/990"`, s'anime à l'écran.

### Ajouter le CV téléchargeable

Déposer le PDF **sans numéro de téléphone** dans `public/cv/` sous le nom `cv-noe-godet-fr.pdf`
(et, si elle existe, la version anglaise sous `cv-noe-godet-en.pdf`).
Le bouton « Télécharger mon CV » s'active alors automatiquement.

### Ajouter ou remplacer une photo

1. Déposer la photo d'origine dans `sources/`.
2. L'ajouter à la liste en haut de `scripts/optimize-images.mjs`.
3. Lancer `npm run images`.
4. L'importer dans le fichier de contenu concerné (voir les exemples dans `association.ts`).

### Données personnelles

Le dossier `sources/` contient les fichiers d'origine, dont le CV avec le numéro de téléphone.
Il est exclu de git (`.gitignore`) et ne doit jamais être publié.

### Mise en ligne

Le site est hébergé sur Vercel : chaque `git push` sur `main` le met à jour automatiquement.
Sur un autre hébergeur, définir la variable d'environnement `NEXT_PUBLIC_SITE_URL`
avec l'adresse publique du site (ex. `https://noegodet.fr`) pour activer les balises SEO.

</details>

## Contact

- LinkedIn : [linkedin.com/in/noegodet](https://www.linkedin.com/in/noegodet/)
- GitHub : [github.com/noegodet](https://github.com/noegodet)

---

Photos du Challenge de l'étudiant : Le Chauve.
