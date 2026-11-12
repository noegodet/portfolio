import Link from "next/link";
import { ViewTransition, type CSSProperties, type ReactNode } from "react";

/** Enveloppe de chaque page : largeur, marges et transition d'entrée/sortie. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-10 sm:px-8 md:pt-16">
        {children}
      </main>
    </ViewTransition>
  );
}

/** Ligne d'invite de commande : `> commande`. */
export function Prompt({
  command,
  typed = false,
  className = "",
}: {
  command: string;
  typed?: boolean;
  className?: string;
}) {
  return (
    <p className={`font-mono text-sm text-accent ${className}`} aria-hidden="true">
      <span className="mr-2 select-none text-faint">&gt;</span>
      <span
        className={typed ? "typed" : undefined}
        style={typed ? ({ "--chars": command.length } as CSSProperties) : undefined}
      >
        {command}
      </span>
      {typed && (
        <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-blink bg-accent" />
      )}
    </p>
  );
}

/** Titre de page ou de section précédé de son invite de commande. */
export function SectionHeading({
  command,
  title,
  intro,
  level = 2,
}: {
  command: string;
  title: string;
  intro?: string;
  level?: 1 | 2;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <div className="max-w-3xl">
      <Prompt command={command} />
      <Tag
        className={
          level === 1
            ? "mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            : "mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        }
      >
        {title}
      </Tag>
      {intro && <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">{intro}</p>}
    </div>
  );
}

/** Étiquette de techno ou de compétence. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-md border border-line bg-raised/70 px-2.5 py-1 font-mono text-[0.8rem] leading-5 text-fg/90">
      {children}
    </li>
  );
}

/** Pastille de statut avec point vert animé. */
export function StatusBadge({ label, detail }: { label: string; detail: string }) {
  return (
    <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm sm:rounded-full">
      <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-ok" />
        <span className="relative inline-flex size-2.5 rounded-full bg-ok" />
      </span>
      <span className="font-medium text-fg">{label}</span>
      <span className="font-mono text-xs text-muted">{detail}</span>
    </p>
  );
}

/** Étiquette « texte provisoire », affichée sur les contenus marqués `draft`. */
export function DraftTag({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-md border border-dashed border-warn/50 bg-warn/10 px-2.5 py-1 font-mono text-xs text-warn">
      <span aria-hidden="true">✎</span>
      {label}
    </p>
  );
}

/** Lien « page suivante » en bas de page, formulé comme une commande. */
export function NextLink({
  href,
  command,
  label,
}: {
  href: string;
  command: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group mt-20 flex items-center justify-between gap-6 panel px-6 py-5 transition-colors hover:border-accent/60"
    >
      <span>
        <span className="font-mono text-sm text-accent" aria-hidden="true">
          <span className="mr-2 text-faint">&gt;</span>
          {command}
        </span>
        <span className="mt-1 block text-lg font-medium">{label}</span>
      </span>
      <span
        aria-hidden="true"
        className="font-mono text-2xl text-accent transition-transform duration-300 group-hover:translate-x-1.5"
      >
        →
      </span>
    </Link>
  );
}

/* --- Icônes (traits simples, héritent de la couleur du texte) ------------- */
type IconName = "download" | "mail" | "external" | "terminal" | "close" | "left" | "right";

const iconPaths: Record<IconName, ReactNode> = {
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  external: <path d="M9 7h8v8M17 7 7 17" />,
  terminal: <path d="m5 8 4 4-4 4m7 0h7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
};

export function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {iconPaths[name]}
    </svg>
  );
}
