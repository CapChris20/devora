// Lottie for a Why Devora matchup card.
// Flow: receive raw JSON + preset → useMemo recolorLottie → hand branded JSON to MovingAnimation.
// Recolor only re-runs when animationData or preset changes (not on every parent render).

"use client";

import { useMemo } from "react";
import { recolorLottie, type DevoraLottiePreset } from "@/ui/lottie-animations/recolor-lottie";
import MovingAnimation from "./MovingAnimation";

type WhyMatchupLottieProps = {
  // Raw imported Lottie JSON (still original After Effects colors)
  animationData: object;
  // Which Devora palette to apply — "github" | "linkedin" | "discord"
  // Manipulate here: pass a different preset to swap the recolor recipe
  preset: DevoraLottiePreset;
  // Accessible name forwarded to MovingAnimation
  ariaLabel: string;
};

export default function WhyMatchupLottie({
  animationData,
  preset,
  ariaLabel,
}: WhyMatchupLottieProps) {
  // Only recolor again when the raw JSON or preset changes (not on every parent render).
  // recolorLottie deep-clones + walks the whole tree — expensive enough to memoize.
  // vocab: useMemo = cache the expensive recolor result until deps change
  // vocab/symbol: [animationData, preset] = dependency list — recompute when either changes
  const brandedAnimation = useMemo(
    () => recolorLottie(animationData, preset),
    [animationData, preset],
  );

  return (
    <MovingAnimation
      animationData={brandedAnimation}
      ariaLabel={ariaLabel}
      // why-matchup-lottie sizes the animation inside the matchup card (globals.css)
      className="why-matchup-lottie landing-lottie"
    />
  );
}
