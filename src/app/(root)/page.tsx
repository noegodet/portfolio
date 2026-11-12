"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Page racine `/` : envoie le visiteur vers la version du site correspondant
 * à la langue de son navigateur (français par défaut pour un navigateur
 * francophone, anglais sinon). Les liens restent visibles sans JavaScript.
 */
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const browser = navigator.language.slice(0, 2).toLowerCase();
    const target = browser === defaultLocale ? defaultLocale : "en";
    router.replace(`/${target}`);
  }, [router]);

  return (
    <p className="flex gap-4 text-sm text-muted">
      {locales.map((locale) => (
        <a key={locale} href={`/${locale}`} className="uppercase underline underline-offset-4 hover:text-fg">
          {locale}
        </a>
      ))}
    </p>
  );
}
