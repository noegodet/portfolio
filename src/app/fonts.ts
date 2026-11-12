import { Geist, JetBrains_Mono } from "next/font/google";

/** Police du texte courant. */
export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

/** Police à chasse fixe : libellés, navigation, terminal. */
export const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

/** Classes à poser sur <html> pour rendre les deux polices disponibles. */
export const fontClasses = `${geistSans.variable} ${jetbrainsMono.variable}`;
