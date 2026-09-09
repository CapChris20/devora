// SVG art for the city skyline retro background scene.
// Towers with lit windows + neon ridge; exported as back/front layers.
// Legacy art — hero now uses Voronoi; keep this if you revive a retro scene picker.
// Manipulate here: edit TOWERS (x/w/h) to reshape the skyline; SPIRE_TOWERS picks which get spires.

import { NeonRidge, type RetroScene } from "./background-helpers";

// Building footprints — x position, width, height (drawn up from the ground line y=320).
// vocab: y = 320 - h so the base sits on y=320 and the roof is higher on screen (SVG y grows down)
const TOWERS = [
  { x: 10, w: 90, h: 130 },
  { x: 105, w: 60, h: 200 },
  { x: 170, w: 110, h: 150 },
  { x: 285, w: 65, h: 235 },
  { x: 355, w: 100, h: 170 },
  { x: 460, w: 75, h: 260 },
  { x: 540, w: 120, h: 195 },
  { x: 665, w: 70, h: 285 },
  { x: 740, w: 105, h: 160 },
  { x: 850, w: 85, h: 220 },
  { x: 940, w: 60, h: 175 },
  { x: 1005, w: 110, h: 245 },
  { x: 1120, w: 75, h: 140 },
  { x: 1200, w: 70, h: 210 },
  { x: 1275, w: 95, h: 165 },
  { x: 1375, w: 60, h: 235 },
];

// Tower indexes that get a pink spire on top (0-based into TOWERS).
// Manipulate here: add/remove indexes to change which buildings get antennas
const SPIRE_TOWERS = [3, 7, 11];

// Front layer — every tower, windows, spires, and neon roof line
const CityFront = (
  <>
    {/* vocab: <g> = SVG group — one building's body + edges + windows together */}
    {TOWERS.map((b, i) => (
      <g key={i}>
        {/* Solid building body — y = 320 - height so the base sits on the ground line */}
        <rect x={b.x} y={320 - b.h} width={b.w} height={b.h} fill="#0d0618" />
        {/* Left edge glow (pink) */}
        <line
          x1={b.x}
          y1={320 - b.h}
          x2={b.x}
          y2="320"
          stroke="#ff2bd6"
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Right edge glow (cyan) */}
        <line
          x1={b.x + b.w}
          y1={320 - b.h}
          x2={b.x + b.w}
          y2="320"
          stroke="#22d3ee"
          strokeWidth="1.5"
          opacity="0.18"
        />
        {/* Wide towers get a couple of horizontal accent lines */}
        {b.w >= 90 &&
          [24, 46].map((dy) => (
            <line
              key={dy}
              x1={b.x}
              y1={320 - b.h + dy}
              x2={b.x + b.w}
              y2={320 - b.h + dy}
              stroke="#ff2bd6"
              strokeWidth="1"
              opacity="0.16"
            />
          ))}
        {/* Window grid — skip some cells so it looks lived-in, not uniform */}
        {Array.from({ length: Math.floor((b.w - 12) / 15) }, (_, c) =>
          Array.from({ length: Math.floor((b.h - 20) / 19) }, (_, r) => {
            // Pseudo-random skip: leave some windows dark.
            // vocab/symbol: % = remainder — deterministic “random” pattern without Math.random
            if ((i * 13 + r * 7 + c * 5) % 6 < 2) return null;
            // Pick pink / cyan / amber for lit windows
            const color =
              (r + c + i) % 8 === 0 ? "#ff2bd6" : (r * 2 + c) % 5 === 0 ? "#22d3ee" : "#ffd76f";
            return (
              <rect
                key={`${c}-${r}`}
                x={b.x + 7 + c * 15}
                y={320 - b.h + 10 + r * 19}
                width="7"
                height="9"
                fill={color}
                opacity="0.85"
              />
            );
          }),
        )}
        {/* Optional spire + tip light on selected towers */}
        {/* vocab/symbol: && = only render the spire JSX when this tower index is in the list */}
        {SPIRE_TOWERS.includes(i) && (
          <>
            <rect
              x={b.x + b.w / 2 - 1.5}
              y={320 - b.h - 30}
              width="3"
              height="30"
              fill="#ff2bd6"
              opacity="0.9"
            />
            <circle cx={b.x + b.w / 2} cy={320 - b.h - 33} r="3" fill="#ff2bd6" />
          </>
        )}
      </g>
    ))}
    {/* Neon line tracing every roof top */}
    <NeonRidge
      points={TOWERS.map((b) => `${b.x},${320 - b.h} ${b.x + b.w},${320 - b.h}`).join(" ")}
      color="#ff2bd6"
    />
  </>
);

// Back layer — simpler distant skyline silhouette
const CityBack = (
  <path
    fill="#3d1160"
    opacity="0.7"
    d="M0,320 L0,190 L90,190 L90,140 L150,140 L150,200 L240,200 L240,120 L320,120 L320,180 L420,180 L420,150 L520,150 L520,210 L620,210 L620,130 L700,130 L700,190 L800,190 L800,150 L900,150 L900,210 L1000,210 L1000,120 L1080,120 L1080,180 L1180,180 L1180,150 L1280,150 L1280,200 L1360,200 L1360,160 L1440,160 L1440,320 Z"
  />
);

export const cityScene: RetroScene = {
  back: CityBack,
  front: CityFront,
};
