import { topSectionText } from "./top-section-text";

type HeroDescriptionProps = {
  variant?: "card";
};

export default function HeroDescription({ variant }: HeroDescriptionProps) {
  return (
    <p
      className={`hero-subheadline font-sans ${
        variant === "card" ? "hero-description text-left" : "text-center"
      }`}
    >
      {topSectionText.subheading}
    </p>
  );
}
