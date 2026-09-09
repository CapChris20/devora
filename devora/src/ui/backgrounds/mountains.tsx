// SVG art for the mountain peaks retro background scene.
// Gradient fills, speckles, fan lines from peaks, neon ridge outline.
// Legacy art — hero now uses Voronoi; keep this if you revive a retro scene picker.
// Manipulate here: edit RIDGE [x,y] points to reshape peaks (lower y = taller peak in SVG).

import { DOTS, NeonRidge, lerp, type RetroScene } from "./background-helpers";

// Ridgeline points [x, y] — lower y = taller peak (SVG y grows downward)
const RIDGE: [number, number][] = [
  [0, 280],
  [110, 150],
  [190, 230],
  [300, 90],
  [400, 210],
  [500, 120],
  [600, 220],
  [700, 60],
  [810, 210],
  [910, 130],
  [1010, 230],
  [1120, 100],
  [1230, 200],
  [1330, 120],
  [1440, 190],
];

// Polyline string + filled path for the front mountains.
// vocab: .join(",") = "x,y"; .join(" ") = space-separated points for an SVG polyline
const PEAKS_TOP = RIDGE.map((p) => p.join(",")).join(" ");
// vocab: SVG path M/L/Z = Move to, Line to, close shape (Z back to start)
const PEAKS_PATH = `M0,320 L${PEAKS_TOP.replaceAll(" ", " L")} L1440,320 Z`;
// Distant back-range silhouette (hardcoded path)
const PEAKS_BACK =
  "M0,320 L0,240 L100,160 L180,220 L300,120 L420,230 L520,150 L640,240 L760,110 L900,230 L1020,150 L1140,230 L1240,140 L1360,220 L1440,180 L1440,320 Z";

// Indexes of local peaks (lower than both neighbors) — used for fan lines.
// vocab: .filter = keep only indexes that pass the “is a peak” test
const APEX_IDX = RIDGE.map((_, i) => i).filter(
  (i) => i > 0 && i < RIDGE.length - 1 && RIDGE[i][1] < RIDGE[i - 1][1] && RIDGE[i][1] < RIDGE[i + 1][1],
);

// Front layer — gradient mountain, dots, peak accents, neon outline
const PeaksFront = (
  <>
    <defs>
      <linearGradient id="mtnGradPeaks" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd76f" />
        <stop offset="45%" stopColor="#ff9a3d" />
        <stop offset="100%" stopColor="#ff2bd6" />
      </linearGradient>
      <clipPath id="peaksClip">
        <path d={PEAKS_PATH} />
      </clipPath>
    </defs>
    <path fill="url(#mtnGradPeaks)" d={PEAKS_PATH} />
    {/* Speckle dots clipped to the mountain shape */}
    <g clipPath="url(#peaksClip)">
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#ffe9b0" opacity={d.o} />
      ))}
    </g>
    {/* From each apex: fan lines down + cross-bars along the slopes */}
    {/* vocab: .flatMap = map each apex to several lines, then flatten into one array */}
    {APEX_IDX.flatMap((i) => {
      const [x, y] = RIDGE[i];
      const lines = [-80, -45, 45, 80].map((dx, k) => (
        <line
          key={`f${i}-${k}`}
          x1={x}
          y1={y}
          x2={x + dx}
          y2="320"
          stroke="#ff5ca8"
          strokeWidth="1"
          opacity="0.2"
        />
      ));
      // Cross-bars at 38% and 72% of the way down each side slope
      [0.38, 0.72].forEach((t, k) => {
        const [lx, ly] = lerp(RIDGE[i], RIDGE[i - 1], t);
        const [rx, ry] = lerp(RIDGE[i], RIDGE[i + 1], t);
        lines.push(
          <line
            key={`c${i}-${k}`}
            x1={lx}
            y1={ly}
            x2={rx}
            y2={ry}
            stroke="#ffd76f"
            strokeWidth="1.2"
            opacity="0.3"
          />,
        );
      });
      return lines;
    })}
    <NeonRidge points={PEAKS_TOP} color="#ff2bd6" />
  </>
);

// Back layer — softer distant range
const PeaksBack = (
  <>
    <defs>
      <linearGradient id="mtnGradBackPeaks" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff9a3d" />
        <stop offset="100%" stopColor="#ff2bd6" />
      </linearGradient>
    </defs>
    <path fill="url(#mtnGradBackPeaks)" opacity="0.4" d={PEAKS_BACK} />
  </>
);

export const mountainsScene: RetroScene = {
  back: PeaksBack,
  front: PeaksFront,
};
