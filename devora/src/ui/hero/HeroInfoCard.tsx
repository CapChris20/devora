import HeroTagline from "./HeroTagline";
import Logo from "./Logo";
import HeroDescription from "./HeroDescription";
import HeroCardActions from "./HeroCardActions";

export default function HeroInfoCard() {
  return (
    <article className="hero-info-card">
      <HeroTagline variant="card" />
      <Logo variant="card" />
      <HeroDescription variant="card" />
      <HeroCardActions variant="card" />
    </article>
  );
}
