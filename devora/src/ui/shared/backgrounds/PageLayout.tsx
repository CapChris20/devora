// Shared page shell for inner pages — shader background, navbar, title, and footer.
// Flow: BackgroundPicture → NavBar → staggered title and body → Footer unless compact.
// compact shrinks the title chrome and skips the footer so a dense page can fit one viewport.
// Used by account, settings, FAQs, and discovery. The homepage uses TopSection instead.

"use client";

// ===== IMPORTS =====

import type { ReactNode } from "react";

import BackgroundPicture, {
  type PageBackgroundVariant,
} from "@/ui/shared/backgrounds/BackgroundPicture";
import Footer from "@/ui/shared/footer/Footer";
import NavBar from "@/ui/shared/navbar/NavBar";
// vocab: Framer Motion = animation library. motion.div is a div that can fade and slide.
import { motion } from "framer-motion";

// ===== NAMED CONSTANTS =====

const DEFAULT_TITLE_CLASS_NAME = "page-title-grad";
const DEFAULT_BACKGROUND_VARIANT = "pyramid" as const;
const DEFAULT_IS_WIDE = false;
const DEFAULT_IS_COMPACT = false;

const PAGE_REVEAL_HIDDEN_OPACITY = 0;
const PAGE_REVEAL_VISIBLE_OPACITY = 1;
const PAGE_REVEAL_START_OFFSET_Y = 28;
const PAGE_REVEAL_RESTING_OFFSET_Y = 0;
const PAGE_REVEAL_DURATION_SECONDS = 0.8;
const PAGE_REVEAL_DEFAULT_DELAY_SECONDS = 0;
// vocab: cubic-bezier = custom acceleration curve [x1, y1, x2, y2]
// Manipulate here: raise duration or delay for a slower entrance
const PAGE_REVEAL_EASE_CURVE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const PAGE_REVEAL_DELAY_WITH_DESCRIPTION_SECONDS = 0.16;
const PAGE_REVEAL_DELAY_WITHOUT_DESCRIPTION_SECONDS = 0.1;

const PAGE_SHELL_CLASS = "page-shell relative flex min-h-screen flex-col";
const NOISE_LAYER_CLASS = "noise pointer-events-none fixed inset-0 z-[1] opacity-[0.05]";
const PAGE_COLUMN_CLASS =
  "relative z-10 mx-auto flex w-full flex-1 flex-col px-4 sm:px-6";
const COMPACT_COLUMN_CLASS = "page-layout-compact";
const DEFAULT_COLUMN_SPACING_CLASS = "pb-8 pt-28";
const WIDE_COLUMN_CLASS = "max-w-[1400px]";
const DEFAULT_COLUMN_WIDTH_CLASS = "max-w-6xl";
const FOOTER_SLOT_CLASS = "relative z-10 mt-auto";

// ===== TYPES =====

type PageLayoutProps = {
  // Passed to NavBar so the correct link is highlighted
  activeItem: string;
  // Big page heading (My Profile, Settings, …)
  title: string;
  // Soft page-title fill class — default page-title-grad
  // Manipulate here: pass titleClassName only for a one-off tint
  titleClassName?: string;
  // Optional blurb under the title
  description?: string;
  // true = wider max width (discovery grid)
  // Manipulate here: pass wide for dense multi-column pages
  wide?: boolean;
  // true = tighter title + padding, and no site footer
  // Manipulate here: pass compact on pages that should fit the first screen
  compact?: boolean;
  // Which full-screen shader sits behind the glass. Default is the pyramid scales.
  // Manipulate here: "voronoi" = the older crystal-cell field
  background?: PageBackgroundVariant;
  children?: ReactNode;
};

type PageRevealProps = {
  children: ReactNode;
  delay?: number;
};

// ===== HELPER FUNCTIONS =====

function PageReveal({
  children,
  delay = PAGE_REVEAL_DEFAULT_DELAY_SECONDS,
}: PageRevealProps) {
  return (
    <motion.div
      // vocab: initial = starting pose; animate = ending pose
      initial={{ opacity: PAGE_REVEAL_HIDDEN_OPACITY, y: PAGE_REVEAL_START_OFFSET_Y }}
      animate={{ opacity: PAGE_REVEAL_VISIBLE_OPACITY, y: PAGE_REVEAL_RESTING_OFFSET_Y }}
      transition={{
        duration: PAGE_REVEAL_DURATION_SECONDS,
        delay,
        ease: PAGE_REVEAL_EASE_CURVE,
      }}
    >
      {children}
    </motion.div>
  );
}

function buildPageColumnClass(isCompact: boolean, isWide: boolean): string {
  const spacingClass = isCompact ? COMPACT_COLUMN_CLASS : DEFAULT_COLUMN_SPACING_CLASS;
  const widthClass = isWide ? WIDE_COLUMN_CLASS : DEFAULT_COLUMN_WIDTH_CLASS;
  return `${PAGE_COLUMN_CLASS} ${spacingClass} ${widthClass}`;
}

function readBodyRevealDelay(hasDescription: boolean): number {
  if (hasDescription) return PAGE_REVEAL_DELAY_WITH_DESCRIPTION_SECONDS;
  return PAGE_REVEAL_DELAY_WITHOUT_DESCRIPTION_SECONDS;
}

// ===== MAIN COMPONENT =====

/**
 * Inner-page shell: shader, navbar, glass title, page body, and footer.
 * @param props.activeItem - Nav label to highlight
 * @param props.title - Page heading
 * @param props.titleClassName - Fill class on the heading. Defaults to page-title-grad
 * @param props.description - Optional line under the heading
 * @param props.wide - Use the wider content column when true
 * @param props.compact - Tighter chrome and no footer when true
 * @param props.background - "pyramid" or "voronoi"
 * @param props.children - The page body
 * @returns The full page shell
 */
export default function PageLayout({
  activeItem,
  title,
  titleClassName = DEFAULT_TITLE_CLASS_NAME,
  description,
  wide = DEFAULT_IS_WIDE,
  compact = DEFAULT_IS_COMPACT,
  background = DEFAULT_BACKGROUND_VARIANT,
  children,
}: PageLayoutProps) {
  const hasDescription = Boolean(description);
  const columnClassName = buildPageColumnClass(compact, wide);
  const bodyRevealDelay = readBodyRevealDelay(hasDescription);

  return (
    <main className={PAGE_SHELL_CLASS}>
      <BackgroundPicture variant={background} />
      {/* Manipulate here: opacity-[0.05] in NOISE_LAYER_CLASS is how visible the film grain is */}
      <div className={NOISE_LAYER_CLASS} />

      <NavBar activeItem={activeItem} />

      <div className={columnClassName}>
        <PageReveal>
          <header className="page-header">
            <div className="page-header-glow" aria-hidden="true" />
            <div className="page-header-glass">
              {/* vocab: aria-hidden on the depth layer = screen readers hear the title once */}
              <h1 className="page-title-stack font-display">
                <span className="page-title-depth" aria-hidden="true">
                  {title}
                </span>
                <span className={`page-title-fill ${titleClassName}`}>{title}</span>
              </h1>

              {description ? <p className="page-header-desc">{description}</p> : null}
            </div>
          </header>
        </PageReveal>

        {children ? <PageReveal delay={bodyRevealDelay}>{children}</PageReveal> : null}
      </div>

      {compact ? null : (
        <div className={FOOTER_SLOT_CLASS}>
          <Footer />
        </div>
      )}
    </main>
  );
}
