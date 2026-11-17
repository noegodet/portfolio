import type { Metadata, Viewport } from "next";
import { DataFlow, PointerGlow } from "@/components/Effects";
import { MotionProvider } from "@/components/Reveal";
import { Footer, Header } from "@/components/Shell";
import { TerminalProvider, type TerminalData } from "@/components/Terminal";
import { profile, skills } from "@/content/profile";
import { getDictionary } from "@/content/ui";
import { defaultLocale, isLocale, locales, sectionPath, sections, tr, type Locale, type Section } from "@/i18n/config";
import { getCvHref } from "@/lib/cv";
import { siteUrl } from "@/lib/site";
import { fontClasses } from "../fonts";
import "../globals.css";

/** Une version du site est générée à l'avance pour chaque langue. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#0b0a10", colorScheme: "dark" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: siteUrl,
    title: { default: dict.meta.siteTitle, template: `%s — ${profile.name}` },
    description: dict.meta.description,
    authors: [{ name: profile.name }],
    openGraph: {
      type: "website",
      siteName: profile.name,
      title: dict.meta.siteTitle,
      description: dict.meta.description,
      locale: lang === "fr" ? "fr_FR" : "en_GB",
    },
  };
}

/** Prépare, dans la bonne langue, tout ce que le terminal peut afficher. */
function terminalData(lang: Locale): TerminalData {
  const dict = getDictionary(lang);
  const { links } = profile;
  return {
    lang,
    dict: dict.terminal,
    challenge: dict.challenge,
    whoami: [
      `${profile.name} — ${profile.role[lang]}`,
      `${profile.facts[0].value[lang]}, ${profile.facts[0].detail[lang]}`,
      `${profile.status[lang]} · ${profile.statusDetail[lang]}`,
    ],
    skills: skills.map((group) => ({
      title: group.title[lang],
      items: group.items.map((item) => tr(item, lang)).join(", "),
    })),
    contact: [
      { label: "email", text: links.email, href: `mailto:${links.email}` },
      { label: "linkedin", text: links.linkedin.replace("https://www.", ""), href: links.linkedin },
      { label: "github", text: links.github.replace("https://", ""), href: links.github },
    ],
    cvHref: getCvHref(lang),
    paths: Object.fromEntries(
      sections.map((section) => [section, sectionPath(section, lang)]),
    ) as Record<Section, string>,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  // Langue inconnue (ex. /de) : coquille minimale, sans navigation. La page
  // demandée déclenche alors la 404, affichée par not-found.tsx.
  if (!isLocale(lang)) {
    return (
      <html lang={defaultLocale} data-scroll-behavior="smooth" className={`${fontClasses} h-full antialiased`}>
        <body className="flex min-h-full flex-col">{children}</body>
      </html>
    );
  }

  const dict = getDictionary(lang);

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${fontClasses} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <DataFlow />
        <PointerGlow />
        <MotionProvider>
          <TerminalProvider data={terminalData(lang)}>
            <Header lang={lang} dict={dict} />
            {children}
            <Footer lang={lang} dict={dict} />
          </TerminalProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
