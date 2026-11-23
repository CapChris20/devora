// Tilted ink strip at the bottom of the homepage hero, repeating the headline words.
// The track holds two identical halves; GSAP in TopSection slides it left by 50% forever,
// so the second half lands exactly where the first began and the loop has no visible seam.

// ===== IMPORTS =====

import { topSectionText } from "./top-section-text";

// ===== NAMED CONSTANTS =====

const MARQUEE_WORDS = [...topSectionText.headline.lines, topSectionText.ctaPrimary];

// How many times the word list repeats inside ONE half of the track.
// Manipulate here: raise if very wide screens ever show a gap at the right edge
const REPEATS_PER_HALF = 4;
const TRACK_HALVES = 2;

// ===== HELPER FUNCTIONS =====

// Build the flat list of words for the whole track (both halves).
function buildTrackWords(): string[] {
  const trackWords: string[] = [];
  const totalRepeats = REPEATS_PER_HALF * TRACK_HALVES;
  for (let repeatIndex = 0; repeatIndex < totalRepeats; repeatIndex++) {
    trackWords.push(...MARQUEE_WORDS);
  }
  return trackWords;
}

// ===== MAIN COMPONENT =====

export default function HeroMarquee() {
  const trackWords = buildTrackWords();

  return (
    // Decorative — the same words are already in the headline, so screen readers skip it
    <div className="hp-marquee-wrap" aria-hidden="true">
      <div className="hp-marquee">
        <div className="hp-marquee-track">
          {trackWords.map((word, index) => (
            <span key={`${word}-${index}`} className="hp-marquee-item">
              {word}
              {/* Round dot after each word; CSS cycles its gradient */}
              <i />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
