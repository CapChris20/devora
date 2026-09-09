// Devora logo in the hero — full-width glow on main hero, or inside a ring on the info card.
// Thin layout wrapper around DevoraLogo; size mapping is the only logic.

import DevoraLogo from "@/ui/logo/DevoraLogo";

type HeroLogoProps = {
  // "card" = ring layout used inside the info card; default "hero" = large centered glow
  // Manipulate here: pass variant from the parent to pick the layout
  variant?: "hero" | "card";
};

export default function HeroLogo({ variant = "hero" }: HeroLogoProps) {
  // Map layout variant to DevoraLogo's size prop.
  // vocab/symbol: ? : = ternary — if card use "card", else use "hero"
  const size = variant === "card" ? "card" : "hero";

  // Card — logo sits inside a decorative ring (hero-logo-ring styles in CSS)
  if (variant === "card") {
    return (
      <div className="hero-logo-wrap-card">
        <div className="hero-logo-ring">
          <DevoraLogo size={size} />
        </div>
      </div>
    );
  }

  // Default hero — larger logo with glow, centered
  return (
    <div className="hero-logo-wrap flex justify-center py-1 sm:py-2">
      <DevoraLogo size={size} className="hero-logo-glow" />
    </div>
  );
}
