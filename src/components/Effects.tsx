"use client";

import { animate, motion, useInView, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Vrai si le visiteur a activé « réduire les animations » dans son système. */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ===========================================================================
   Arrière-plan « flux de données »
   Des impulsions lumineuses circulent le long de la trame de points du fond,
   en tournant à angle droit comme dans un circuit ou un pipeline de données.
=========================================================================== */

/** Pas de la trame de points (doit rester égal à celui du fond dans globals.css). */
const GRID = 26;
const GRID_OFFSET = GRID / 2;
/** Directions possibles : droite, bas, gauche, haut. */
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] as const;

type Point = { x: number; y: number };

type Pulse = {
  /** Angles déjà franchis par la traînée (coordonnées de page). */
  corners: Point[];
  head: Point;
  direction: number;
  speed: number;
  length: number;
  travelled: number;
  total: number;
  nextTurn: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);
const snap = (value: number) => Math.round((value - GRID_OFFSET) / GRID) * GRID + GRID_OFFSET;

export function DataFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || prefersReducedMotion()) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    const pulses: Pulse[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    // Moins d'impulsions sur petit écran : plus lisible et plus économe en batterie.
    const targetCount = () => (width < 768 ? 7 : 16);

    const spawn = (): Pulse => {
      const start = {
        x: snap(random(0, width)),
        y: snap(window.scrollY + random(0, height)),
      };
      return {
        corners: [start],
        head: { ...start },
        direction: Math.floor(random(0, 4)),
        speed: random(90, 210),
        length: random(90, 200),
        travelled: 0,
        total: random(450, 1300),
        nextTurn: GRID * Math.floor(random(4, 16)),
      };
    };

    const advance = (pulse: Pulse, seconds: number) => {
      let remaining = pulse.speed * seconds;
      while (remaining > 0) {
        const step = Math.min(remaining, pulse.nextTurn - pulse.travelled);
        const [dx, dy] = DIRECTIONS[pulse.direction];
        pulse.head.x += dx * step;
        pulse.head.y += dy * step;
        pulse.travelled += step;
        remaining -= step;
        if (pulse.travelled >= pulse.nextTurn) {
          // Sur un nœud de la trame : virage à angle droit, à gauche ou à droite.
          pulse.head = { x: snap(pulse.head.x), y: snap(pulse.head.y) };
          pulse.corners.push({ ...pulse.head });
          pulse.direction = (pulse.direction + (Math.random() < 0.5 ? 1 : 3)) % 4;
          pulse.nextTurn += GRID * Math.floor(random(3, 14));
        }
      }
    };

    const draw = (pulse: Pulse, scroll: number) => {
      // Apparition et disparition progressives en début et en fin de trajet.
      const fade =
        Math.min(1, pulse.travelled / 90) * Math.min(1, (pulse.total - pulse.travelled) / 140);
      if (fade <= 0) return;

      // La traînée se dessine de la tête vers l'arrière, segment par segment.
      let left = pulse.length;
      let from = pulse.head;
      for (let index = pulse.corners.length - 1; index >= 0 && left > 0; index--) {
        const corner = pulse.corners[index];
        const segment = Math.abs(from.x - corner.x) + Math.abs(from.y - corner.y);
        if (segment > 0) {
          const used = Math.min(segment, left);
          const to = {
            x: from.x + ((corner.x - from.x) / segment) * used,
            y: from.y + ((corner.y - from.y) / segment) * used,
          };
          const gradient = context.createLinearGradient(from.x, from.y - scroll, to.x, to.y - scroll);
          gradient.addColorStop(0, `rgb(167 139 250 / ${0.6 * fade * (left / pulse.length)})`);
          gradient.addColorStop(1, `rgb(167 139 250 / ${0.6 * fade * ((left - used) / pulse.length)})`);
          context.strokeStyle = gradient;
          context.beginPath();
          context.moveTo(from.x, from.y - scroll);
          context.lineTo(to.x, to.y - scroll);
          context.stroke();
          left -= used;
        }
        from = corner;
      }
      // Les angles trop anciens ne servent plus : on ne garde que les derniers.
      if (pulse.corners.length > 8) pulse.corners.splice(0, pulse.corners.length - 8);

      context.fillStyle = `rgb(233 226 255 / ${0.95 * fade})`;
      context.shadowColor = "rgb(139 92 246)";
      context.shadowBlur = 12;
      context.beginPath();
      context.arc(pulse.head.x, pulse.head.y - scroll, 1.7, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    };

    const tick = (now: number) => {
      const elapsed = (now - previous) / 1000;
      // Le déplacement est plafonné pour éviter un saut après une pause de l'onglet.
      const seconds = Math.min(elapsed, 0.05);
      previous = now;
      const scroll = window.scrollY;

      context.clearRect(0, 0, width, height);
      context.lineWidth = 1.2;
      context.lineCap = "round";

      for (let index = pulses.length - 1; index >= 0; index--) {
        const pulse = pulses[index];
        advance(pulse, seconds);
        const screenY = pulse.head.y - scroll;
        const lost =
          pulse.head.x < -300 || pulse.head.x > width + 300 || screenY < -300 || screenY > height + 300;
        if (pulse.travelled >= pulse.total || lost) pulses.splice(index, 1);
        else draw(pulse, scroll);
      }
      // Les nouvelles impulsions arrivent une à une (environ 4 par seconde au
      // plus), quelle que soit la cadence d'affichage de l'écran.
      if (pulses.length < targetCount() && Math.random() < 1 - Math.exp(-4 * elapsed)) {
        pulses.push(spawn());
      }

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };
    // L'animation s'arrête quand l'onglet du navigateur n'est pas visible.
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(frame) : start());

    resize();
    // Démarrage légèrement différé : le contenu de la page s'affiche d'abord.
    const delay = window.setTimeout(start, 500);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 size-full" />;
}

