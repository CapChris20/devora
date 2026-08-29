"use client";

import { Lottie } from "lottie-react";

type LandingLottieProps = {
  animationData: object;
  className?: string;
  ariaLabel?: string;
};

export default function LandingLottie({
  animationData,
  className = "",
  ariaLabel = "Section animation",
}: LandingLottieProps) {
  return (
    <div
      className={`landing-lottie pointer-events-none ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <Lottie src={animationData} loop autoplay className="h-full w-full" />
    </div>
  );
}
