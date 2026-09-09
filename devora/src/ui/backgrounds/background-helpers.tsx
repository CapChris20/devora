// Shared building blocks for retro SVG backgrounds — star positions, dots, neon ridge helper.
// Used by city / mountains / pyramids scene files (legacy art; hero now uses Voronoi).
// Still useful if you revive a retro scene or borrow the helpers.

import type { ReactNode } from "react";

// 40 star positions — math spreads them across the top half of the sky (no hand-placed coords).
// vocab: Array.from({ length: N }, fn) = build an array of N items by calling fn for each index
// vocab/symbol: % = remainder (wraps numbers back into a 0..N-1 range)
// Manipulate here: change length / multipliers to denser or sparser starfields
export const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 41.3) % 100, // % across the width
  top: (i * 27.1) % 50, // only the top half of the sky
  size: 1 + ((i * 7) % 3), // 1, 2, or 3 px-ish
  delay: (i % 10) * 0.35, // twinkle stagger in seconds (if CSS uses it)
}));

// Speckle dots for mountain / pyramid fills (absolute coords in the 1440-wide SVG space).
// Manipulate here: length / spacing math controls how grainy the fills look
export const DOTS = Array.from({ length: 170 }, (_, i) => ({
  x: (i * 97) % 1440,
  y: 45 + ((i * 53) % 275),
  r: 0.8 + (i % 3) * 0.5,
  o: 0.08 + ((i * 7) % 10) / 45, // opacity
}));

// Blend two [x,y] points — t=0 is a, t=1 is b (used for cross-bars on mountain slopes).
// vocab/symbol: lerp = linear interpolate (slide between two values)
export const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

type NeonRidgeProps = {
  // SVG polyline points string: "x,y x,y x,y …"
  points: string;
  color: string;
};

// Soft glow + bright stroke along a ridgeline polyline (two stacked strokes).
// Manipulate here: strokeWidth / opacity on either polyline changes glow vs edge strength
export function NeonRidge({ points, color }: NeonRidgeProps) {
  return (
    <>
      {/* Wide faint stroke = glow */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="9" opacity="0.22" strokeLinejoin="round" />
      {/* Thin bright stroke = crisp edge */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" opacity="0.95" strokeLinejoin="round" />
    </>
  );
}

// Shape every retro scene exports — back layer then front layer.
// Consumers stack back under front for parallax-ish depth.
// vocab: ReactNode = anything React can put on screen (JSX, text, etc.)
export type RetroScene = {
  back: ReactNode;
  front: ReactNode;
};
