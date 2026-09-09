// Bouncing "Scroll for more" button on the homepage hero.
// Click → find the target section by id → Lenis smoothScroller.scrollTo if present,
// else native scrollIntoView. Default targetId is "more" (ScrollingTextStrip).

// vocab: "use client" = this file runs in the browser (needs click handlers / window APIs)
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

// vocab/symbol: targetId = "more" = default if the parent doesn't pass a targetId
export default function HeroScrollHint({ targetId = "more" }: HeroScrollHintProps) {
  // Find the target section and scroll to it (Lenis smoothScroller if present).
  // vocab: Lenis = smooth-scroll library; window.smoothScroller is set on the homepage
  const scrollToMore = () => {
    // vocab: getElementById = find the first element whose id attribute matches
    const target = document.getElementById(targetId);
    // Nothing to scroll to — leave quietly (typo’d id, or section not mounted yet)
    // vocab/symbol: ! means NOT — runs when target was not found
    if (!target) return;

    // Homepage uses Lenis smooth scroll when available.
    // offset: -96 = stop a bit above the target so the fixed navbar doesn't cover it.
    // Manipulate here: change offset (px) or duration (seconds) to retune the scroll feel
    if (window.smoothScroller) {
      window.smoothScroller.scrollTo(target, { offset: -96, duration: 1.4 });
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
