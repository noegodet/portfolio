"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import type { Dictionary } from "@/content/ui";
import { isLocale, type Locale, type Section } from "@/i18n/config";
import { Icon } from "./ui";

/** Données déjà traduites, préparées côté serveur par le layout. */
export type TerminalData = {
  lang: Locale;
  dict: Dictionary["terminal"];
  whoami: string[];
  skills: { title: string; items: string }[];
  contact: { label: string; text: string; href: string }[];
  cvHref: string | null;
  paths: Record<Section, string>;
};

type Line = {
  id: number;
  kind: "input" | "text" | "success" | "error" | "link" | "row";
  text: string;
  label?: string;
  href?: string;
};

type NewLine = Omit<Line, "id">;

/** Nom canonique de chaque commande → ses alias acceptés. */
const commands = {
  help: ["help", "aide", "?", "ls"],
  whoami: ["whoami"],
  skills: ["skills", "competences", "compétences"],
  home: ["home", "accueil"],
  experience: ["experience", "experiences", "expériences", "exp"],
  asso: ["asso", "association", "bde"],
  projects: ["projects", "projets", "project"],
  contact: ["contact", "email", "mail"],
  cv: ["cv", "resume"],
  lang: ["lang", "langue", "language"],
  clear: ["clear", "cls"],
  exit: ["exit", "quit", "close"],
} as const;

type Command = keyof typeof commands;

const commandNames = Object.keys(commands) as Command[];

const suggestions: Command[] = ["whoami", "experience", "asso", "projects", "contact", "cv", "help"];

function resolve(word: string): Command | null {
  return commandNames.find((name) => (commands[name] as readonly string[]).includes(word)) ?? null;
}

const TerminalContext = createContext<{ open: () => void } | null>(null);

/** Donne accès à l'ouverture du terminal depuis n'importe quel composant client. */
export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) throw new Error("useTerminal doit être utilisé dans <TerminalProvider>.");
  return context;
}

