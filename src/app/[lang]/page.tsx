import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import portrait from "@/assets/portrait.webp";
import { Scramble } from "@/components/Effects";
import { Reveal } from "@/components/Reveal";
import { Chip, Icon, NextLink, PageShell, Prompt, SectionHeading, StatusBadge } from "@/components/ui";
import { education, profile, skills } from "@/content/profile";
import { getDictionary } from "@/content/ui";
import { isLocale, sectionPath, raw, tr } from "@/i18n/config";
import { getCvHref } from "@/lib/cv";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { alternates: alternatesFor(lang) } : {};
}

const buttonBase =
  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors";
const buttonGhost = `${buttonBase} border border-line bg-surface text-fg hover:border-accent/60`;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.home;
  const cvHref = getCvHref(lang);
  const { links } = profile;

  return (
    <PageShell>
      {/* ------------------------------------------------------------ Hero */}
      <section className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
        <div>
          <Prompt command={t.command} typed />
          <h1 className="mt-4 animate-rise text-5xl font-semibold tracking-tight sm:text-7xl">
            <Scramble key={profile.name} text={profile.name} />
          </h1>
          <p className="mt-4 animate-rise text-xl text-muted text-balance [animation-delay:40ms] sm:text-2xl">
            {profile.role[lang]}
          </p>
          <div className="mt-7 animate-rise [animation-delay:80ms]">
            <StatusBadge label={profile.status[lang]} detail={profile.statusDetail[lang]} />
          </div>
          <p className="mt-7 max-w-2xl animate-rise text-base leading-relaxed text-muted text-pretty [animation-delay:120ms] sm:text-lg">
            {profile.summary[lang]}
          </p>

          <ul className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:160ms]">
            <li>
              {cvHref ? (
                <a
                  href={cvHref}
                  download
                  className={`${buttonBase} bg-accent-deep text-white hover:bg-accent-deep/85`}
                >
                  <Icon name="download" />
                  {t.downloadCv}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className={`${buttonBase} cursor-not-allowed border border-dashed border-line text-faint`}
                >
                  <Icon name="download" />
                  {t.cvSoon}
                </span>
              )}
            </li>
            <li>
              <a href={`mailto:${links.email}`} className={buttonGhost}>
                <Icon name="mail" className="size-4 text-accent" />
                {t.email}
              </a>
            </li>
            <li>
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className={buttonGhost}>
                LinkedIn
                <Icon name="external" className="size-3.5 text-accent" />
              </a>
            </li>
            <li>
              <a href={links.github} target="_blank" rel="noopener noreferrer" className={buttonGhost}>
                GitHub
                <Icon name="external" className="size-3.5 text-accent" />
              </a>
            </li>
          </ul>
        </div>

        {/* Portrait, cadré comme une détection de vision par ordinateur. */}
        <div className="relative mx-auto w-full max-w-[18rem] animate-rise [animation-delay:100ms] lg:mr-0 lg:max-w-[21rem]">
          <div
            aria-hidden="true"
            className="absolute inset-x-4 bottom-0 top-12 rounded-full bg-accent-strong/40 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-raised/30 via-surface/60 to-accent-strong/25">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:28px_28px]"
            />
            <Image
              src={portrait}
              alt={t.portraitAlt}
              preload
              fetchPriority="high"
              sizes="(min-width: 1024px) 336px, 288px"
              className="relative mt-8 w-full"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute -left-2 -top-2 size-6 rounded-tl-lg border-l-2 border-t-2 border-accent"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-2 -right-2 size-6 rounded-br-lg border-b-2 border-r-2 border-accent"
          />
          <span
            aria-hidden="true"
            className="absolute -top-2 left-6 -translate-y-1/2 rounded bg-accent px-2 py-0.5 font-mono text-[0.7rem] font-medium text-bg"
          >
            noe_godet 0.99
          </span>
        </div>
      </section>

      {/* ----------------------------------------------------- Faits clés */}
      <Reveal className="mt-16">
        <dl className="grid overflow-hidden panel sm:grid-cols-3 sm:divide-x sm:divide-line">
          {profile.facts.map((fact) => (
            <div key={fact.label.fr} className="border-b border-line p-5 last:border-b-0 sm:border-b-0">
              <dt className="label-mono">{fact.label[lang]}</dt>
              <dd className="mt-2">
                <span className="block font-medium text-fg">{fact.value[lang]}</span>
                <span className="mt-0.5 block text-sm text-muted">{fact.detail[lang]}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* ---------------------------------------------------- Compétences */}
      <section className="mt-24" aria-labelledby="skills-title">
        <Reveal>
          <div id="skills-title">
            <SectionHeading command={t.skillsCommand} title={t.skillsTitle} />
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((group, index) => (
            <Reveal
              key={group.title.fr}
              delay={(index % 4) * 0.09}
              className={group.wide ? "sm:col-span-2" : undefined}
            >
              <div
                className={`h-full p-5 panel ${
                  group.highlight ? "border-accent/50 bg-accent/10 shadow-[0_0_40px_-12px_rgb(139_92_246/0.6)]" : ""
                }`}
              >
                <h3 className={`label-mono ${group.highlight ? "text-accent" : ""}`}>
                  {group.title[lang]}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Chip key={tr(item, "fr")} text={raw(item, lang)} />
                  ))}
                </ul>
                {group.note && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{group.note[lang]}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Formation */}
      <section className="mt-24" aria-labelledby="education-title">
        <Reveal>
          <div id="education-title">
            <SectionHeading command={t.educationCommand} title={t.educationTitle} />
          </div>
        </Reveal>
        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {education.map((school, index) => (
            <li key={school.school}>
              <Reveal delay={index * 0.13} className="h-full">
                <article className="flex h-full flex-col p-6 panel">
                  <div className="flex h-16 items-center justify-between gap-4">
                    <Image
                      src={school.logo}
                      alt={`Logo ${school.school}`}
                      sizes="160px"
                      className="h-full max-h-14 w-auto max-w-[10rem] object-contain object-left opacity-90"
                    />
                    {school.current && (
                      <span className="rounded-full border border-ok/40 bg-ok/10 px-2.5 py-0.5 font-mono text-[0.7rem] text-ok">
                        {t.current}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 font-mono text-xs text-accent">{school.period[lang]}</p>
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug">{school.title[lang]}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {school.school} · {school.city[lang]}
                  </p>
                  {school.description && (
                    <p className="mt-4 text-sm leading-relaxed text-muted">{school.description[lang]}</p>
                  )}
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <NextLink href={sectionPath("experience", lang)} command={t.nextCommand} label={t.nextLabel} />
    </PageShell>
  );
}
