export const landingHeroCopy = {
  headline: {
    lines: ["Connect.", "Collaborate.", "Create."],
  },
  subheading:
    "The premier networking platform for CECS students at UM-Dearborn.",
  ctaPrimary: "Start Networking Now",
  cta: {
    label: "Start Networking Now",
    href: "/auth",
  },
  cardActions: [
    { label: "View Grid", href: "/discovery-grid", style: "outline" as const },
    { label: "Sign Up", href: "/auth", style: "primary" as const },
  ],
  scrollHint: "Scroll for more information",
} as const;
