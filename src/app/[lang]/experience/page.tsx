import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { Chip, NextLink, PageShell, SectionHeading } from "@/components/ui";
import { experiences } from "@/content/experiences";
import { getDictionary } from "@/content/ui";
import { alternatesFor } from "@/lib/site";
import { isLocale, sectionPath, tr } from "@/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/experience">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.experience.title,
    description: dict.experience.intro,
    alternates: alternatesFor(lang, "/experience"),
  };
}

/** La première fiche, visible dès l'arrivée, s'affiche sans attendre ; les suivantes apparaissent au défilement. */
function ExperienceFrame({ first, children }: { first: boolean; children: ReactNode }) {
  return first ? (
    <div className="animate-rise [animation-delay:80ms]">{children}</div>
  ) : (
    <Reveal>{children}</Reveal>
  );
}

export default async function ExperiencePage({ params }: PageProps<"/[lang]/experience">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.experience;

  return (
    <PageShell>
      <SectionHeading level={1} command={t.command} title={t.title} intro={t.intro} />

      <div className="mt-12 space-y-8">
        {experiences.map((experience, index) => (
          <ExperienceFrame key={experience.id} first={index === 0}>
            <article className="overflow-hidden panel">
              {/* Barre de titre façon fenêtre de journal d'exécution. */}
              <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line bg-raised/50 px-5 py-3 font-mono text-xs sm:px-7">
                <p className="text-muted">
                  <span className="text-accent">run</span> #{experiences.length - index} ·{" "}
                  {experience.company.toLowerCase().replaceAll(" ", "-")}
                </p>
                <p className="text-muted">
                  {experience.period[lang]} <span className="text-faint">·</span>{" "}
                  <span className="text-fg">{experience.duration[lang]}</span>
                </p>
              </header>

              <div className="p-5 sm:p-7">
                <h2 className="text-2xl font-semibold tracking-tight text-balance">
                  {experience.role[lang]}
                </h2>
                <p className="mt-1.5 text-lg text-accent">
                  {experience.company}
                  <span className="text-muted"> · {experience.location[lang]}</span>
                </p>
                <p className="mt-3 text-muted">{experience.context[lang]}</p>

                {experience.metric && (
                  <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-accent/40 bg-accent/10 px-5 py-4">
                    <span className="font-mono text-2xl text-muted line-through decoration-faint sm:text-3xl">
                      {experience.metric.before[lang]}
                    </span>
                    <span className="font-mono text-2xl text-accent sm:text-3xl" aria-hidden="true">
                      →
                    </span>
                    <span className="font-mono text-3xl font-semibold text-fg sm:text-4xl">
                      {experience.metric.after[lang]}
                    </span>
                    <span className="w-full text-sm text-muted sm:w-auto">
                      {experience.metric.caption[lang]}
                    </span>
                  </p>
                )}

                <h3 className="mt-7 label-mono">{t.missions}</h3>
                <ul className="mt-3 space-y-3">
                  {experience.missions.map((mission) => (
                    <li key={mission.fr} className="flex gap-3 leading-relaxed text-fg/90">
                      <span className="mt-[0.35rem] font-mono text-xs text-accent" aria-hidden="true">
                        ▸
                      </span>
                      <span>{mission[lang]}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-7 label-mono">{t.stack}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {experience.stack.map((item) => (
                    <Chip key={tr(item, "fr")}>{tr(item, lang)}</Chip>
                  ))}
                </ul>
                {experience.stackNote && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-accent">
                    <span aria-hidden="true">✦</span>
                    {experience.stackNote[lang]}
                  </p>
                )}
              </div>
            </article>
          </ExperienceFrame>
        ))}
      </div>

      <NextLink href={sectionPath("association", lang)} command={t.nextCommand} label={t.nextLabel} />
    </PageShell>
  );
}
