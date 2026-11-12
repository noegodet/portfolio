# Portfolio — Noé Godet

Site personnel bilingue (français / anglais) : accueil, expériences, vie associative, projets.
Construit avec Next.js, TypeScript et Tailwind CSS.

## Lancer le site sur son ordinateur

```bash
npm install      # une seule fois, après avoir récupéré le projet
npm run dev      # puis ouvrir http://localhost:3000
```

Le site se recharge tout seul à chaque fichier enregistré.

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le site en local, pour travailler dessus |
| `npm run build` | Vérifie tout le projet et génère la version de production |
| `npm run lint` | Signale les erreurs de code |
| `npm run images` | Régénère les images du site à partir du dossier `sources/` |

## Modifier le contenu

Tous les textes sont dans `src/content/`, chacun en français (`fr`) et en anglais (`en`).
Aucun autre fichier n'est à toucher pour changer un texte.

| Fichier | Contenu |
|---|---|
| `profile.ts` | Identité, statut, liens, compétences, formation |
| `experiences.ts` | Expériences professionnelles |
| `association.ts` | Présidence du BDE et roadmap des événements |
| `projects.ts` | Projets personnels (un modèle à copier est en tête du fichier) |
| `ui.ts` | Libellés de l'interface : menus, boutons, titres, terminal |

Les textes marqués `draft: true` s'affichent avec une étiquette « à compléter ».
Une fois le texte définitif écrit, supprimer la ligne `draft: true`.

## Ajouter le CV téléchargeable

Déposer le PDF **sans numéro de téléphone** dans `public/cv/` sous le nom `cv-noe-godet-fr.pdf`
(et, si elle existe, la version anglaise sous `cv-noe-godet-en.pdf`).
Le bouton « Télécharger mon CV » s'active alors automatiquement.

## Ajouter ou remplacer une photo

1. Déposer la photo d'origine dans `sources/`.
2. L'ajouter à la liste en haut de `scripts/optimize-images.mjs`.
3. Lancer `npm run images`.
4. L'importer dans le fichier de contenu concerné (voir les exemples dans `association.ts`).

## Données personnelles

Le dossier `sources/` contient les fichiers d'origine, dont le CV avec le numéro de téléphone.
Il est exclu de git (`.gitignore`) et ne doit jamais être publié.

## Mise en ligne

Pas encore faite. Le site est compatible avec Vercel sans réglage.
Sur un autre hébergeur, définir la variable d'environnement `NEXT_PUBLIC_SITE_URL`
avec l'adresse publique du site (ex. `https://noegodet.fr`) pour activer les balises SEO.
