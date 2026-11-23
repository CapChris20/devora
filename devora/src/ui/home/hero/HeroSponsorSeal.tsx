// Round sponsor seal stuck on the corner of the DEVORA slab.
// The ring text ("Sponsored by · University of Michigan-Dearborn") spins; the middle says "CECS Dept."
// Screen readers get the full sponsor sentence from top-section-text.ts instead of the ring.

// ===== IMPORTS =====

import { topSectionText } from "./top-section-text";

// ===== NAMED CONSTANTS =====

// The SVG is drawn on a 168×168 grid; the ring path is a circle of radius 66 around its center.
// Manipulate here: RING_TEXT_LENGTH ≈ 2 × π × radius so the words wrap exactly once
const SEAL_VIEWBOX = "0 0 168 168";
const RING_PATH = "M84,84 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0";
const RING_PATH_ID = "hp-seal-ring-path";
const RING_TEXT_LENGTH = 412;

// ===== MAIN COMPONENT =====

export default function HeroSponsorSeal() {
  const { sentence, ringText, centerLines } = topSectionText.sponsor;

  return (
    <div className="hp-seal">
      {/* Sponsor sentence for screen readers only (the ring below is decorative) */}
      <span className="sr-only">{sentence}</span>
      <span className="hp-seal-disc" aria-hidden="true" />

      {/* hp-seal-ring spins forever (GSAP in TopSection).
          vocab: textPath = SVG text that follows the shape of a path (here, the circle) */}
      <svg className="hp-seal-ring" viewBox={SEAL_VIEWBOX} aria-hidden="true">
        <defs>
          <path id={RING_PATH_ID} d={RING_PATH} />
        </defs>
        <text>
          <textPath href={`#${RING_PATH_ID}`} textLength={RING_TEXT_LENGTH}>
            {ringText}
          </textPath>
        </text>
      </svg>

      <span className="hp-seal-core" aria-hidden="true">
        {centerLines[0]}
        <br />
        {centerLines[1]}
      </span>
    </div>
  );
}
