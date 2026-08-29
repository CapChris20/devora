import HeroTagline from "./HeroTagline";
import HeroLogo from "./HeroLogo";
import HeroDescription from "./HeroDescription";
import HeroCardActions from "./HeroCardActions";

export default function HeroInfoCard() {
  return (
    <article className="hero-info-card">
      <HeroTagline variant="card" />
      <HeroLogo variant="card" />
      <HeroDescription variant="card" />
      <HeroCardActions variant="card" />
    </article>
  );
}
