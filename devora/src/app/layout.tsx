// Outermost page wrapper for the entire app — fonts, global CSS, theme script, AppWrapper.
// Flow: load fonts → set metadata → wrap every route in <html>/<body> + AppWrapper.
// Every route renders inside this layout as {children}.

import type { Metadata } from "next";

import { Press_Start_2P, Space_Mono, Unbounded } from "next/font/google";
import AppWrapper from "@/ui/theme/AppWrapper";
import "@/ui/globals.css";

// vocab: next/font/google = Next.js helper that self-hosts Google fonts efficiently
// vocab: variable = CSS custom property name we attach to <html> for Tailwind/theme
// Manipulate here: change weight arrays / font families to restyle the whole app
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

// vocab: Metadata = Next.js type for <title> / description shown in the browser tab
// Manipulate here: title/description = what Google + the browser tab show for Devora
export const metadata: Metadata = {
  title: "Devora — Connect. Collaborate. Create.",
  description: "UofM Dearborn CECS Networking Hub",
};

// Root HTML shell: fonts on <html>, theme before paint, AppWrapper around pages.
// vocab: children = whatever page/route is nested inside this layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // vocab: suppressHydrationWarning = ignore theme class mismatch before React hydrates
      // Why? Theme script may set data-theme before React boots; without this, React warns.
      suppressHydrationWarning
      // Attach font CSS variables so globals.css / Tailwind can use --font-mono etc.
      className={`${spaceMono.variable} ${unbounded.variable} ${pressStart.variable}`}
    >
      <head>
        {/*
          Set data-theme from localStorage BEFORE React paints (avoids a flash of wrong theme).
          vocab: dangerouslySetInnerHTML = inject raw JS string into the page
          vocab: localStorage.getItem("devora-theme") = saved "light" or "dark" from Settings
          Manipulate here: change default "dark" at the end to "light" for a light-first app
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("devora-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`,
          }}
        />
      </head>
      {/*
        AppWrapper adds theme context + shared chrome around every page.
        vocab: font-mono antialiased = default body font + smoother glyph edges
      */}
      <body className="font-mono antialiased">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
