// Convertit les fichiers d'origine (dossier sources/, non versionné) en images
// légères pour le site. À relancer avec `npm run images` après avoir ajouté
// ou remplacé une photo dans sources/.
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const src = (...p) => path.join(root, "sources", ...p);
const out = (...p) => path.join(root, "src", "assets", ...p);

/** Photos : redimensionnées et converties en WebP. */
const photos = [
  { from: src("Photo Noé Godet sans fond.png"), to: out("portrait.webp"), width: 900, quality: 88 },
  { from: src("Vie Associative", "Photo de l'équipe.jpeg"), to: out("asso", "bde-team.webp") },
  { from: src("Vie Associative", "Photo de l'équipe gala.jpeg"), to: out("asso", "gala-2025-team.webp") },
  { from: src("Vie Associative", "30ans_cercle_photo_de_groupe.JPG"), to: out("asso", "30-ans-group.webp") },
  { from: src("Vie Associative", "30ans_cercle_photo_des_présidents.JPG"), to: out("asso", "30-ans-presidents.webp") },
  { from: src("Vie Associative", "Photo de groupe 1 challenge.jpeg"), to: out("asso", "challenge-2026-parade.webp") },
  { from: src("Vie Associative", "Photo de groupe grande Challenge.jpeg"), to: out("asso", "challenge-2026-crowd.webp") },
  { from: src("Vie Associative", "Photo de Groupe 2 Challenge.jpeg"), to: out("asso", "challenge-2026-podium.webp") },
  { from: src("Vie Associative", "Coupe Challenge.jpeg"), to: out("asso", "challenge-2026-cup.webp") },
];

/**
 * Logos : convertis en version monochrome claire pour le fond sombre.
 * Les zones sombres du logo deviennent du blanc opaque, les zones claires
 * (dont un éventuel fond blanc) deviennent transparentes. `gain` renforce
 * l'opacité des logos dessinés en gris ou en couleur moyenne.
 */
const logos = [
  { from: src("Logo éducation", "Grenoble INP - Esisar (couleur, RVB, 120px).png"), to: out("logos", "esisar.png"), gain: 1.5 },
  { from: src("Logo éducation", "condorcet.png"), to: out("logos", "condorcet.png"), gain: 1.7, height: 240 },
  { from: src("Logo éducation", "upb_logo.png"), to: out("logos", "upb.png"), gain: 1.35, height: 320 },
];

async function convertPhoto({ from, to, width = 1600, quality = 80 }) {
  await mkdir(path.dirname(to), { recursive: true });
  await sharp(from)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(to);
}

async function convertLogo({ from, to, gain = 1.35, height }) {
  await mkdir(path.dirname(to), { recursive: true });
  let image = sharp(from).ensureAlpha();
  if (height) image = image.resize({ height, withoutEnlargement: true });
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const alpha = Math.round(a * Math.min(1, (1 - luminance) * gain));
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = alpha;
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(to);
}

let missing = 0;
for (const job of [...photos.map((p) => [convertPhoto, p]), ...logos.map((l) => [convertLogo, l])]) {
  const [run, item] = job;
  const label = path.relative(root, item.to);
  if (!existsSync(item.from)) {
    console.warn(`absent  ${path.relative(root, item.from)}`);
    missing++;
    continue;
  }
  await run(item);
  const meta = await sharp(item.to).metadata();
  console.log(`ok      ${label}  ${meta.width}x${meta.height}`);
}
if (missing) console.warn(`\n${missing} fichier(s) source manquant(s).`);
