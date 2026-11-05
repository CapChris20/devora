// Outermost page wrapper for the whole app: fonts, global CSS, theme script, and AppWrapper.
// Flow: load fonts → set the tab title → wrap every route in html/body plus AppWrapper.
// Every route renders inside this layout as children.

// ===== IMPORTS =====

import type { Metadata } from "next";

import { Press_Start_2P, Space_Mono, Unbounded } from "next/font/google";
import AppWrapper from "@/ui/shared/theme/AppWrapper";
import "@/ui/globals.css";

// ===== NAMED CONSTANTS =====

const DOCUMENT_LANGUAGE = "en";
const BODY_CLASS_NAME = "font-mono antialiased";

const SITE_TITLE = "Devora — Connect. Belong. Network.";
const SITE_DESCRIPTION = "UofM Dearborn CECS Networking Hub";

const THEME_STORAGE_KEY = "devora-theme";
const DEFAULT_THEME = "dark";
const LIGHT_THEME = "light";

// Runs before React paints so the saved theme is on the page immediately.
// Kept as one compact script on purpose: it has to run before the app loads.
// vocab: localStorage = the browser's saved key/value store for this site
const THEME_BOOT_SCRIPT = `(function(){try{var savedTheme=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.setAttribute("data-theme",savedTheme==="${LIGHT_THEME}"?"${LIGHT_THEME}":"${DEFAULT_THEME}");}catch(error){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME}");}})();`;

// vocab: next/font/google = Next.js helper that self-hosts Google fonts
// These calls stay at the top of the file, with the weights and CSS names written out.
// Next.js reads them at build time and rejects a constant or a function in their place.
// vocab: variable = CSS custom property name attached to html so Tailwind can use the font
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const unbounded = Unbounded({
  weight: ["300", "400", "600", "800"],
  subsets: ["latin"],
  variable: "--font-display",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const APP_FONT_CLASS_NAME = `${spaceMono.variable} ${unbounded.variable} ${pressStart.variable}`;

// ===== MAIN =====

// vocab: Metadata = Next.js type for the browser tab title and description
// Manipulate here: title and description are what the tab and search results show
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

/**
 * Root HTML shell. Fonts sit on html, the theme script runs before paint, and AppWrapper wraps every page.
 * @param props.children - The page for the current route
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={DOCUMENT_LANGUAGE}
      // vocab: suppressHydrationWarning = ignore a theme mismatch before React takes over
      // The theme script may set data-theme before React boots. Without this, React warns.
      suppressHydrationWarning
      className={APP_FONT_CLASS_NAME}
    >
      <head>
        {/* vocab: dangerouslySetInnerHTML = put this raw script into the page */}
        {/* Manipulate here: DEFAULT_THEME at the top flips the first-visit theme */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={BODY_CLASS_NAME}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
