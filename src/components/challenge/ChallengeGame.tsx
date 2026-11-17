"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import cartImage from "@/assets/challenge/cart.png";
import cupImage from "@/assets/challenge/cup.png";
import hallImage from "@/assets/challenge/hall.png";
import ramImage from "@/assets/challenge/ram.png";
import wheelBigImage from "@/assets/challenge/wheel-big.png";
import wheelSmallImage from "@/assets/challenge/wheel-small.png";
import type { Dictionary } from "@/content/ui";
import { Icon } from "../ui";
import {
  CHALLENGE_VIEW,
  ChallengeEngine,
  type ChallengeAssets,
  type ChallengeEvent,
  type ChallengeInput,
} from "./engine";

type Screen = "loading" | "intro" | "play" | "won";
type Result = { time: number; hits: number; best: number; isBest: boolean };

const BEST_KEY = "challenge-best-time";

function readBest(): number | null {
  try {
    const value = Number(window.localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeBest(time: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(time));
  } catch {
    // Stockage indisponible (navigation privée…) : le record n'est simplement pas gardé.
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** Touches du clavier → commandes du jeu (Q/A et D pour les claviers AZERTY et QWERTY). */
function inputFromKey(event: KeyboardEvent): ChallengeInput | null {
  if (event.key === " " || event.code === "Space") return "charge";
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "q" || key === "a") return "left";
  if (key === "arrowright" || key === "d") return "right";
  return null;
}

/**
 * Easter egg : mini-jeu ouvert par la commande `challenge` du terminal.
 * Plein écran dans une fenêtre modale ; Échap ou le bouton ✕ le referment.
 */
export default function ChallengeGame({
  dict,
  onClose,
}: {
  dict: Dictionary["challenge"];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ChallengeEngine | null>(null);
  const screenRef = useRef<Screen>("loading");
  const skipChargeRef = useRef(false);
  const [screen, setScreen] = useState<Screen>("loading");
  const [result, setResult] = useState<Result | null>(null);

  const show = useCallback((next: Screen) => {
    screenRef.current = next;
    setScreen(next);
  }, []);

  const start = useCallback(() => {
    engineRef.current?.start();
    setResult(null);
    show("play");
  }, [show]);

  // Ouverture de la fenêtre, chargement des images et création du moteur.
  useEffect(() => {
    const dialog = dialogRef.current;
    const canvas = canvasRef.current;
    if (!dialog || !canvas) return;
    dialog.showModal();

    let cancelled = false;
    // Moteur propre à cette ouverture : un ancien moteur (ex. double montage en
    // développement) ne doit ni continuer à tourner ni déclarer de victoire.
    let engine: ChallengeEngine | null = null;
    Promise.all(
      [cartImage, ramImage, wheelBigImage, wheelSmallImage, hallImage, cupImage].map((image) => loadImage(image.src)),
    )
      .then(([cart, ram, wheelBig, wheelSmall, hall, cup]) => {
        if (cancelled) return;
        const assets: ChallengeAssets = { cart, ram, wheelBig, wheelSmall, hall, cup };
        engine = new ChallengeEngine(canvas, assets, {
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          labels: dict.hud,
          onEvent: (event: ChallengeEvent) => {
            if (event.type !== "won" || engineRef.current !== engine) return;
            const previous = readBest();
            const isBest = previous === null || event.time < previous;
            if (isBest) writeBest(event.time);
            setResult({ time: event.time, hits: event.hits, best: isBest ? event.time : previous, isBest });
            show("won");
          },
        });
        engineRef.current = engine;
        engine.run();
        show("intro");
      })
      .catch(() => {
        if (!cancelled) onClose();
      });

    // Pause quand l'onglet du navigateur est masqué.
    const onVisibility = () => {
      if (document.hidden) engineRef.current?.stop();
      else engineRef.current?.run();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      engine?.stop();
      if (engineRef.current === engine) engineRef.current = null;
      if (dialog.open) dialog.close();
    };
  }, [dict.hud, onClose, show]);

  // Clavier
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const input = inputFromKey(event);
      if (!input) return;
      if (input === "charge") {
        event.preventDefault();
        if (event.repeat) return;
        // Sur l'écran d'accueil ou de victoire, Espace lance la partie.
        if (screenRef.current === "intro" || screenRef.current === "won") {
          skipChargeRef.current = true;
          start();
          return;
        }
      }
      if (screenRef.current === "play") engineRef.current?.setInput(input, true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const input = inputFromKey(event);
      if (!input) return;
      if (input === "charge") {
        event.preventDefault();
        if (skipChargeRef.current) {
          skipChargeRef.current = false;
          return;
        }
      }
      engineRef.current?.setInput(input, false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [start]);

  // Commandes tactiles : appui maintenu = touche enfoncée.
  const press = useCallback((input: ChallengeInput, down: boolean) => {
    engineRef.current?.setInput(input, down);
  }, []);

  const touchButton =
    "flex select-none items-center justify-center rounded-xl border border-line bg-surface/90 font-mono text-sm text-fg active:border-accent active:bg-accent/25 [touch-action:none]";

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-label={dict.title}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-0 text-fg backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 p-3 sm:p-6">
        <div className="flex w-full max-w-[min(100%,calc((100dvh-9rem)*16/9))] items-center justify-between gap-4">
          <p className="font-mono text-xs text-accent">
            <span className="text-faint">&gt;</span> challenge
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.close}
            title={dict.close}
            className="rounded-md border border-line bg-surface p-2 text-muted transition-colors hover:border-accent/60 hover:text-fg"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>

        <div
          className="relative w-full max-w-[min(100%,calc((100dvh-9rem)*16/9))] overflow-hidden rounded-xl border border-line shadow-[0_30px_120px_-20px_rgb(139_92_246/0.5)]"
          style={{ aspectRatio: `${CHALLENGE_VIEW.width} / ${CHALLENGE_VIEW.height}` }}
        >
          <canvas ref={canvasRef} className="block size-full bg-[#2f86d8]" />

          {screen === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg font-mono text-sm text-muted">
              {dict.loading}
            </div>
          )}

          {screen === "intro" && (
            <Overlay>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{dict.kicker}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{dict.title}</h2>
              <p className="mt-3 max-w-md text-muted">{dict.tagline}</p>
              <ul className="mt-5 space-y-1.5 text-left font-mono text-xs text-fg/90 sm:text-sm">
                <li>
                  <span className="text-accent">▸</span> {dict.controlsMove}
                </li>
                <li>
                  <span className="text-accent">▸</span> {dict.controlsCharge}
                </li>
              </ul>
              <button type="button" onClick={start} className={primaryButton}>
                {dict.start}
              </button>
              <p className="mt-2 font-mono text-xs text-faint">{dict.startHint}</p>
            </Overlay>
          )}

          {screen === "won" && result && (
            <Overlay>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-warn">{dict.kicker}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{dict.won}</h2>
              <p className="mt-3 text-muted">
                {fill(dict.stats, { time: result.time.toFixed(1), hits: result.hits })}
              </p>
              <p className="mt-1 font-mono text-sm text-accent">
                {result.isBest ? dict.newBest : fill(dict.best, { time: result.best.toFixed(1) })}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={start} className={primaryButton.replace("mt-6 ", "")}>
                  {dict.replay}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/60"
                >
                  {dict.quit}
                </button>
              </div>
            </Overlay>
          )}
        </div>

        {/* Commandes tactiles (écrans sans souris) */}
        {screen === "play" && (
          <div className="hidden w-full max-w-[min(100%,calc((100dvh-9rem)*16/9))] gap-3 pointer-coarse:flex">
            <HoldButton input="left" onPress={press} label={dict.touchLeft} className={`${touchButton} h-16 w-20`}>
              ◀
            </HoldButton>
            <HoldButton input="right" onPress={press} label={dict.touchRight} className={`${touchButton} h-16 w-20`}>
              ▶
            </HoldButton>
            <HoldButton input="charge" onPress={press} className={`${touchButton} h-16 flex-1`}>
              {dict.touchCharge}
            </HoldButton>
          </div>
        )}

        {screen === "play" && (
          <p className="hidden font-mono text-xs text-faint pointer-fine:block">
            {dict.controlsMove} · {dict.controlsCharge} · {dict.quitHint}
          </p>
        )}
      </div>
    </dialog>
  );
}

const primaryButton =
  "mt-6 rounded-lg bg-accent-deep px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-deep/85";

/** Bouton tactile : enfoncé tant que le doigt reste dessus. */
function HoldButton({
  input,
  onPress,
  label,
  className,
  children,
}: {
  input: ChallengeInput;
  onPress: (input: ChallengeInput, down: boolean) => void;
  label?: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(input, true);
      }}
      onPointerUp={() => onPress(input, false)}
      onPointerCancel={() => onPress(input, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/75 p-6 text-center backdrop-blur-[2px]">
      {children}
    </div>
  );
}
