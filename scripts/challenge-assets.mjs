// Prépare les images du mini-jeu « challenge » à partir des originaux de
// sources/challenge/ (non versionnés) : détourage du fond, recadrage, et
// séparation du bélier pour pouvoir l'animer.
// À relancer avec `npm run challenge-assets` si une image source change.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const src = (name) => path.join(root, "sources", "challenge", name);
const out = (name) => path.join(root, "src", "assets", "challenge", name);

async function load(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Rend transparents les pixels reliés aux bords de l'image qui vérifient `isBackground`. */
function floodClear(img, isBackground, seeds) {
  const { data, width, height } = img;
  const seen = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p]) return;
    seen[p] = 1;
    const i = p * 4;
    if (isBackground(data[i], data[i + 1], data[i + 2], x, y)) stack.push(p);
  };
  for (const [x, y] of seeds ?? borderSeeds(width, height)) push(x, y);
  while (stack.length) {
    const p = stack.pop();
    data[p * 4 + 3] = 0;
    const x = p % width;
    const y = (p - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

function borderSeeds(width, height) {
  const seeds = [];
  for (let x = 0; x < width; x++) seeds.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) seeds.push([0, y], [width - 1, y]);
  return seeds;
}

/** Ne garde que le plus grand groupe de pixels opaques (retire les petits restes isolés). */
function keepLargest(img) {
  const { data, width, height } = img;
  const label = new Int32Array(width * height).fill(-1);
  const sizes = [];
  for (let start = 0; start < width * height; start++) {
    if (label[start] !== -1 || data[start * 4 + 3] === 0) continue;
    const id = sizes.length;
    let size = 0;
    const stack = [start];
    label[start] = id;
    while (stack.length) {
      const p = stack.pop();
      size++;
      const x = p % width;
      const y = (p - x) / width;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const q = ny * width + nx;
        if (label[q] === -1 && data[q * 4 + 3] > 0) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    sizes.push(size);
  }
  const best = sizes.indexOf(Math.max(...sizes));
  for (let p = 0; p < width * height; p++) if (label[p] !== best) data[p * 4 + 3] = 0;
}

/** Copie la zone [x0, x1) × [y0, y1) dans une nouvelle image. */
function crop(img, x0, y0, x1, y1) {
  const width = x1 - x0;
  const height = y1 - y0;
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++)
    img.data.copy(data, y * width * 4, ((y + y0) * img.width + x0) * 4, ((y + y0) * img.width + x1) * 4);
  return { data, width, height };
}

/** Rectangle englobant des pixels opaques. */
function bounds(img) {
  let x0 = img.width, y0 = img.height, x1 = 0, y1 = 0;
  for (let y = 0; y < img.height; y++)
    for (let x = 0; x < img.width; x++)
      if (img.data[(y * img.width + x) * 4 + 3] > 0) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

async function save(img, file, width) {
  let pipeline = sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } });
  if (width && width < img.width) pipeline = pipeline.resize({ width });
  await pipeline.png({ compressionLevel: 9 }).toFile(file);
  const meta = await sharp(file).metadata();
  console.log(`ok      ${path.relative(root, file)}  ${meta.width}x${meta.height}`);
  return meta;
}

const near = (r, g, b, [R, G, B], tolerance) => Math.abs(r - R) + Math.abs(g - G) + Math.abs(b - B) <= tolerance;

await mkdir(path.join(root, "src", "assets", "challenge"), { recursive: true });

/* ---------------------------------------------------------------- Char ---
   Fond gris uni et bande de sol en bas (retirée par recadrage). Le bélier
   (tronc + tête) est découpé dans une image à part, de même taille, pour
   pouvoir rentrer dans le char puis en sortir. Les deux roues sont aussi
   découpées (ellipses mesurées sur l'image source) pour pouvoir tourner. */
