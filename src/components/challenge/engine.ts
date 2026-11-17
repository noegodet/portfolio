/* ===========================================================================
   Mini-jeu « challenge » — moteur (logique + rendu sur <canvas>).

   Le char de l'Esisar avance vers la halle ; maintenir Espace fait rentrer le
   bélier dans le char (charge), relâcher le fait frapper. Chaque coup fissure
   et arrache des morceaux de la halle ; à 0 PV elle s'effondre, puis la coupe
   du Challenge sort des décombres en grandissant.

   Le moteur ne dépend pas de React : ChallengeGame.tsx le crée, lui transmet
   les touches et écoute ses événements (fin de partie).
=========================================================================== */

import { SPRITE_LAYOUT } from "./sprite-layout";

export type ChallengeAssets = {
  cart: HTMLImageElement;
  ram: HTMLImageElement;
  wheelBig: HTMLImageElement;
  wheelSmall: HTMLImageElement;
  hall: HTMLImageElement;
  cup: HTMLImageElement;
};

export type ChallengeInput = "left" | "right" | "charge";

export type ChallengeEvent = { type: "won"; time: number; hits: number };

/** Libellés affichés dans le jeu (traduits par la page). */
export type ChallengeHudLabels = { hall: string; hp: string; hit: string; hits: string };

type Phase = "intro" | "play" | "collapse" | "reveal" | "won";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  kind: "debris" | "dust" | "spark";
  bounced?: boolean;
};

type Floater = { x: number; y: number; text: string; life: number };

/* --------------------------------------------------------------- Réglages */
const VIEW_W = 960;
const VIEW_H = 540;
const GROUND_Y = 468;

const CART_W = 230;
/** Pixels écran par pixel de l'image source du char. */
const CART_K = CART_W / SPRITE_LAYOUT.cart.width;
const CART_H = SPRITE_LAYOUT.cart.height * CART_K;
const CART_SPEED = 190; // px/s
/*
 * Courses du bélier (px écran). Le tronc est prolongé de ramLogExtension px
 * (image source) derrière le char : le recul + l'avancée maximale doivent
 * rester inférieurs à ce prolongement pour que le tronc ne « décolle » jamais.
 */
const RAM_RETRACT = 72; // recul max à pleine charge
const RAM_REACH_MIN = 26; // avancée d'un coup sans charge
const RAM_REACH_MAX = 68; // avancée d'un coup à pleine charge
const CHARGE_TIME = 1.0; // s pour une charge complète

const HALL_W = 560;
const HALL_H = (336 * HALL_W) / 760;
const HALL_X = VIEW_W - HALL_W - 16;
const HALL_Y = GROUND_Y + 8 - HALL_H;
/** Façade : bord gauche des murs (le toit déborde davantage, mais plus haut). */
const FACE_X = HALL_X + 40;
const HALL_HP = 100;

const CUP_H = 240;
const COLLAPSE_TIME = 1.9;
const REVEAL_TIME = 1.7;

const GRAVITY = 1100;

/* ---------------------------------------------------------------- Outils */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInQuad = (t: number) => t * t;
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible");
  return { canvas, context };
}

