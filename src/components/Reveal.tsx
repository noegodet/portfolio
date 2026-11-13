"use client";

import { motion, MotionConfig, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Applique le réglage système « réduire les animations » à toutes les
 * animations Motion : les déplacements sont alors supprimés, seuls restent
 * de simples fondus.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Fait apparaître son contenu quand il entre dans l'écran : il monte, grandit
 * légèrement et passe du flou au net. `delay` (en secondes) décale les
 * éléments d'une même rangée pour qu'ils arrivent en cascade.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, scale: 0.97, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Roadmap verticale : un rail gris sur lequel une ligne violette se trace
 * au fur et à mesure du défilement.
 */
export function Timeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <ol ref={ref} className="relative mt-10 space-y-14 pl-9 sm:pl-12">
      <span aria-hidden="true" className="absolute bottom-2 left-[0.45rem] top-2 w-px bg-line sm:left-[0.7rem]" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY }}
        className="absolute bottom-2 left-[0.45rem] top-2 w-px origin-top bg-gradient-to-b from-accent to-accent-strong sm:left-[0.7rem]"
      />
      {children}
    </ol>
  );
}
