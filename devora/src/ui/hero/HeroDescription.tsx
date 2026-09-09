// Short paragraph under the hero headline explaining what Devora is for CECS students.
// Card variant left-aligns; default centers the text.
// Manipulate here: edit topSectionText.subheading for the actual sentence.

import { topSectionText } from "./top-section-text";

type HeroDescriptionProps = {
  variant?: "card";
};

export default function HeroDescription({ variant }: HeroDescriptionProps) {
  return (
    // Pick left vs center alignment from the optional card variant.
    // vocab/symbol: `...${...}` = template string — builds the className from pieces
    <p
      className={`hero-subheadline font-sans ${
        variant === "card" ? "hero-description text-left" : "text-center"
      }`}
    >
      {topSectionText.subheading}
    </p>
  );
}