/* ================================================================ Moteur */
export class ChallengeEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly font: string;
  private frame = 0;
  private last = 0;
  private running = false;

  // Décor préparé une fois
  private readonly ground: HTMLCanvasElement;
  private readonly clouds = Array.from({ length: 6 }, (_, i) => ({
    x: rand(0, VIEW_W) + i * 40,
    y: rand(30, 170),
    w: rand(70, 150),
    speed: rand(6, 16),
  }));

  // Halle : copie modifiable (fissures, trous) et palette de couleurs
  private hallLayer!: HTMLCanvasElement;
  private hallCtx!: CanvasRenderingContext2D;
  private hallPixels!: Uint8ClampedArray;
  private readonly hallScale: number; // px image par px écran
  private palette: string[] = [];

  // État de partie
  private phase: Phase = "intro";
  private phaseTime = 0;
  private playTime = 0;
  private hits = 0;
  private hp = HALL_HP;
  private cartX = 40;
  private cartV = 0;
  private bob = 0;
  /** Distance parcourue par le char : fait tourner les roues. */
  private travel = 0;
  private charge = 0;
  private ramOffset = 0;
  private strike: { t: number; power: number; from: number; hit: boolean } | null = null;
  private shake = 0;
  private flash: { x: number; y: number; t: number } | null = null;
  private particles: Particle[] = [];
  private rubble: { x: number; y: number; w: number; h: number; color: string }[] = [];
  private mound: { x: number; y: number; w: number; h: number; color: string }[] = [];
  private floaters: Floater[] = [];
  private nextChunkAt = 66;
  private readonly input = { left: false, right: false, charge: false };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly assets: ChallengeAssets,
    private readonly options: {
      reducedMotion: boolean;
      labels: ChallengeHudLabels;
      onEvent: (event: ChallengeEvent) => void;
    },
  ) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D indisponible");
    this.ctx = context;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VIEW_W * ratio;
    canvas.height = VIEW_H * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const mono = getComputedStyle(document.body).getPropertyValue("--font-jetbrains-mono").trim();
    this.font = mono ? `${mono}, monospace` : "monospace";

    this.hallScale = assets.hall.naturalWidth / HALL_W;
    this.ground = this.paintGround();
    this.resetHall();
  }

  /* ---------------------------------------------------------- Contrôle */
  /** Démarre (ou redémarre) une partie. */
  start() {
    this.resetHall();
    this.phase = "play";
    this.phaseTime = 0;
    this.playTime = 0;
    this.hits = 0;
    this.hp = HALL_HP;
    this.cartX = 40;
    this.cartV = 0;
    this.charge = 0;
    this.ramOffset = 0;
    this.strike = null;
    this.particles = [];
    this.rubble = [];
    this.mound = [];
    this.floaters = [];
    this.nextChunkAt = 66;
  }

  setInput(name: ChallengeInput, down: boolean) {
    if (name === "charge" && !down && this.input.charge) this.release();
    this.input[name] = down;
  }

  run() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.last) / 1000, 1 / 30);
      this.last = now;
      this.update(dt);
      this.draw();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    // Une touche relâchée pendant la pause ne doit pas rester « enfoncée ».
    this.input.left = this.input.right = false;
    this.input.charge = false;
    this.charge = 0;
  }

  /* -------------------------------------------------- Préparation décor */
  private paintGround() {
    const { canvas, context } = makeCanvas(VIEW_W, VIEW_H - GROUND_Y);
    const h = VIEW_H - GROUND_Y;
    context.fillStyle = "#6b4630";
    context.fillRect(0, 0, VIEW_W, h);
    for (let i = 0; i < 260; i++) {
      context.fillStyle = Math.random() < 0.5 ? "#57382a" : "#82593c";
      context.fillRect(Math.floor(rand(0, VIEW_W) / 4) * 4, Math.floor(rand(12, h) / 4) * 4, 4, 4);
    }
    context.fillStyle = "#4f9a3a";
    context.fillRect(0, 0, VIEW_W, 12);
    context.fillStyle = "#7cc45a";
    context.fillRect(0, 0, VIEW_W, 4);
    for (let x = 0; x < VIEW_W; x += 8) {
      if (Math.random() < 0.5) continue;
      context.fillStyle = "#3f7f2e";
      context.fillRect(x, 12, 4, 4);
    }
    return canvas;
  }

  private resetHall() {
    const image = this.assets.hall;
    const { canvas, context } = makeCanvas(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, 0, 0);
    this.hallLayer = canvas;
    this.hallCtx = context;
    this.hallPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    // Palette : couleurs prises au hasard sur le bâtiment, pour les débris.
    this.palette = [];
    for (let tries = 0; this.palette.length < 48 && tries < 5000; tries++) {
      const color = this.sampleHall(rand(0, canvas.width), rand(0, canvas.height));
      if (color) this.palette.push(color);
    }
    if (!this.palette.length) this.palette.push("#8a8f99");
  }

  /** Couleur du bâtiment à une position de l'image (ou null si transparent). */
  private sampleHall(ix: number, iy: number) {
    const x = Math.floor(clamp(ix, 0, this.hallLayer.width - 1));
    const y = Math.floor(clamp(iy, 0, this.hallLayer.height - 1));
    const i = (y * this.hallLayer.width + x) * 4;
    if (this.hallPixels[i + 3] < 128) return null;
    return `rgb(${this.hallPixels[i]} ${this.hallPixels[i + 1]} ${this.hallPixels[i + 2]})`;
  }

  private randomHallColor() {
    return this.palette[Math.floor(Math.random() * this.palette.length)];
  }

  /* ------------------------------------------------------------- Règles */
  private get gap() {
    return FACE_X - (this.cartX + CART_W);
  }

  private release() {
    if (this.phase !== "play" || this.strike) return;
    const power = Math.max(0.15, this.charge);
    this.strike = { t: 0, power, from: this.ramOffset, hit: false };
    this.charge = 0;
  }

  private update(dt: number) {
    this.phaseTime += dt;
    this.updateClouds(dt);
    this.updateParticles(dt);
    this.shake = Math.max(0, this.shake - dt * 30);
    if (this.flash) {
      this.flash.t += dt;
      if (this.flash.t > 0.25) this.flash = null;
    }
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 40 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);

    if (this.phase === "play") this.updatePlay(dt);
    else if (this.phase === "collapse") this.updateCollapse();
    else if (this.phase === "reveal" && this.phaseTime >= REVEAL_TIME) {
      this.phase = "won";
      this.phaseTime = 0;
      this.options.onEvent({ type: "won", time: this.playTime, hits: this.hits });
    }
  }

  private updatePlay(dt: number) {
    this.playTime += dt;

    // Déplacement (plus lent pendant la charge), avec un peu d'inertie.
    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    const target = dir * CART_SPEED * (this.input.charge ? 0.45 : 1);
    this.cartV += (target - this.cartV) * Math.min(1, dt * 10);
    const before = this.cartX;
    this.cartX = clamp(this.cartX + this.cartV * dt, 8, FACE_X - CART_W - 2);
    this.travel += this.cartX - before;
    if (Math.abs(this.cartV) > 20) {
      this.bob += dt * 18;
      if (Math.random() < dt * 14) this.spawnWheelDust();
    }

    // Charge : le bélier rentre dans le char.
    if (this.input.charge && !this.strike) {
      this.charge = Math.min(1, this.charge + dt / CHARGE_TIME);
      this.ramOffset = -RAM_RETRACT * easeOutCubic(this.charge);
    }

    // Coup : sortie rapide, maintien, retour.
    if (this.strike) {
      const s = this.strike;
      s.t += dt;
      const reach = RAM_REACH_MIN + (RAM_REACH_MAX - RAM_REACH_MIN) * s.power;
      const OUT = 0.1;
      const HOLD = 0.07;
      const BACK = 0.3;
      if (s.t < OUT) {
        const target = Math.min(reach, this.gap + 6);
        this.ramOffset = s.from + (target - s.from) * easeOutCubic(s.t / OUT);
      } else if (!s.hit) {
        s.hit = true;
        if (reach >= this.gap) this.impact(s.power);
      } else if (s.t < OUT + HOLD) {
        // maintien en position avancée
      } else if (s.t < OUT + HOLD + BACK) {
        const k = (s.t - OUT - HOLD) / BACK;
        const top = Math.min(reach, this.gap + 6);
        this.ramOffset = top * (1 - easeOutCubic(k));
      } else {
        this.ramOffset = 0;
        this.strike = null;
      }
    }
  }

  private impact(power: number) {
    this.hits++;
    const damage = Math.round(7 + 22 * power ** 1.2);
    this.hp = Math.max(0, this.hp - damage);
    if (!this.options.reducedMotion) this.shake = 4 + 11 * power;
    this.cartV = -260 * power - 60; // recul du char

    const hitY = this.cartY() + CART_H * 0.62;
    this.flash = { x: FACE_X, y: hitY, t: 0 };
    this.floaters.push({ x: FACE_X + 10, y: hitY - 50, text: `-${damage}`, life: 0.9 });

    this.damageHall(power, hitY);

    if (this.hp <= 0) {
      this.phase = "collapse";
      this.phaseTime = 0;
      this.buildMound();
    }
  }

  /** Fissures et trous dans la halle, de plus en plus étendus. */
  private damageHall(power: number, hitY: number) {
    const k = this.hallScale;
    const ctx = this.hallCtx;
    const wear = 1 - this.hp / HALL_HP;
    const ix = (FACE_X - HALL_X) * k;
    const iy = (hitY - HALL_Y) * k;

    // Fissures : lignes brisées sombres, dessinées seulement sur le bâtiment.
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.strokeStyle = "#16111c";
    ctx.lineCap = "square";
    const cracks = 2 + Math.round(3 * power);
    for (let c = 0; c < cracks; c++) {
      ctx.lineWidth = rand(2, 4) * k * 0.6;
      let x = ix + rand(-6, 10);
      let y = iy + rand(-30, 30) * k;
      const angle = rand(-0.9, 0.9);
      ctx.beginPath();
      ctx.moveTo(x, y);
      const steps = 4 + Math.round(6 * power + 6 * wear);
      for (let s = 0; s < steps; s++) {
        x += Math.cos(angle) * rand(10, 22) * k * 0.6;
        y += (Math.sin(angle) * 14 + rand(-12, 12)) * k * 0.6;
        ctx.lineTo(Math.round(x / 3) * 3, Math.round(y / 3) * 3);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Trous : blocs arrachés, de plus en plus loin de la façade.
    const holes = 2 + Math.round(5 * power);
    const spread = 80 + wear * (this.hallLayer.width - 80);
    for (let h = 0; h < holes; h++) {
      const hx = ix + rand(-10, spread);
      const hy = rand(this.hallLayer.height * 0.35, this.hallLayer.height * 0.95);
      this.carve(hx, hy, rand(10, 18 + 22 * power) * k * 0.6);
    }

    // Gros morceaux de toit aux paliers de dégâts.
    if (this.hp <= this.nextChunkAt) {
      this.nextChunkAt -= 33;
      const cx = rand(0.05, 0.5) * this.hallLayer.width;
      const cy = rand(0.05, 0.3) * this.hallLayer.height;
      for (let i = 0; i < 6; i++) this.carve(cx + rand(-40, 40) * k, cy + rand(-20, 20) * k, rand(20, 34) * k);
      this.spawnDebris(HALL_X + cx / k, HALL_Y + cy / k, 26, 260, true);
    }

    // Débris à l'impact, aux couleurs du bâtiment touché.
    this.spawnDebris(FACE_X + 4, hitY, 10 + Math.round(22 * power), 220 + 260 * power, false);
  }

  /** Arrache un bloc irrégulier (en pixels carrés) de la halle. */
  private carve(cx: number, cy: number, radius: number) {
    const ctx = this.hallCtx;
    const cell = Math.max(4, Math.round(radius / 3));
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let y = -radius; y <= radius; y += cell)
      for (let x = -radius; x <= radius; x += cell) {
        const d = Math.hypot(x, y) / radius;
        if (d < 0.75 || (d < 1.1 && Math.random() < 0.5))
          ctx.fillRect(Math.round((cx + x) / cell) * cell, Math.round((cy + y) / cell) * cell, cell, cell);
      }
    ctx.restore();
    this.hallPixels = ctx.getImageData(0, 0, this.hallLayer.width, this.hallLayer.height).data;
  }

  private updateCollapse() {
    if (Math.random() < 0.6) this.spawnDust(rand(HALL_X, HALL_X + HALL_W), GROUND_Y - rand(0, 20), 1);
    if (Math.random() < 0.25)
      this.spawnDebris(rand(HALL_X + 20, HALL_X + HALL_W - 20), HALL_Y + rand(20, 120), 3, 120, true);
    if (!this.options.reducedMotion) this.shake = Math.max(this.shake, 3);
    if (this.phaseTime >= COLLAPSE_TIME) {
      this.phase = "reveal";
      this.phaseTime = 0;
      this.spawnDust(HALL_X + HALL_W / 2, GROUND_Y - 40, 26);
    }
  }

  /** Tas de décombres qui remplace la halle. */
  private buildMound() {
    this.mound = [];
    const left = HALL_X + 10;
    const width = HALL_W - 20;
    for (let i = 0; i < 520; i++) {
      const u = Math.random();
      const height = 70 * Math.sin(Math.PI * u) ** 0.8 + 10;
      const w = Math.round(rand(6, 16) / 2) * 2;
      this.mound.push({
        x: Math.round((left + u * width) / 2) * 2,
        y: Math.round((GROUND_Y + 6 - Math.random() * height) / 2) * 2,
        w,
        h: Math.round(w * rand(0.6, 1)),
        color: this.randomHallColor(),
      });
    }
    this.mound.sort((a, b) => a.y - b.y);
  }

  /* --------------------------------------------------------- Particules */
  private spawnDebris(x: number, y: number, count: number, speed: number, fromAbove: boolean) {
    const n = this.options.reducedMotion ? Math.ceil(count / 2) : count;
    for (let i = 0; i < n; i++) {
      const angle = fromAbove ? rand(-Math.PI * 0.9, -Math.PI * 0.1) : rand(-Math.PI * 0.85, -Math.PI * 0.15) + 0.35;
      const v = rand(0.3, 1) * speed;
      const ix = (x - HALL_X) * this.hallScale + rand(-12, 12);
      const iy = (y - HALL_Y) * this.hallScale + rand(-12, 12);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * v * (fromAbove ? 0.6 : 1),
        vy: Math.sin(angle) * v,
        size: Math.round(rand(3, 8)),
        color: this.sampleHall(ix, iy) ?? this.randomHallColor(),
        life: 6,
        maxLife: 6,
        kind: "debris",
      });
    }
  }

  private spawnDust(x: number, y: number, count: number) {
    if (this.options.reducedMotion) count = Math.ceil(count / 3);
    for (let i = 0; i < count; i++)
      this.particles.push({
        x: x + rand(-30, 30),
        y,
        vx: rand(-40, 40),
        vy: rand(-50, -10),
        size: Math.round(rand(10, 26)),
        color: "214 204 186",
        life: rand(0.8, 1.6),
        maxLife: 1.6,
        kind: "dust",
      });
  }

  private spawnWheelDust() {
    const behind = this.cartV > 0 ? this.cartX + 30 : this.cartX + CART_W - 60;
    this.particles.push({
      x: behind,
      y: GROUND_Y - 4,
      vx: -Math.sign(this.cartV) * rand(10, 40),
      vy: rand(-30, -10),
      size: Math.round(rand(6, 12)),
      color: "190 160 120",
      life: 0.6,
      maxLife: 0.6,
      kind: "dust",
    });
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.kind === "debris") {
        p.vy += GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y >= GROUND_Y + 2 - p.size) {
          p.y = GROUND_Y + 2 - p.size;
          if (!p.bounced && Math.abs(p.vy) > 120) {
            p.vy *= -0.3;
            p.vx *= 0.5;
            p.bounced = true;
          } else {
            // Le débris reste au sol.
            this.rubble.push({ x: Math.round(p.x), y: Math.round(p.y), w: p.size, h: p.size, color: p.color });
            p.life = 0;
          }
        }
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    if (this.rubble.length > 260) this.rubble.splice(0, this.rubble.length - 260);
  }

  private updateClouds(dt: number) {
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > VIEW_W + 40) c.x = -c.w - 40;
    }
  }

  /* -------------------------------------------------------------- Rendu */
  private cartY() {
    const bob = Math.abs(this.cartV) > 20 ? Math.sin(this.bob) * 1.5 : 0;
    return GROUND_Y + 6 - CART_H + bob;
  }

  private draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake) * 0.6);

    this.drawSky();
    this.drawHall();
    ctx.drawImage(this.ground, 0, GROUND_Y);
    this.drawRubble();
    if (this.phase === "reveal" || this.phase === "won") this.drawCup();
    this.drawCart();
    this.drawParticles();
    this.drawFlash();
    ctx.restore();

    this.drawHud();
  }

  private drawSky() {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, "#2f86d8");
    sky.addColorStop(1, "#a7d5f4");
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, VIEW_W + 40, GROUND_Y + 40);

    for (const c of this.clouds) {
      const x = Math.round(c.x / 4) * 4;
      const y = Math.round(c.y / 4) * 4;
      const w = Math.round(c.w / 4) * 4;
      ctx.fillStyle = "#dbe9f5";
      ctx.fillRect(x + 4, y + 16, w - 8, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y + 8, w, 12);
      ctx.fillRect(x + w * 0.2, y, w * 0.35, 12);
      ctx.fillRect(x + w * 0.5, y + 4, w * 0.3, 8);
    }

    // Collines lointaines
    ctx.fillStyle = "#77b867";
    for (let x = -40; x < VIEW_W + 40; x += 120) {
      ctx.beginPath();
      ctx.ellipse(x + 60, GROUND_Y, 90, 34, 0, Math.PI, 0);
      ctx.fill();
    }
  }

  private drawHall() {
    const ctx = this.ctx;
    let sink = 0;
    if (this.phase === "collapse") sink = HALL_H * 1.05 * easeInQuad(Math.min(1, this.phaseTime / COLLAPSE_TIME));
    else if (this.phase === "reveal" || this.phase === "won") return;

    ctx.save();
    // La halle s'enfonce sous le sol : on ne dessine que ce qui est au-dessus.
    ctx.beginPath();
    ctx.rect(HALL_X - 40, -40, HALL_W + 80, GROUND_Y + 48);
    ctx.clip();
    ctx.drawImage(this.hallLayer, HALL_X, HALL_Y + sink, HALL_W, HALL_H);
    ctx.restore();
  }

  private drawRubble() {
    const ctx = this.ctx;
    for (const r of this.rubble) {
      ctx.fillStyle = r.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    if (!this.mound.length) return;
    // Le tas monte pendant l'effondrement.
    const grow = this.phase === "collapse" ? easeOutCubic(this.phaseTime / COLLAPSE_TIME) : 1;
    for (const m of this.mound) {
      const y = GROUND_Y + 6 - (GROUND_Y + 6 - m.y) * grow;
      ctx.fillStyle = "#17121f";
      ctx.fillRect(m.x - 1, y - 1, m.w + 2, m.h + 2);
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x, y, m.w, m.h);
    }
  }

  private drawCup() {
    const ctx = this.ctx;
    const image = this.assets.cup;
    const t = this.phase === "won" ? 1 : Math.min(1, this.phaseTime / REVEAL_TIME);
    const scale = this.options.reducedMotion ? easeOutCubic(t) : Math.max(0, easeOutBack(t));
    const cx = HALL_X + HALL_W / 2;
    const baseY = GROUND_Y - 44;
    const h = CUP_H * scale;
    const w = (h * image.naturalWidth) / image.naturalHeight;
    // Centre visuel du trophée (sans son ombre), mesuré sur l'image.
    const centerX = cx + (SPRITE_LAYOUT.cup.centerX - 0.5) * w;
    const centerY = baseY - h + h * SPRITE_LAYOUT.cup.centerY;
    const finalCenterY = baseY - CUP_H + CUP_H * SPRITE_LAYOUT.cup.centerY;
    const time = performance.now() / 1000;

    // Rayons dorés derrière la coupe
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.options.reducedMotion ? 0 : time * 0.35);
    ctx.globalAlpha = 0.22 * Math.min(1, t * 1.5);
    ctx.fillStyle = "#ffd75a";
    for (let i = 0; i < 12; i++) {
      ctx.rotate((Math.PI * 2) / 12);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-18, -260);
      ctx.lineTo(18, -260);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    const glow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
    glow.addColorStop(0, `rgb(255 220 120 / ${0.45 * t})`);
    glow.addColorStop(1, "rgb(255 220 120 / 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(centerX - 170, centerY - 170, 340, 340);

    if (h > 1) ctx.drawImage(image, cx - w / 2, baseY - h, w, h);

    // Étincelles
    if (t > 0.4) {
      ctx.fillStyle = "#fff4c2";
      for (let i = 0; i < 10; i++) {
        const a = i * 2.4 + time * 0.8;
        const r = 90 + 30 * Math.sin(time * 2 + i);
        const twinkle = (Math.sin(time * 6 + i * 1.7) + 1) / 2;
        const size = 2 + Math.round(twinkle * 3);
        const sx = centerX + Math.cos(a) * r;
        const sy = finalCenterY + Math.sin(a) * r * 1.1;
        ctx.fillRect(sx - size, sy, size * 2 + 1, 1 + (size > 3 ? 1 : 0));
        ctx.fillRect(sx, sy - size, 1 + (size > 3 ? 1 : 0), size * 2 + 1);
      }
    }
  }

  private drawCart() {
    const ctx = this.ctx;
    const y = this.cartY();
    const jitter = this.charge >= 1 && !this.options.reducedMotion ? rand(-1, 1) : 0;
    const x = this.cartX + jitter;
    // Le bélier est dessiné avant le char : en reculant, il « rentre » dedans.
    ctx.drawImage(this.assets.ram, x + this.ramOffset, y, CART_W, CART_H);
    ctx.drawImage(this.assets.cart, x, y, CART_W, CART_H);
    this.drawWheels(x, y);

    // Jauge de charge
    if (this.charge > 0 && this.phase === "play") {
      const segments = 10;
      const filled = Math.ceil(this.charge * segments);
      const gx = x + CART_W / 2 - 66;
      const gy = y - 24;
      ctx.fillStyle = "#17121f";
      ctx.fillRect(gx - 3, gy - 3, 132 + 6, 14 + 6);
      for (let i = 0; i < segments; i++) {
        ctx.fillStyle = i < filled ? (i >= 8 ? "#f5c542" : i >= 5 ? "#c4a3ff" : "#8b5cf6") : "#2b2739";
        ctx.fillRect(gx + i * 13.2, gy, 11, 14);
      }
      if (this.charge >= 1 && Math.floor(performance.now() / 160) % 2 === 0) {
        ctx.fillStyle = "#f5c542";
        ctx.font = `bold 13px ${this.font}`;
        ctx.textAlign = "center";
        ctx.fillText("MAX", gx + 66, gy - 8);
      }
    }
  }

  /**
   * Roues : elles tournent selon la distance parcourue (angle = distance / rayon).
   * Vues légèrement en perspective (ellipses), on les « redresse » en cercle,
   * on les fait tourner, puis on les ré-aplatit.
   */
  private drawWheels(x: number, y: number) {
    const ctx = this.ctx;
    const images = [this.assets.wheelBig, this.assets.wheelSmall];
    SPRITE_LAYOUT.cart.wheels.forEach((wheel, index) => {
      const size = (2 * Math.max(wheel.rx, wheel.ry) + 2) * CART_K;
      const squash = wheel.ry / wheel.rx;
      ctx.save();
      ctx.translate(x + wheel.cx * CART_K, y + wheel.cy * CART_K);
      ctx.scale(1, squash);
      ctx.rotate(this.travel / (wheel.rx * CART_K));
      ctx.scale(1, 1 / squash);
      ctx.drawImage(images[index], -size / 2, -size / 2, size, size);
      ctx.restore();
    });
  }

  private drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      if (p.kind === "debris") {
        ctx.fillStyle = "#17121f";
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, p.size + 2, p.size + 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      } else {
        const alpha = Math.max(0, p.life / p.maxLife) * 0.55;
        const grown = p.size * (1.6 - p.life / p.maxLife);
        ctx.fillStyle = `rgb(${p.color} / ${alpha})`;
        ctx.fillRect(Math.round(p.x - grown / 2), Math.round(p.y - grown / 2), Math.round(grown), Math.round(grown));
      }
    }
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.font = `bold 22px ${this.font}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#17121f";
      ctx.fillText(f.text, f.x + 2, f.y + 2);
      ctx.fillStyle = "#f5c542";
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
  }

  private drawFlash() {
    if (!this.flash) return;
    const ctx = this.ctx;
    const k = this.flash.t / 0.25;
    ctx.strokeStyle = `rgb(255 255 255 / ${1 - k})`;
    ctx.lineWidth = 6 * (1 - k) + 1;
    ctx.beginPath();
    ctx.arc(this.flash.x, this.flash.y, 12 + 50 * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawHud() {
    if (this.phase === "intro") return;
    const ctx = this.ctx;

    // Barre de vie de la halle
    const x = 20;
    const y = 20;
    const w = 260;
    ctx.fillStyle = "rgb(11 10 16 / 0.75)";
    ctx.fillRect(x - 8, y - 8, w + 16, 46);
    ctx.font = `bold 12px ${this.font}`;
    ctx.textAlign = "left";
    ctx.fillStyle = "#eceaf4";
    ctx.fillText(this.options.labels.hall, x, y + 6);
    ctx.fillStyle = "#2b2739";
    ctx.fillRect(x, y + 14, w, 12);
    const ratio = this.hp / HALL_HP;
    ctx.fillStyle = ratio > 0.5 ? "#4ade80" : ratio > 0.25 ? "#fbbf24" : "#f87171";
    ctx.fillRect(x, y + 14, Math.round(w * ratio), 12);
    ctx.textAlign = "right";
    ctx.fillStyle = "#a8a3bd";
    ctx.fillText(`${Math.ceil(this.hp)} ${this.options.labels.hp}`, x + w, y + 6);

    // Chrono et nombre de coups
    ctx.fillStyle = "rgb(11 10 16 / 0.75)";
    ctx.fillRect(VIEW_W - 196, 12, 184, 46);
    ctx.fillStyle = "#eceaf4";
    ctx.textAlign = "right";
    ctx.font = `bold 16px ${this.font}`;
    ctx.fillText(`${this.playTime.toFixed(1)} s`, VIEW_W - 24, 34);
    ctx.font = `12px ${this.font}`;
    ctx.fillStyle = "#a8a3bd";
    ctx.fillText(`${this.hits} ${this.hits > 1 ? this.options.labels.hits : this.options.labels.hit}`, VIEW_W - 24, 50);
  }
}

export const CHALLENGE_VIEW = { width: VIEW_W, height: VIEW_H };
