"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { locales, sectionPath, sections, type Locale, type Section } from "@/i18n/config";

type TabsProps = {
  lang: Locale;
  labels: Record<Section, string>;
  navLabel: string;
};

/** Section correspondant à l'adresse courante (`/fr/experience` → "experience"). */
function sectionFromPath(pathname: string): Section {
  const segment = pathname.split("/")[2] ?? "";
  return (sections as readonly string[]).includes(segment) ? (segment as Section) : "home";
}

/** Onglets de navigation, présentés comme les onglets d'un éditeur de code. */
export function NavTabs({ lang, labels, navLabel, active }: TabsProps & { active: Section | null }) {
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Sur mobile, les onglets défilent horizontalement : on centre l'onglet actif
  // dans la barre (sans jamais faire défiler la page elle-même).
  useEffect(() => {
    const nav = navRef.current;
    const tab = activeRef.current;
    if (!nav || !tab) return;
    const tabCenter = tab.offsetLeft - nav.offsetLeft + tab.offsetWidth / 2;
    nav.scrollTo({ left: tabCenter - nav.clientWidth / 2 });
  }, [active]);

  return (
    <nav ref={navRef} aria-label={navLabel} className="-mb-px flex min-w-0 overflow-x-auto [scrollbar-width:none]">
      <ul className="flex">
        {sections.map((section, index) => {
          const isActive = section === active;
          return (
            <li key={section}>
              <Link
                ref={isActive ? activeRef : undefined}
                href={sectionPath(section, lang)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 font-mono text-[0.82rem] transition-colors sm:px-4 md:h-14 ${
                  isActive
                    ? "border-accent text-fg"
                    : "border-transparent text-muted hover:border-line hover:text-fg"
                }`}
              >
                <span className={isActive ? "text-accent" : "text-faint"} aria-hidden="true">
                  0{index + 1}
                </span>
                {labels[section]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Onglets avec l'onglet actif déduit de l'adresse. */
export function ActiveNavTabs(props: TabsProps) {
  const pathname = usePathname();
  return <NavTabs {...props} active={sectionFromPath(pathname)} />;
}

type LangSwitchProps = { lang: Locale; label: string };

/** Bascule FR / EN. `path` est le chemin après la langue (vide pour l'accueil). */
export function LangLinks({ lang, label, path }: LangSwitchProps & { path: string }) {
  return (
    <div className="flex items-center rounded-md border border-line bg-surface p-0.5 font-mono text-xs">
      {locales.map((locale) => {
        const isActive = locale === lang;
        return (
          <Link
            key={locale}
            href={`/${locale}${path}`}
            hrefLang={locale}
            lang={locale}
            aria-current={isActive ? "true" : undefined}
            title={isActive ? undefined : label}
            className={`rounded px-2 py-1 uppercase transition-colors ${
              isActive ? "bg-accent/20 text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {locale}
            {!isActive && <span className="sr-only"> — {label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

/** Bascule de langue qui conserve la page courante. */
export function LangSwitch(props: LangSwitchProps) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");
  return <LangLinks {...props} path={rest ? `/${rest}` : ""} />;
}
