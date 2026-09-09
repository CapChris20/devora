// Three-word hero headline ("Connect. Collaborate. Create.") from top-section-text.
// Card variant left-aligns; default centers the line.
// Manipulate here: change the words in top-section-text.ts → headline.lines.

import { topSectionText } from "./top-section-text";

type HeroTaglineProps = {
  // "card" = left-aligned inside the stacked info card; omit for centered standalone
  variant?: "card";
};

export default function HeroTagline({ variant }: HeroTaglineProps) {
  // Pull the three headline words from shared copy.
  // vocab/symbol: { lines } = destructuring — grab only the `lines` field from the object
  const { lines } = topSectionText.headline;

  // Card layout — left-aligned tagline inside the info card
  if (variant === "card") {
    return (
      <h2 className="hero-tagline devora-gradient-text font-sans">
        {/* vocab: .join(" ") = glue array words into one string with spaces */}
        {lines.join(" ")}
      </h2>
    );
  }

  // Default — centered tagline for standalone hero layouts
  return (
    <h2 className="hero-tagline devora-gradient-text text-center font-sans">
      {lines.join(" ")}
    </h2>
  );
}
