import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { Chip, Icon, PageShell, SectionHeading } from "@/components/ui";
import { profile } from "@/content/profile";
import { projects, type ProjectStatus } from "@/content/projects";
import { getDictionary } from "@/content/ui";
import { alternatesFor } from "@/lib/site";
import { isLocale, raw, tr } from "@/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.projects.title,
    description: dict.projects.intro,
    alternates: alternatesFor(lang, "/projects"),
  };
}

const statusStyle: Record<ProjectStatus, string> = {
  "in-progress": "border-warn/40 bg-warn/10 text-warn",
  shipped: "border-ok/40 bg-ok/10 text-ok",
  paused: "border-line bg-raised text-muted",
};

const linkClass =
  "inline-flex items-center gap-1.5 font-mono text-xs text-accent underline decoration-line underline-offset-4 hover:decoration-accent";

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.projects;

  return (
    <PageShell>
      <SectionHeading level={1} command={t.command} title={t.title} intro={t.intro} />

      {projects.length === 0 ? (
        /* État vide : affiché tant que src/content/projects.ts ne contient aucun projet. */
        <div className="mt-12 animate-rise [animation-delay:80ms]">
          <section className="overflow-hidden panel">
            <div className="border-b border-line bg-raised/50 px-5 py-3 font-mono text-xs text-muted sm:px-7">
              <span className="text-accent">build</span> · projects
            </div>
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <ul className="space-y-1 font-mono text-sm text-muted" aria-hidden="true">
                  {t.emptyLog.map((line, index) => (
                    <li key={line} className="flex gap-3">
                      <span className={index === t.emptyLog.length - 1 ? "text-warn" : "text-ok"}>
                        {index === t.emptyLog.length - 1 ? "…" : "✓"}
                      </span>
                      {line}
                      {index === t.emptyLog.length - 1 && (
                        <span className="inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] animate-blink bg-accent" />
                      )}
                    </li>
                  ))}
                </ul>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight">{t.emptyTitle}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">{t.emptyBody}</p>
              </div>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 justify-self-start rounded-lg bg-accent-deep px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-deep/85"
              >
                {t.githubCta}
                <Icon name="external" className="size-3.5" />
              </a>
            </div>
          </section>
        </div>
      ) : (
        <ul className={`mt-12 grid gap-4 ${projects.length > 1 ? "md:grid-cols-2" : ""}`}>
          {projects.map((project, index) => (
            <li key={project.id}>
              <Reveal delay={(index % 2) * 0.08} className="h-full">
                <article className="flex h-full flex-col p-6 panel">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold tracking-tight">{tr(project.title, lang)}</h2>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] ${statusStyle[project.status]}`}
                    >
                      {t.status[project.status]}
                    </span>
                  </div>
                  {project.context && (
                    <p className="mt-1.5 font-mono text-xs text-accent">{project.context[lang]}</p>
                  )}
                  <p className="mt-4 max-w-3xl flex-1 leading-relaxed text-muted">{project.summary[lang]}</p>
                  {project.stack.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <Chip key={tr(item, "fr")} text={raw(item, lang)} />
                      ))}
                    </ul>
                  )}
                  {(project.repo || project.demo) && (
                    <p className="mt-5 flex flex-wrap gap-5">
                      {project.repo && (
                        <a href={project.repo} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {t.repo}
                          <Icon name="external" className="size-3" />
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {t.demo}
                          <Icon name="external" className="size-3" />
                        </a>
                      )}
                    </p>
                  )}
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
