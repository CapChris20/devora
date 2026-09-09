// Shared page shell for inner pages — Voronoi shader background, navbar, title, footer.
// Flow: BackgroundPicture (fixed shader) → NavBar → title/description fade in → children → Footer.
// Used by account, settings, FAQs, discovery, etc. Homepage uses TopSection instead.

"use client";

// vocab: framer-motion = animation library used for the fade/slide-in PageReveal
import { motion } from "framer-motion";
// vocab: ReactNode = “anything React can render” (elements, text, fragments…)
import type { ReactNode } from "react";
import BackgroundPicture from "@/ui/backgrounds/BackgroundPicture";
import Footer from "@/ui/footer/Footer";
import NavBar from "@/ui/navbar/NavBar";

type PageLayoutProps = {
  // Passed to NavBar so the correct link is highlighted
  activeItem: string;
  // Big page heading
  title: string;
  // Gradient / color class for the title — default pink-grad
  // Manipulate here: pass titleClassName="headline-grad" (etc.) to recolor a page title
  titleClassName?: string;
  // Optional blurb under the title
  description?: string;
  // true = wider max width (discovery grid); false = default max-w-6xl
  // Manipulate here: pass wide for dense multi-column pages
  wide?: boolean;
  children?: ReactNode;
};

// Fade + slide-up wrapper used for title, description, and main content.
// delay staggers children so title → description → body cascade in.
function PageReveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      // vocab: initial = starting pose before animation; animate = ending pose
      // y: 28 = start 28px lower, then slide up to 0
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      // vocab: ease cubic-bezier = custom acceleration curve [x1,y1,x2,y2]
      // Manipulate here: raise delay / duration for a slower entrance
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function PageLayout({
  activeItem,
  title,
  titleClassName = "pink-grad",
  description,
  wide = false,
  children,
}: PageLayoutProps) {
  return (
    // page-shell = shared min-height / flex column styles from globals.css
    <main className="page-shell relative flex min-h-screen flex-col">
      {/* Full-window Voronoi + light film grain (decorative, behind content) */}
      <BackgroundPicture />
      {/* Manipulate here: opacity-[0.05] controls how visible the noise film is */}
      <div className="noise pointer-events-none fixed inset-0 z-[1] opacity-[0.05]" />

      <NavBar activeItem={activeItem} />

      {/* Main column — wider max width when wide={true} (e.g. discovery grid).
          pt-28 clears the fixed navbar; pb-24 leaves room above the footer. */}
      <div
        className={`relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pb-24 pt-28 sm:px-6 ${
          wide ? "max-w-[1400px]" : "max-w-6xl"
        }`}
      >
        {/* Page title — first thing to fade in (delay 0) */}
        <PageReveal>
          <h1 className={`font-display text-3xl font-bold sm:text-4xl ${titleClassName}`}>{title}</h1>
        </PageReveal>

        {/* Optional short description under the title — only when the page passed one.
            vocab/symbol: ? : / ternary-ish via && style — {description ? (…) : null} */}
        {description ? (
          <PageReveal delay={0.12}>
            <p className="surface-panel theme-muted mt-4 max-w-xl text-left text-sm leading-relaxed sm:text-base">
              {description}
            </p>
          </PageReveal>
        ) : null}

        {/* Page body — delay depends on whether a description was shown so the cascade stays even.
            vocab/symbol: ? : = ternary — longer delay if a description already animated */}
        {children ? <PageReveal delay={description ? 0.2 : 0.12}>{children}</PageReveal> : null}
      </div>

      {/* Footer pinned to the bottom of the flex column (mt-auto pushes it down) */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </main>
  );
}
