// Shared page shell for inner pages — pyramid shader background, navbar, title, footer.
// Flow: BackgroundPicture (fixed shader) → NavBar → centered 3D title/description → children → Footer.
// compact=true shrinks the title chrome and skips the site footer so a dense page (account)
// can sit in one viewport — same idea as landing chapters using min-height: 100dvh.
// Used by account, settings, FAQs, discovery, etc. Homepage uses TopSection instead.

"use client";

// vocab: framer-motion = animation library used for the fade/slide-in PageReveal
import { motion } from "framer-motion";
// vocab: ReactNode = “anything React can render” (elements, text, fragments…)
import type { ReactNode } from "react";
import BackgroundPicture, {
  type PageBackgroundVariant,
} from "@/ui/shared/backgrounds/BackgroundPicture";
import Footer from "@/ui/shared/footer/Footer";
import NavBar from "@/ui/shared/navbar/NavBar";

type PageLayoutProps = {
  // Passed to NavBar so the correct link is highlighted
  activeItem: string;
  // Big page heading (My Profile, Settings, …)
  title: string;
  // Soft page-title fill class — default page-title-grad (calm white→rose)
  // Manipulate here: pass titleClassName only if you need a one-off tint; prefer page-title-grad
  titleClassName?: string;
  // Optional blurb under the title
  description?: string;
  // true = wider max width (discovery grid); false = default max-w-6xl
  // Manipulate here: pass wide for dense multi-column pages
  wide?: boolean;
  // true = tighter title + padding so dense pages (account) fit one viewport
  // Manipulate here: pass compact on pages that should not scroll just to see the first screen
  compact?: boolean;
  // Which full-screen shader sits behind the glass. Default is the pyramid scales.
  // Manipulate here: "voronoi" = the older crystal-cell field
  background?: PageBackgroundVariant;
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
  titleClassName = "page-title-grad",
  description,
  wide = false,
  compact = false,
  background = "pyramid",
  children,
}: PageLayoutProps) {
  return (
    // page-shell = shared min-height / flex column styles from globals.css
    <main className="page-shell relative flex min-h-screen flex-col">
      {/* Full-window shader + light film grain (decorative, behind content) */}
      <BackgroundPicture variant={background} />
      {/* Manipulate here: opacity-[0.05] controls how visible the noise film is */}
      <div className="noise pointer-events-none fixed inset-0 z-[1] opacity-[0.05]" />

      <NavBar activeItem={activeItem} />

      {/* Main column — wider max width when wide={true} (e.g. discovery grid).
          Default pt-28 clears the fixed navbar; compact uses .page-layout-compact instead.
          Manipulate here: compact padding lives in globals.css (.page-layout-compact) */}
      <div
        className={`relative z-10 mx-auto flex w-full flex-1 flex-col px-4 sm:px-6 ${
          compact ? "page-layout-compact" : "pb-8 pt-28"
        } ${wide ? "max-w-[1400px]" : "max-w-6xl"}`}
      >
        {/* Centered page header — glass rectangle + title (+ optional description).
            Styles: .page-header / .page-header-glass / .page-title-* in globals.css */}
        <PageReveal>
          <header className="page-header">
            {/* Soft glow behind the glass panel */}
            <div className="page-header-glow" aria-hidden="true" />

            {/* Glass rectangle — readable over Voronoi; rectangle not a pill.
                Manipulate here: .page-header-glass padding/radius in globals.css */}
            <div className="page-header-glass">
              {/* Back = extruded shadow letters; front = readable gradient.
                  vocab: aria-hidden on depth = screen readers only hear the fill once */}
              <h1 className="page-title-stack font-display">
                <span className="page-title-depth" aria-hidden="true">
                  {title}
                </span>
                <span className={`page-title-fill ${titleClassName}`}>{title}</span>
              </h1>

              {description ? (
                <p className="page-header-desc">{description}</p>
              ) : null}
            </div>
          </header>
        </PageReveal>

        {/* Page body — slight delay so the header lands first, then content rises under it.
            vocab/symbol: ? : = ternary — longer delay if a description already animated */}
        {children ? <PageReveal delay={description ? 0.16 : 0.1}>{children}</PageReveal> : null}
      </div>

      {/* Site footer — skipped on compact pages so the body can fit one screen.
          Navbar already links to FAQs / account; landing chapters work the same way. */}
      {compact ? null : (
        <div className="relative z-10 mt-auto">
          <Footer />
        </div>
      )}
    </main>
  );
}
