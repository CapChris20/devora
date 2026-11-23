// Hero call-to-action buttons — "Find people" and "Sign Up" pills, or a single outline link elsewhere.
// Labels and hrefs live in top-section-text.ts so copy can change without touching layout.
// Manipulate here: edit topSectionText.cardActions / cta — not this file — to change destinations.

// ===== IMPORTS =====

import Link from "next/link";
import { topSectionText } from "./top-section-text";

// ===== TYPES =====

type HeroCardActionsProps = {
  // "card" = the two side-by-side hero pills; omit for the single outline CTA
  variant?: "card";
};

type ActionStyle = (typeof topSectionText.cardActions)[number]["style"];

// ===== HELPER FUNCTIONS =====

// Pick the pill classes for one action. Look lives in hero-poster.css (hp-btn*).
// Manipulate here: add a new style name here and in top-section-text.ts
function pickActionClassName(style: ActionStyle): string {
  if (style === "primary") return "hp-btn hp-btn-primary";
  return "hp-btn";
}

// Arrow on the primary pill — decorative only
function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// ===== MAIN COMPONENT =====

export default function HeroCardActions({ variant }: HeroCardActionsProps) {
  // 1. Hero layout — two pills side by side (outline + primary with arrow)
  if (variant === "card") {
    return (
      <div className="hp-actions">
        {/* vocab: Link = Next.js client navigation (no full page reload) */}
        {topSectionText.cardActions.map((action) => (
          <Link key={action.label} href={action.href} className={pickActionClassName(action.style)}>
            {action.label}
            {action.style === "primary" && <ArrowRight />}
          </Link>
        ))}
      </div>
    );
  }

  // 2. Non-card layout — one outline CTA with a ">" affordance
  const { label, href } = topSectionText.cta;

  return (
    <div className="mt-1 sm:mt-2">
      <Link href={href} className="hero-cta-outline inline-flex items-center gap-2">
        {label}
        {/* Decorative chevron — aria-hidden so screen readers don't say “greater than” */}
        <span aria-hidden="true">&gt;</span>
      </Link>
    </div>
  );
}
