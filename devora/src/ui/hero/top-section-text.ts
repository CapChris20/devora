// Written copy for the homepage hero — headline, subheading, button labels, scroll hint.
// Edit here to change copy without touching layout code (TopSection, HeroCardActions, etc.).
// Manipulate here: this file is the single source of truth for hero words/links.

export const topSectionText = {
  // Three words shown as the animated hero headline (one motion.span each in TopSection)
  headline: {
    lines: ["Connect.", "Collaborate.", "Create."],
  },
  // One-line pitch under the headline
  subheading:
    "The premier networking platform for CECS students at UM-Dearborn.",
  // Legacy single CTA label (kept for older layouts that still read ctaPrimary)
  ctaPrimary: "Start Networking Now",
  // Non-card hero: one outline button (HeroCardActions without variant="card")
  cta: {
    label: "Start Networking Now",
    href: "/auth/signup",
  },
  // Card hero: View Grid (outline) + Sign Up (primary).
  // style picks hero-action-primary vs hero-action-outline in HeroCardActions.
  // Manipulate here: swap hrefs/labels or add another action object to the array
  cardActions: [
    { label: "View Grid", href: "/find-students", style: "outline" as const },
    { label: "Sign Up", href: "/auth/signup", style: "primary" as const },
  ],
  // Label on the bouncing scroll hint button (also used as aria-label)
  scrollHint: "Scroll for more information",
} as const;
// vocab: as const = freeze these strings as exact literals (safer autocomplete in TypeScript)