const WHEELS = [
  { name: "wheel-big", cx: 212, cy: 577, rx: 140, ry: 139 },
  { name: "wheel-small", cx: 580, cy: 632, rx: 88, ry: 81 },
];
const CUT_Y = 708; // sous cette ligne : la bande de sol de l'image source
const layout = {};
{
  const full = await load(src("char-esisar.png"));
  const img = crop(full, 0, 0, full.width, CUT_Y);
  floodClear(img, (r, g, b) => near(r, g, b, [62, 63, 68], 30));
  keepLargest(img);

  const box = bounds(img);
  const sprite = crop(img, box.x0, box.y0, box.x1, box.y1);

  // Bélier : le tronc à droite du bloc doré, et toute la tête.
  const isRam = (x, y) => {
    const X = x + box.x0;
    const Y = y + box.y0;
    // (le bas du tronc dépasse un peu sous le bloc doré, à droite du plateau)
    return (X >= 682 && Y >= 398 && Y <= 547) || (X >= 745 && Y >= 398 && Y <= 558) || X >= 778;
  };
  const cart = { ...sprite, data: Buffer.from(sprite.data) };
  const ram = { ...sprite, data: Buffer.from(sprite.data) };
  for (let y = 0; y < sprite.height; y++)
    for (let x = 0; x < sprite.width; x++) {
      const i = (y * sprite.width + x) * 4 + 3;
      if (isRam(x, y)) cart.data[i] = 0;
      else ram.data[i] = 0;
    }
  // Prolongement du tronc vers l'arrière, caché derrière le char : quand le
  // bélier frappe, il avance sans jamais laisser voir son extrémité. On répète
  // une tranche du tronc (texture du bois) vers la gauche.
  const LOG_EXTENSION = 300;
  const SLICE_X = 700;
  const SLICE_W = 70;
  for (let Y = 398; Y <= 549; Y++) // hauteur du tronc seul (sans le plateau en dessous)
    for (let X = 682 - LOG_EXTENSION; X < 682; X++) {
      const from = ((Y - box.y0) * sprite.width + (SLICE_X + (((X - SLICE_X) % SLICE_W) + SLICE_W) % SLICE_W - box.x0)) * 4;
      if (sprite.data[from + 3] === 0) continue;
      const to = ((Y - box.y0) * sprite.width + (X - box.x0)) * 4;
      sprite.data.copy(ram.data, to, from, from + 4);
    }

  // Roues : chaque roue devient une image carrée centrée sur son moyeu ; le bas
  // de la roue, coupé avec la bande de sol, est complété par symétrie.
  const scale = 480 / sprite.width;
  layout.cart = {
    width: sprite.width,
    height: sprite.height,
    // Début visible du tronc, et longueur du prolongement caché derrière le char.
    ramLogX: 682 - box.x0,
    ramLogExtension: LOG_EXTENSION,
    wheels: [],
  };
  for (const wheel of WHEELS) {
    const size = 2 * Math.max(wheel.rx, wheel.ry) + 2;
    const half = size / 2;
    const image = { width: size, height: size, data: Buffer.alloc(size * size * 4) };
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const dx = x + 0.5 - half;
        const dy = y + 0.5 - half;
        if ((dx / wheel.rx) ** 2 + (dy / wheel.ry) ** 2 > 1) continue;
        const X = Math.floor(wheel.cx + dx);
        let Y = Math.floor(wheel.cy + dy);
        if (Y >= CUT_Y - 2) Y = Math.floor(wheel.cy - dy); // complété par symétrie
        const from = (Y * img.width + X) * 4;
        img.data.copy(image.data, (y * size + x) * 4, from, from + 4);
        image.data[(y * size + x) * 4 + 3] = 255;
        // Trou dans le char, un peu plus petit que la roue pour éviter tout liseré.
        if ((dx / (wheel.rx - 2)) ** 2 + (dy / (wheel.ry - 2)) ** 2 <= 1) {
          const sx = X - box.x0;
          const sy = Math.floor(wheel.cy + dy) - box.y0;
          if (sx >= 0 && sy >= 0 && sx < sprite.width && sy < sprite.height) cart.data[(sy * sprite.width + sx) * 4 + 3] = 0;
        }
      }
    await save(image, out(`${wheel.name}.png`), Math.round(size * scale));
    layout.cart.wheels.push({ cx: wheel.cx - box.x0, cy: wheel.cy - box.y0, rx: wheel.rx, ry: wheel.ry });
  }

  await save(cart, out("cart.png"), 480);
  await save(ram, out("ram.png"), 480);
}

