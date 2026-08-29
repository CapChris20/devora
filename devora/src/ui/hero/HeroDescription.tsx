import { landingHeroCopy } from "./landing-hero.copy";

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
      {landingHeroCopy.subheading}
    </p>
  );
}
