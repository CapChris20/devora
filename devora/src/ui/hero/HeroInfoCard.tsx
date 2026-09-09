// Stacked hero card on smaller layouts — tagline, logo, description, and action buttons.
// Each child gets variant="card" so spacing/alignment match the card chrome.
// TopSection’s horizontal card inlines these pieces instead; this is the stacked alternate.

import HeroTagline from "./HeroTagline";
import Logo from "./Logo";
import HeroDescription from "./HeroDescription";
import HeroCardActions from "./HeroCardActions";

export default function HeroInfoCard() {
  return (
    // vocab: <article> = semantic card container (one self-contained content block)
    // hero-info-card styles (glass, padding, gap) live in globals.css
    <article className="hero-info-card">
      {/* variant="card" = left-align / card spacing on each child */}
      <HeroTagline variant="card" />
      <Logo variant="card" />
      <HeroDescription variant="card" />
      <HeroCardActions variant="card" />
    </article>
  );
}
