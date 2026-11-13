"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/ui";
import { Icon } from "./ui";

export type GalleryPhoto = { src: StaticImageData; alt: string; credit?: string };

/**
 * Galerie : une grande photo suivie de vignettes. Un clic ouvre la photo en
 * grand ; flèches du clavier pour naviguer, Échap pour fermer.
 */
export function Gallery({ photos, dict }: { photos: GalleryPhoto[]; dict: Dictionary["gallery"] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const count = photos.length;

  const show = (position: number) => {
    setIndex(position);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (offset: number) => setIndex((current) => (current + offset + count) % count),
    [count],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || count < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [count, step]);

  if (count === 0) return null;
  const current = photos[index];
  // Deux photos : côte à côte. Sinon : une grande photo puis une rangée de vignettes.
  const pair = count === 2;

  return (
    <>
      <ul className={`grid gap-2 sm:gap-3 ${pair ? "grid-cols-2" : "grid-cols-3"}`}>
        {photos.map((photo, position) => (
          <li key={photo.src.src} className={position === 0 && !pair ? "col-span-3" : undefined}>
            <button
              type="button"
              onClick={() => show(position)}
              aria-label={`${dict.open} : ${photo.alt}`}
              className="group relative block w-full overflow-hidden rounded-lg border border-line bg-raised"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                placeholder="blur"
                sizes={
                  pair
                    ? "(min-width: 1024px) 360px, 50vw"
                    : position === 0
                      ? "(min-width: 1024px) 720px, 100vw"
                      : "(min-width: 1024px) 240px, 33vw"
                }
                className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-accent-strong/0 transition-colors duration-300 group-hover:bg-accent-strong/10"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-fg backdrop:bg-black/90"
      >
        <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-8">
          <div className="pointer-events-auto relative min-h-0 w-full max-w-6xl flex-1">
            <Image
              key={current.src.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="pointer-events-auto flex w-full max-w-6xl items-center gap-3">
            <p className="min-w-0 flex-1 text-sm text-muted">
              {current.alt}
              {current.credit && (
                <span className="ml-2 font-mono text-xs text-faint">
                  {dict.credit} : {current.credit}
                </span>
              )}
            </p>
            {count > 1 && (
              <>
                <span className="font-mono text-xs text-faint" aria-hidden="true">
                  {index + 1}/{count}
                </span>
                <GalleryButton label={dict.previous} icon="left" onClick={() => step(-1)} />
                <GalleryButton label={dict.next} icon="right" onClick={() => step(1)} />
              </>
            )}
            <GalleryButton label={dict.close} icon="close" onClick={close} />
          </div>
        </div>
      </dialog>
    </>
  );
}

function GalleryButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "left" | "right" | "close";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md border border-line bg-surface p-2 text-muted transition-colors hover:border-accent/60 hover:text-fg"
    >
      <Icon name={icon} className="size-5" />
    </button>
  );
}
