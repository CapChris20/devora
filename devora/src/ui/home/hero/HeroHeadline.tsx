// Giant three-line homepage headline: "Connect." / "Collaborate." / "Create."
// Line 1 gets round classmate bubbles, line 3 sits on a tilted brand band with a round arrow chip.
// Each letter is its own span so TopSection's GSAP intro can make the letters rise.

// ===== IMPORTS =====

import { topSectionText } from "./top-section-text";

// ===== NAMED CONSTANTS =====

const HEADLINE_WORDS = topSectionText.headline.lines;

// Decorative classmate bubbles next to "Connect." — initials only, no real people.
// Manipulate here: change initials or swap the gradient class (hp-tone-brand / sky / blush / orchid)
const CLASSMATE_BUBBLES = [
  { initials: "MK", toneClass: "hp-tone-brand" },
  { initials: "AS", toneClass: "hp-tone-sky" },
  { initials: "TJ", toneClass: "hp-tone-blush" },
] as const;

// ===== HELPER FUNCTIONS =====

// One word, split into letter spans. The word itself carries the readable label.
// vocab: aria-label = what a screen reader says instead of reading each letter span
function SplitWord({ word }: { word: string }) {
  return (
    <span className="hp-word" aria-label={word} role="text">
      {/* vocab: Array.from(word) = split the word into its letters */}
      {Array.from(word).map((letter, index) => (
        <span key={`${letter}-${index}`} className="hp-ch" aria-hidden="true">
          {letter}
        </span>
      ))}
    </span>
  );
}

function ClassmateBubbles() {
  return (
    <span className="hp-faces" aria-hidden="true">
      {CLASSMATE_BUBBLES.map((bubble) => (
        <span key={bubble.initials} className={`hp-face ${bubble.toneClass}`}>
          {bubble.initials}
        </span>
      ))}
    </span>
  );
}

// Round ink chip with two swap arrows — "work together" mark after Create.
function SwapChip() {
  return (
    <span className="hp-swap" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h11l-3-3M17 17H6l3 3" />
      </svg>
    </span>
  );
}

// ===== MAIN COMPONENT =====

export default function HeroHeadline() {
  const [firstWord, secondWord, lastWord] = HEADLINE_WORDS;

  return (
    <h2 className="hp-headline">
      {/* 1. Connect. + classmate bubbles */}
      <span className="hp-row">
        <SplitWord word={firstWord} />
        <ClassmateBubbles />
      </span>

      {/* 2. Collaborate. */}
      <span className="hp-row">
        <SplitWord word={secondWord} />
      </span>

      {/* 3. Create. on the tilted brand band, then the swap chip.
          hp-band is the colored slab GSAP wipes in from the left */}
      <span className="hp-row">
        <span className="hp-band-word">
          <span className="hp-band" aria-hidden="true" />
          <SplitWord word={lastWord} />
        </span>
        <SwapChip />
      </span>
    </h2>
  );
}
