// Thin Lottie wrapper used beside homepage section headings.
// Pass JSON animationData; it loops and autoplays with no pointer events.
// WhyMatchupLottie / FeatureCards / WhatIsDevora all render through this.

"use client";

// vocab: Lottie = plays After-Effects-style JSON animations in the browser
// (lottie-react’s <Lottie> takes a parsed JSON object as `src` / animationData)
import { Lottie } from "lottie-react";

type MovingAnimationProps = {
  // Parsed Lottie JSON (imported .json or output of recolorLottie)
  animationData: object;
  // Extra layout classes (width caps, centering) from the call site
  className?: string;
  // Accessible name — screen readers treat the whole block as one image
  ariaLabel?: string;
};

export default function MovingAnimation({
  animationData,
  className = "",
  ariaLabel = "Section animation",
}: MovingAnimationProps) {
  return (
    // role="img" + aria-label so assistive tech treats it as one decorative image.
    // pointer-events-none = clicks pass through to whatever is underneath.
    // Manipulate here: drop pointer-events-none if you ever need clickable Lottie hotspots
    <div
      className={`landing-lottie pointer-events-none ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      {/* vocab: loop + autoplay = keep replaying as soon as it mounts
          className h-full w-full = fill the sized parent wrapper */}
      <Lottie src={animationData} loop autoplay className="h-full w-full" />
    </div>
  );
}