export function TerminalProvider({ data, children }: { data: TerminalData; children: ReactNode }) {
  const { dict } = data;
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Raccourci global Ctrl+K (ou ⌘K sur Mac) : ouvre ou ferme le terminal.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => () => void (closeTimer.current && clearTimeout(closeTimer.current)), []);

  // Garde la dernière ligne visible.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const print = useCallback((...added: NewLine[]) => {
    setLines((current) => [...current, ...added.map((line) => ({ ...line, id: nextId.current++ }))]);
  }, []);

  const goTo = useCallback(
    (path: string) => {
      print({ kind: "success", text: `${dict.opening} ${path}` });
      router.push(path);
      closeTimer.current = setTimeout(close, 450);
    },
    [close, dict.opening, print, router],
  );

  const run = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const [word, ...args] = text.toLowerCase().split(/\s+/);
      const command = resolve(word);

      setHistory((current) => [...current, text]);
      setHistoryIndex(null);
      setValue("");

      if (command === "clear") {
        setLines([]);
        return;
      }

      print({ kind: "input", text });

      switch (command) {
        case "help":
          print(...commandNames.map((name) => ({ kind: "row" as const, label: name, text: dict.help[name] })));
          break;
        case "whoami":
          print(...data.whoami.map((line) => ({ kind: "text" as const, text: line })));
          break;
        case "skills":
          print(...data.skills.map((group) => ({ kind: "row" as const, label: group.title, text: group.items })));
          break;
        case "contact":
          print(...data.contact.map((entry) => ({ kind: "link" as const, ...entry })));
          break;
        case "home":
          goTo(data.paths.home);
          break;
        case "experience":
          goTo(data.paths.experience);
          break;
        case "asso":
          goTo(data.paths.association);
          break;
        case "projects":
          goTo(data.paths.projects);
          break;
        case "cv":
          if (data.cvHref) {
            print({ kind: "success", text: dict.cvOpening });
            window.open(data.cvHref, "_blank", "noopener");
          } else {
            print({ kind: "error", text: dict.cvMissing });
          }
          break;
        case "lang": {
          const target = args[0];
          if (!target || !isLocale(target)) {
            print({ kind: "error", text: dict.langUsage });
            break;
          }
          // /fr/experience → /en/experience : on ne remplace que la langue.
          const rest = window.location.pathname.split("/").slice(2).join("/");
          print({ kind: "success", text: dict.langSwitch });
          router.push(`/${target}${rest ? `/${rest}` : ""}`);
          closeTimer.current = setTimeout(close, 450);
          break;
        }
        case "exit":
          close();
          break;
        default:
          print({ kind: "error", text: `${dict.unknown} : ${word} — ${dict.tryHelp}` });
      }
    },
    [close, data, dict, goTo, print, router],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(value);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" && value.trim()) {
      const matches = commandNames.filter((name) => name.startsWith(value.trim().toLowerCase()));
      if (matches.length === 1) {
        event.preventDefault();
        setValue(matches[0] === "lang" ? "lang " : matches[0]);
      }
    } else if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setValue(history[index]);
    } else if (event.key === "ArrowDown" && historyIndex !== null) {
      event.preventDefault();
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(index);
        setValue(history[index]);
      }
    }
  };

  // Un clic sur le fond assombri (hors de la fenêtre) ferme le terminal.
  const onDialogClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <TerminalContext value={{ open }}>
      {children}
      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-label={dict.title}
        className="mx-auto mt-[10vh] mb-auto w-[min(44rem,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-xl border border-line bg-surface p-0 text-fg shadow-[0_30px_120px_-20px_rgb(139_92_246/0.45)] backdrop:bg-black/65 backdrop:backdrop-blur-sm open:animate-rise"
      >
        <div className="flex items-center justify-between border-b border-line bg-raised/60 px-4 py-2.5">
          <p className="font-mono text-xs text-muted">
            <span className="text-accent">noe@portfolio</span>:~ — {dict.title}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={dict.help.exit}
            className="rounded p-1 text-muted transition-colors hover:bg-line hover:text-fg"
          >
            <Icon name="close" />
          </button>
        </div>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          className="max-h-[42vh] min-h-32 overflow-y-auto px-4 py-3 font-mono text-[0.82rem] leading-6"
        >
          <p className="text-muted">{dict.welcome}</p>
          {lines.map((line) => (
            <TerminalLine key={line.id} line={line} />
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line px-4 py-3">
          <span className="font-mono text-sm text-accent" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onInputKeyDown}
            aria-label={dict.inputLabel}
            placeholder={dict.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg caret-accent outline-none placeholder:text-faint"
          />
        </form>

        <div className="border-t border-line bg-raised/40 px-4 py-3">
          <p className="label-mono">{dict.suggestions}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    run(name);
                    inputRef.current?.focus();
                  }}
                  className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs text-fg/90 transition-colors hover:border-accent/60 hover:text-accent"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 hidden font-mono text-[0.7rem] text-faint sm:block">{dict.hint}</p>
        </div>
      </dialog>
    </TerminalContext>
  );
}

function TerminalLine({ line }: { line: Line }) {
  switch (line.kind) {
    case "input":
      return (
        <p className="mt-2 text-fg">
          <span className="mr-2 text-accent">&gt;</span>
          {line.text}
        </p>
      );
    case "row":
      return (
        <p className="flex gap-3">
          <span className="w-28 shrink-0 text-accent sm:w-56">{line.label}</span>
          <span className="text-muted">{line.text}</span>
        </p>
      );
    case "link":
      return (
        <p className="flex gap-3">
          <span className="w-28 shrink-0 text-accent">{line.label}</span>
          <a href={line.href} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
            {line.text}
          </a>
        </p>
      );
    case "success":
      return <p className="text-ok">{line.text}</p>;
    case "error":
      return <p className="text-warn">{line.text}</p>;
    default:
      return <p className="text-muted">{line.text}</p>;
  }
}

/** Bouton d'en-tête qui ouvre le terminal. */
export function TerminalButton({ label }: { label: string }) {
  const { open } = useTerminal();
  return (
    <button
      type="button"
      onClick={open}
      title={`${label} (Ctrl+K)`}
      aria-keyshortcuts="Control+K"
      className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/60 hover:text-fg"
    >
      <Icon name="terminal" className="size-4 text-accent" />
      <span className="sr-only">{label}</span>
      <kbd className="hidden font-mono sm:inline">Ctrl K</kbd>
    </button>
  );
}
