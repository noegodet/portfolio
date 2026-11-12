import Link from "next/link";
import { Suspense } from "react";
import { profile } from "@/content/profile";
import type { Dictionary } from "@/content/ui";
import { sections, type Locale, type Section } from "@/i18n/config";
import { ActiveNavTabs, LangLinks, LangSwitch, NavTabs } from "./Nav";
import { TerminalButton } from "./Terminal";

function tabLabels(dict: Dictionary): Record<Section, string> {
  return Object.fromEntries(sections.map((section) => [section, dict.nav[section]])) as Record<
    Section,
    string
  >;
}

/** En-tête fixe : marque, onglets, bascule de langue et bouton du terminal. */
export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const tabs = { lang, labels: tabLabels(dict), navLabel: dict.nav.label };
  const langSwitch = { lang, label: dict.nav.switchLang };

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md"
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent-deep focus:px-3 focus:py-1.5 focus:text-sm focus:text-white"
      >
        {dict.nav.skipToContent}
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-5 sm:px-8">
        <Link
          href={`/${lang}`}
          className="flex h-12 items-center font-mono text-sm font-medium text-fg md:h-14"
        >
          <span className="text-accent">~/</span>noe-godet
        </Link>

        {/* Sur mobile, les onglets passent sur une seconde ligne défilable. */}
        <div className="order-last -mx-5 w-[calc(100%+2.5rem)] border-t border-line px-2 md:order-none md:mx-0 md:w-auto md:border-0 md:px-0">
          <Suspense fallback={<NavTabs {...tabs} active={null} />}>
            <ActiveNavTabs {...tabs} />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<LangLinks {...langSwitch} path="" />}>
            <LangSwitch {...langSwitch} />
          </Suspense>
          <TerminalButton label={dict.nav.openTerminal} />
        </div>
      </div>
    </header>
  );
}

/** Pied de page façon barre d'état d'éditeur. */
export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { links, status, statusDetail, name } = profile;
  const contact = [
    { label: dict.home.email, href: `mailto:${links.email}` },
    { label: "LinkedIn", href: links.linkedin },
    { label: "GitHub", href: links.github },
  ];

  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 font-mono text-xs text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-ok" aria-hidden="true" />
            <span>
              {status[lang]} — {statusDetail[lang]}
            </span>
          </p>
          <p className="text-faint">
            © 2026 {name} · {dict.footer.builtWith}
          </p>
        </div>
        <ul className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
          {contact.map((entry) => (
            <li key={entry.label}>
              <a
                href={entry.href}
                {...(entry.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
              >
                {entry.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