/* --------------------------------------------------------------- Halle ---
   On ne garde que le bâtiment (le jeu dessine son propre ciel et son sol) :
   - recadrage sur le bâtiment, sans le tronc d'arbre ni la pelouse ;
   - ciel et nuages retirés ;
   - le feuillage qui passe devant les murs est remplacé par la couleur du mur
     voisin (on prolonge la ligne depuis la droite), et retiré devant le ciel. */
{
  const full = await load(src("halle.png"));
  const X0 = 140, Y0 = 105, ROOF_BOTTOM = 300;
  const hall = crop(full, X0, Y0, 1012, 494);
  const isSky = (r, g, b) => b > r + 25 && b > g - 10;
  const isCloud = (r, g, b) => Math.min(r, g, b) > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 40;
  const isFoliage = (r, g, b) => (g > r + 15 && g > b + 5) || (r < 115 && r > g && g > b && r - b > 22);

  // Sous le toit : on bouche le feuillage avec le mur situé à sa droite.
  const { data, width, height } = hall;
  for (let y = ROOF_BOTTOM - Y0; y < height; y++) {
    let fill = null;
    for (let x = width - 1; x >= 0; x--) {
      const i = (y * width + x) * 4;
      if (isFoliage(data[i], data[i + 1], data[i + 2])) {
        if (fill) data.set(fill, i);
        else data[i + 3] = 0;
      } else fill = data.subarray(i, i + 4).slice();
    }
  }
  // Le bout de mur caché derrière l'arbre (à gauche) est retiré sous le toit.
  const WALL_LEFT = 200 - X0;
  for (let y = ROOF_BOTTOM - Y0; y < height; y++)
    for (let x = 0; x < WALL_LEFT; x++) data[(y * width + x) * 4 + 3] = 0;

  // Au-dessus : ciel, nuages et feuillage disparaissent.
  floodClear(hall, (r, g, b, x, y) =>
    isSky(r, g, b) || isFoliage(r, g, b) || (y < ROOF_BOTTOM - Y0 && isCloud(r, g, b)),
  );
  keepLargest(hall);
  const box = bounds(hall);
  await save(crop(hall, box.x0, box.y0, box.x1, box.y1), out("hall.png"), 760);
}

/* --------------------------------------------------------------- Coupe ---
   Fond gris uni ; l'ombre portée sous le socle est conservée. */
{
  const full = await load(src("coupe.png"));
  floodClear(full, (r, g, b) => near(r, g, b, [61, 61, 61], 24));
  keepLargest(full);
  const box = bounds(full);
  const cup = crop(full, box.x0, box.y0, box.x1, box.y1);
  let x0 = cup.width, x1 = 0, y0 = cup.height, y1 = 0;
  for (let y = 0; y < cup.height; y++)
    for (let x = 0; x < cup.width; x++) {
      const i = (y * cup.width + x) * 4;
      const light = (cup.data[i] + cup.data[i + 1] + cup.data[i + 2]) / 3;
      if (cup.data[i + 3] < 128 || light < 40) continue; // l'ombre portée est ignorée
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  layout.cup = { centerX: (x0 + x1) / 2 / cup.width, centerY: (y0 + y1) / 2 / cup.height };
  await save(cup, out("cup.png"), 300);
}

// Positions utilisées par le moteur du jeu (fichier généré, ne pas modifier à la main).
await writeFile(
  path.join(root, "src", "components", "challenge", "sprite-layout.ts"),
  `// Fichier généré par scripts/challenge-assets.mjs — ne pas modifier à la main.
// Coordonnées en pixels de l'image source détourée.
export const SPRITE_LAYOUT = ${JSON.stringify(layout, null, 2)} as const;
`,
);
console.log("ok      src/components/challenge/sprite-layout.ts");