/* ===========================================================================
   Barre de progression de lecture, sous l'en-tête
=========================================================================== */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.span
      aria-hidden="true"
      style={{ scaleX }}
      className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gradient-to-r from-accent-deep via-accent-strong to-accent"
    />
  );
}

/* ===========================================================================
   Cartes réactives : un halo violet suit le curseur dans la carte survolée.
   Le halo lui-même est dessiné en CSS (utilitaire `panel` de globals.css) ;
   ce composant ne fait que lui transmettre la position du curseur.
=========================================================================== */
export function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      const panel = (event.target as Element | null)?.closest?.<HTMLElement>(".panel");
      if (!panel) return;
      const box = panel.getBoundingClientRect();
      panel.style.setProperty("--glow-x", `${event.clientX - box.left}px`);
      panel.style.setProperty("--glow-y", `${event.clientY - box.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}

/* ===========================================================================
   Titre « décodé » : des caractères aléatoires qui se résolvent en texte
=========================================================================== */
const GLYPHS_UPPER = "ABCDEFGHKMNPRSTUVXYZ0123456789#%&<>/";
const GLYPHS_LOWER = "abcdefghkmnopqrstuvxyz0123456789_=+<>/";

function scrambled(text: string, resolved: number) {
  return Array.from(text, (char, index) => {
    if (index < resolved || !/\S/.test(char)) return char;
    const glyphs = char === char.toLowerCase() ? GLYPHS_LOWER : GLYPHS_UPPER;
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }).join("");
}

/**
 * À utiliser avec `key={text}` pour que l'effet rejoue quand le texte change.
 * Le vrai texte reste présent pour les lecteurs d'écran et les moteurs de recherche.
 */
export function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const length = Array.from(text).length;
        const duration = Math.min(950, 380 + length * 24);
        const started = performance.now();
        let lastPaint = 0;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - started) / duration);
          // ~25 images par seconde suffisent : au-delà, le texte devient illisible.
          if (now - lastPaint > 40 || progress === 1) {
            lastPaint = now;
            setDisplay(progress === 1 ? text : scrambled(text, Math.floor(progress * length)));
          }
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {display}
      </span>
    </>
  );
}

/* ===========================================================================
   Chiffres animés
   Dans un texte de contenu, un nombre entre accolades — ex. "TOEIC {850}/990"
   — se compte de 0 jusqu'à sa valeur quand il entre dans l'écran.
=========================================================================== */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  useEffect(() => {
    const element = ref.current;
    if (!inView || !element || prefersReducedMotion()) return;
    // Respecte l'écriture d'origine : "1,5" (français) ou "1.5" (anglais).
    const separator = value.includes(",") ? "," : ".";
    const decimals = value.split(separator)[1]?.length ?? 0;
    const target = Number(value.replace(",", "."));
    if (!Number.isFinite(target)) return;

    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (current) => {
        element.textContent = current.toFixed(decimals).replace(".", separator);
      },
      onComplete: () => {
        element.textContent = value;
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

export function Counted({ text }: { text: string }) {
  return text
    .split(/(\{[^}]+\})/)
    .map((part, index) =>
      part.startsWith("{") ? <CountUp key={index} value={part.slice(1, -1)} /> : part,
    );
}

/* ===========================================================================
   Chiffre clé « avant → après » d'une expérience
   L'ancienne valeur se compte, se fait barrer, puis la nouvelle s'impose.
=========================================================================== */
const ease = [0.22, 1, 0.36, 1] as const;

export function Metric({ before, after, caption }: { before: string; after: string; caption: string }) {
  return (
    <motion.p
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-accent/40 bg-accent/10 px-5 py-4"
    >
      <span className="relative font-mono text-2xl text-muted sm:text-3xl">
        <Counted text={before} />
        <motion.span
          aria-hidden="true"
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={{ duration: 0.45, delay: 1.45, ease }}
          className="absolute -inset-x-1 top-1/2 h-0.5 origin-left bg-faint"
        />
      </span>
      <motion.span
        aria-hidden="true"
        variants={{ hidden: { opacity: 0, x: -14 }, shown: { opacity: 1, x: 0 } }}
        transition={{ duration: 0.4, delay: 1.75, ease }}
        className="font-mono text-2xl text-accent sm:text-3xl"
      >
        →
      </motion.span>
      <motion.span
        variants={{ hidden: { opacity: 0, scale: 0.7 }, shown: { opacity: 1, scale: 1 } }}
        transition={{ duration: 0.55, delay: 1.95, ease }}
        className="origin-left font-mono text-3xl font-semibold text-fg [text-shadow:0_0_28px_rgb(139_92_246/0.75)] sm:text-4xl"
      >
        {after}
      </motion.span>
      <motion.span
        variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
        transition={{ duration: 0.5, delay: 2.2 }}
        className="w-full text-sm text-muted sm:w-auto"
      >
        {caption}
      </motion.span>
    </motion.p>
  );
}
