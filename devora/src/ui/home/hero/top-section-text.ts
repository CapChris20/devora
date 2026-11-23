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
    "The official campus hub for CECS students at UM-Dearborn: the Discovery Grid, clubs, events, study groups and messages in one place.",
  // Legacy single CTA label (kept for older layouts that still read ctaPrimary)
  ctaPrimary: "Start Networking Now",
  // Non-card hero: one outline button (HeroCardActions without variant="card")
  cta: {
    label: "Start Networking Now",
    href: "/auth/signup",
  },
  // Card hero: Find people (outline) + Sign Up (primary).
  // style picks hero-action-primary vs hero-action-outline in HeroCardActions.
  // Manipulate here: swap hrefs/labels or add another action object to the array
  cardActions: [
    { label: "Find people", href: "/find-students", style: "outline" as const },
    { label: "Sign Up", href: "/auth/signup", style: "primary" as const },
  ],
  // Label on the bouncing scroll hint button (also used as aria-label)
  scrollHint: "Scroll for more information",
  // Small campus pill above the headline
  eyebrow: "CECS · University of Michigan–Dearborn",
  // Brand word on the tilted slab
  wordmark: "DEVORA",
  // Sponsor seal: the ring text spins; the full sentence is read to screen readers.
  // Manipulate here: ringText must stay short enough to fit once around the seal
  sponsor: {
    sentence: "Sponsored by University of Michigan-Dearborn CECS Department",
    ringText: "Sponsored by · University of Michigan-Dearborn · ",
    centerLines: ["CECS", "Dept."],
  },
  // Creator + proctor plate under the hero
  credits: [
    { label: "Created by", name: "Chris Shina" },
    { label: "Proctored by", name: "Dr. Bruce Maxim" },
  ],
} as const;
// vocab: as const = freeze these strings as exact literals (safer autocomplete in TypeScript)
