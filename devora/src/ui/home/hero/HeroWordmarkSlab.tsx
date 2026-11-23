// Right side of the homepage hero: a tilted rounded black slab with the logo and the DEVORA wordmark.
// A dotted orchid slab sits behind it, a "Start Networking Now" sticker sits on its top corner,
// and the spinning sponsor seal is stuck on its bottom-left corner.

// ===== IMPORTS =====

import DevoraLogo from "@/ui/shared/logo/DevoraLogo";
import HeroSponsorSeal from "./HeroSponsorSeal";
import { topSectionText } from "./top-section-text";

// ===== NAMED CONSTANTS =====

// Four little color dots along the slab's dashed foot (decorative)
// Manipulate here: reorder or swap the hp-tone-* classes to recolor the dots
const FOOT_DOT_TONES = ["hp-tone-brand", "hp-tone-orchid", "hp-tone-sky", "hp-tone-blush"] as const;

// ===== MAIN COMPONENT =====

export default function HeroWordmarkSlab() {
  return (
    // hp-stage = the box TopSection tilts toward the mouse (CSS perspective set there)
    <div className="hp-stage">
      {/* 1. Dotted orchid slab behind (slides out on intro, drifts against the mouse) */}
      <div className="hp-backer" aria-hidden="true" />

      {/* 2. Black slab: campus label, logo, wordmark, dashed foot with dots */}
      <div className="hp-slab">
        <p className="hp-slab-label">CECS · UM-Dearborn</p>
        <div className="hp-slab-logo">
          {/* size="hero" = the big logo preset in DevoraLogo (288px on desktop) */}
          <DevoraLogo size="hero" />
        </div>
        <h1 className="hp-wordmark">{topSectionText.wordmark}</h1>
        <div className="hp-slab-foot" aria-hidden="true">
          {FOOT_DOT_TONES.map((toneClass) => (
            <span key={toneClass} className={toneClass} />
          ))}
        </div>
      </div>

      {/* 3. Tilted sticker with the legacy primary CTA words */}
      <span className="hp-sticker">{topSectionText.ctaPrimary}</span>

      {/* 4. Sponsor seal on the bottom-left corner */}
      <HeroSponsorSeal />
    </div>
  );
}
