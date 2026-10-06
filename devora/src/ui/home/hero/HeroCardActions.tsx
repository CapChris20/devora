// Hero call-to-action buttons — "View Grid" and "Sign Up" on the card, or a single outline link elsewhere.
// Labels and hrefs live in top-section-text.ts so copy can change without touching layout.
// Manipulate here: edit topSectionText.cardActions / cta — not this file — to change destinations.

import Link from "next/link";
import { topSectionText } from "./top-section-text";

type HeroCardActionsProps = {
  // "card" = two side-by-side buttons inside the hero info card; omit for the single outline CTA
  variant?: "card";
};

export default function HeroCardActions({ variant }: HeroCardActionsProps) {
  // Card layout — two buttons side by side (outline + primary)
  if (variant === "card") {
    return (
      <div className="hero-action-wrap">
        {/* vocab: Link = Next.js client navigation (no full page reload) */}
        {topSectionText.cardActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={
              // style comes from top-section-text ("primary" | "outline").
              // vocab/symbol: ? : = ternary — pick primary classes or outline classes
              // Manipulate here: hero-action-* look lives in globals.css
              action.style === "primary"
                ? "hero-action hero-action-primary"
                : "hero-action hero-action-outline"
            }
          >
            {action.label}
          </Link>
        ))}
      </div>
    );
  }

  // Non-card layout — one outline CTA with a ">" affordance
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
