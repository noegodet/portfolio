import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { Reveal, Timeline } from "@/components/Reveal";
import { DraftTag, NextLink, PageShell, SectionHeading } from "@/components/ui";
import { events, mandate } from "@/content/association";
import { getDictionary } from "@/content/ui";
import { alternatesFor } from "@/lib/site";
import { isLocale, sectionPath } from "@/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/association">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.association.title,
    description: dict.association.intro,
    alternates: alternatesFor(lang, "/association"),
  };
}

export default async function AssociationPage({ params }: PageProps<"/[lang]/association">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.association;

  return (
    <PageShell>
      <SectionHeading level={1} command={t.command} title={t.title} intro={t.intro} />

      {/* ---------------------------------------------------------- Mandat */}
      <div className="mt-12 animate-rise [animation-delay:80ms]">
        <section className="grid overflow-hidden panel lg:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="font-mono text-xs text-accent">{mandate.period[lang]}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {mandate.role[lang]}
            </h2>
            <p className="mt-1 text-lg text-muted">{mandate.school}</p>
            <p className="mt-5 leading-relaxed text-fg/90">{mandate.body[lang]}</p>
            {mandate.draft && (
              <div className="mt-4">
                <DraftTag label={t.draft} />
              </div>
            )}
          </div>
          <Image
            src={mandate.photo.src}
            alt={mandate.photo.alt[lang]}
            placeholder="blur"
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-full max-h-[26rem] w-full object-cover lg:max-h-none"
          />
        </section>
      </div>

      {/* --------------------------------------------------------- Roadmap */}
      <section className="mt-24" aria-labelledby="roadmap-title">
        <Reveal>
          <div id="roadmap-title">
            <SectionHeading command="git log --events" title={t.roadmapTitle} />
          </div>
        </Reveal>

        <Timeline>
          {events.map((event) => (
            <li key={event.id} className="relative">
              {/* Jalon posé sur le rail. */}
              <span
                aria-hidden="true"
                className="absolute -left-9 top-1 flex size-[0.95rem] items-center justify-center rounded-full border-2 border-accent bg-bg sm:-left-12 sm:size-[1.45rem]"
              >
                <span className="size-1.5 rounded-full bg-accent sm:size-2" />
              </span>

              <Reveal>
                <article className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
                  <div>
                    <p className="font-mono text-sm text-accent">{event.date[lang]}</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight">{event.title[lang]}</h3>
                    <p className="mt-4 leading-relaxed text-fg/90">{event.body[lang]}</p>
                    {event.highlights.length > 0 && (
                      <ul className="mt-4 space-y-2 text-muted">
                        {event.highlights.map((highlight) => (
                          <li key={highlight.fr} className="flex gap-2">
                            <span className="text-accent" aria-hidden="true">
                              ▸
                            </span>
                            {highlight[lang]}
                          </li>
                        ))}
                      </ul>
                    )}
                    {event.draft && (
                      <div className="mt-4">
                        <DraftTag label={t.draft} />
                      </div>
                    )}
                  </div>
                  <Gallery
                    dict={dict.gallery}
                    photos={event.photos.map((photo) => ({
                      src: photo.src,
                      alt: photo.alt[lang],
                      credit: photo.credit,
                    }))}
                  />
                </article>
              </Reveal>
            </li>
          ))}
        </Timeline>

        <p className="mt-10 font-mono text-xs text-faint">{t.credit}</p>
      </section>

      <NextLink href={sectionPath("projects", lang)} command={t.nextCommand} label={t.nextLabel} />
    </PageShell>
  );
}
