import Link from "next/link";

/**
 * Contenu de la page 404. La langue du visiteur n'est pas connue quand
 * l'adresse est invalide : le message est donc affiché dans les deux langues.
 */
export function NotFoundContent() {
  const linkClass =
    "rounded-lg border border-line bg-surface px-4 py-2 transition-colors hover:border-accent/60";

  return (
    <main className="m-auto max-w-xl px-5 py-20 text-center">
      <p className="font-mono text-sm text-accent">
        <span className="mr-2 text-faint">&gt;</span>cd ./page
      </p>
      <p className="mt-2 font-mono text-sm text-warn">error 404: no such file or directory</p>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Page introuvable</h1>
      <p className="mt-2 text-xl text-muted" lang="en">
        Page not found
      </p>
      <p className="mt-10 flex justify-center gap-4 font-mono text-sm">
        <Link href="/fr" className={linkClass}>
          ← Accueil
        </Link>
        <Link href="/en" lang="en" className={linkClass}>
          ← Home
        </Link>
      </p>
    </main>
  );
}
