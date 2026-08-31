import { topSectionText } from "./top-section-text";

type HeroTaglineProps = {
  variant?: "card";
};

export default function HeroTagline({ variant }: HeroTaglineProps) {
  const { lines } = topSectionText.headline;

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
