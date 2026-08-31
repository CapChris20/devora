import DevoraLogo from "@/ui/logo/DevoraLogo";

type HeroLogoProps = {
  variant?: "hero" | "card";
};

export default function HeroLogo({ variant = "hero" }: HeroLogoProps) {
  const size = variant === "card" ? "card" : "hero";

  if (variant === "card") {
    return (
      <div className="hero-logo-wrap-card">
        <div className="hero-logo-ring">
          <DevoraLogo size={size} />
        </div>
      </div>
    );
  }

  return (
    <div className="hero-logo-wrap flex justify-center py-1 sm:py-2">
      <DevoraLogo size={size} className="hero-logo-glow" />
    </div>
  );
}
