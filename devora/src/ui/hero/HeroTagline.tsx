import { landingHeroCopy } from "./landing-hero.copy";

type HeroTaglineProps = {
  variant?: "card";
};

export default function HeroTagline({ variant }: HeroTaglineProps) {
  const { lines } = landingHeroCopy.headline;

  if (variant === "card") {
    return (
      <h2 className="hero-tagline devora-gradient-text font-sans">
        {lines.join(" ")}
      </h2>
    );
  }

  return (
    <h2 className="hero-tagline devora-gradient-text text-center font-sans">
      {lines.join(" ")}
    </h2>
  );
}
