// Design Law fonts, loaded once and shared by every page that uses the neo-brutalist look.
// Flow: next/font downloads + self-hosts at build time → NB_FONT_CLASS_NAME sets the CSS variables
// → tailwind.config.ts maps font-nb-display / font-nb-body to those variables.

// ===== IMPORTS =====

import { Archivo_Black, Space_Grotesk } from "next/font/google";

// ===== MAIN EXPORTS =====

// These calls must stay at the top level with literal options (Next.js reads them while building).
// vocab: variable = CSS custom property name the font is attached to
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-nb-display",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nb-body",
});

// Put this on the outermost element of a Design Law page
export const NB_FONT_CLASS_NAME = `${archivoBlack.variable} ${spaceGrotesk.variable}`;
