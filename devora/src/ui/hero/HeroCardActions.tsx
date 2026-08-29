import Link from "next/link";
import { landingHeroCopy } from "./landing-hero.copy";

type HeroCardActionsProps = {
  variant?: "card";
};

export default function HeroCardActions({ variant }: HeroCardActionsProps) {
  if (variant === "card") {
    return (
      <div className="hero-action-wrap">
        {landingHeroCopy.cardActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={
              action.style === "primary"
                ? "hero-action hero-action-primary"
                : "hero-action hero-action-outline"
            }
          >
            {action.label}
          </Link>
        ))}
      </div>
    );
  }

  const { label, href } = landingHeroCopy.cta;

  return (
    <div className="mt-1 sm:mt-2">
      <Link href={href} className="hero-cta-outline inline-flex items-center gap-2">
        {label}
        <span aria-hidden="true">&gt;</span>
      </Link>
    </div>
  );
}
