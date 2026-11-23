// Creator credits plate under the homepage hero: "Created by Chris Shina · Proctored by Dr. Bruce Maxim".
// The sponsor line moved onto the spinning seal (HeroSponsorSeal.tsx).
// Words live in top-section-text.ts → credits. Styles: hp-credits* in hero-poster.css.

// ===== IMPORTS =====

import { topSectionText } from "./top-section-text";

// ===== MAIN COMPONENT =====

export default function HeroCredits() {
  return (
    // Rounded plate so the names stay readable over the pyramid shader
    <div className="hp-credits">
      {/* vocab: .map = make one label/name pair per credit entry */}
      {topSectionText.credits.map((credit, index) => (
        <div key={credit.label} className="hp-credit-group">
          {/* Small round dot between the two credits (skip before the first one) */}
          {index > 0 && <span className="hp-credit-sep" aria-hidden="true" />}
          <p className="hp-credit">
            <span className="hp-credit-label">{credit.label}</span>
            <span className="hp-credit-name">{credit.name}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
