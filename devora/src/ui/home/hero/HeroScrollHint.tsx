// Bouncing "Scroll for more" button on the homepage hero.
// Click → find the target section by id → Lenis smoothScroller.scrollTo if present,
// else native scrollIntoView. Default target is the What is Devora platform card.

"use client";

import { topSectionText } from "./top-section-text";

type HeroScrollHintProps = {
  // DOM id of the element to scroll to (must exist on the page)
  // Manipulate here: pass a different id to aim at another section
  targetId?: string;
};

// Small chevron SVG used twice (staggered) for the bounce hint.
// currentColor = inherits the button text color from CSS.
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      // vocab: viewBox = internal coordinate system of the SVG (0..20 on both axes here)
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {/* Simple V path: left → bottom tip → right */}
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// vocab/symbol: targetId = "what-is-devora" = default landing for “Scroll for more”
export default function HeroScrollHint({ targetId = "what-is-devora" }: HeroScrollHintProps) {
  // Find the What is Devora card (or any targetId) and scroll so its top sits under the navbar.
  // vocab: Lenis = smooth-scroll library; window.smoothScroller is set on the homepage
  const scrollToMore = () => {
    // Prefer the platform panel itself when scrolling to What is Devora —
    // lands on the glass card / “What is Devora” title, not the chapter label above it.
    // vocab: getElementById = find the first element whose id attribute matches
    const panel =
      targetId === "what-is-devora"
        ? document.querySelector(".what-is-panel")
        : null;
    const target =
      (panel as HTMLElement | null) ?? document.getElementById(targetId);

    // Nothing to scroll to — leave quietly (typo’d id, or section not mounted yet)
    // vocab/symbol: ! means NOT — runs when target was not found
    if (!target) return;

    // Navbar clearance — stop a bit above the card so the title isn’t hidden under the pill.
    // Manipulate here: more negative = leave more space under the navbar
    const NAV_OFFSET = -110;

    // Homepage uses Lenis — compute absolute Y from Lenis’s scroll + the target’s on-screen top.
    // Why not only scrollTo(element)? Element targeting can undershoot with nested layouts / Lenis.
    // vocab: getBoundingClientRect().top = distance from viewport top to the element’s top edge
    // vocab: lenis.scroll = how far Lenis has already scrolled the page (px)
    if (window.smoothScroller) {
      const lenis = window.smoothScroller;
      const absoluteY = target.getBoundingClientRect().top + lenis.scroll + NAV_OFFSET;
      // Manipulate here: duration (seconds) — higher = slower / floatier scroll
      lenis.scrollTo(absoluteY, { duration: 1.35 });
      return;
    }

    // Fallback — browser's built-in smooth scroll (no Lenis on this page)
    // vocab: scrollIntoView = native browser API to bring an element on screen
    // block: "start" = align the top of the target near the top of the viewport
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="hero-scroll-hint">
      <button
        type="button"
        onClick={scrollToMore}
        // pointer-events-auto = ensure clicks work even if a parent uses pointer-events-none
        className="hero-scroll-hint-btn pointer-events-auto"
        // Visible label + accessible name both come from shared copy
        aria-label={topSectionText.scrollHint}
      >
        <span className="hero-scroll-hint-label">{topSectionText.scrollHint}</span>
        {/* Two chevrons; CSS delays the second for a bounce feel.
            Manipulate here: hero-scroll-hint-chevron* keyframes live in globals.css */}
        <span className="hero-scroll-hint-chevrons" aria-hidden="true">
          <ChevronDown className="hero-scroll-hint-chevron" />
          <ChevronDown className="hero-scroll-hint-chevron hero-scroll-hint-chevron-delay" />
        </span>
      </button>
    </div>
  );
}
