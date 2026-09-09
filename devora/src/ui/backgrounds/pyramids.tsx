// SVG art for the desert pyramids retro background scene.
// Three front pyramids with brick lines + neon edges; two distant back silhouettes.
// Legacy art — hero now uses Voronoi; keep this if you revive a retro scene picker.
// Manipulate here: edit PYRAMIDS apex/left/right to move or resize each pyramid.

import { DOTS, NeonRidge, type RetroScene } from "./background-helpers";

// Pyramid geometry — apex [x,y], left/right base x (base sits on ground line y=320)
const PYRAMIDS = [
  { id: "pa", apex: [400, 55] as [number, number], left: 170, right: 630 },
  { id: "pb", apex: [940, 90] as [number, number], left: 760, right: 1120 },
  { id: "pc", apex: [1280, 150] as [number, number], left: 1180, right: 1380 },
];

// Front layer — shaded faces, brick hatch, speckles, neon outline
const PyramidsFront = (
  <>
    <defs>
      {/* Clip each pyramid so hatch/dots stay inside the triangle */}
      {/* vocab: clipPath = SVG mask — drawing outside the triangle is hidden */}
      {PYRAMIDS.map((p) => (
        <clipPath key={p.id} id={p.id}>
          <polygon points={`${p.left},320 ${p.apex[0]},${p.apex[1]} ${p.right},320`} />
        </clipPath>
      ))}
    </defs>
    {PYRAMIDS.map((p) => {
      // vocab/symbol: [ax, ay] = destructure apex x/y into two locals
      const [ax, ay] = p.apex;
      return (
        <g key={p.id}>
          {/* Lit left face vs darker right face */}
          {/* vocab: <polygon> = filled triangle from three "x,y" points */}
          <polygon points={`${p.left},320 ${ax},${ay} ${ax},320`} fill="#4b1168" />
          <polygon points={`${ax},320 ${ax},${ay} ${p.right},320`} fill="#150822" />
          <g clipPath={`url(#${p.id})`}>
            {/* Horizontal "brick" courses */}
            {/* vocab: Array.from length = how many brick lines fit between apex and ground */}
            {Array.from({ length: Math.floor((320 - ay) / 26) }, (_, r) => (
              <line
                key={r}
                x1="0"
                x2="1440"
                y1={ay + 20 + r * 26}
                y2={ay + 20 + r * 26}
                stroke="#ffd76f"
                strokeWidth="1.5"
                opacity="0.16"
              />
            ))}
            {/* Diagonal hatch toward the apex */}
            {Array.from({ length: 20 }, (_, k) => (
              <line
                key={`h${k}`}
                x1={p.left - 320 + k * 36}
                y1="320"
                x2={p.left - 320 + k * 36 + 265}
                y2={ay}
                stroke="#ff9a3d"
                strokeWidth="1"
                opacity="0.1"
              />
            ))}
            {/* Speckle dots inside the clipped triangle */}
            {DOTS.map((d, i) => (
              <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill="#ffd76f" opacity={d.o * 0.8} />
            ))}
          </g>
          {/* Soft + bright center ridge from apex to base */}
          <line x1={ax} y1={ay} x2={ax} y2="320" stroke="#ffd76f" strokeWidth="7" opacity="0.14" />
          <line x1={ax} y1={ay} x2={ax} y2="320" stroke="#ffd76f" strokeWidth="2" opacity="0.55" />
        </g>
      );
    })}
    {/* Neon outline along each pyramid silhouette */}
    {PYRAMIDS.map((p) => (
      <NeonRidge
        key={`r-${p.id}`}
        points={`${p.left},320 ${p.apex[0]},${p.apex[1]} ${p.right},320`}
        color="#ffd76f"
      />
    ))}
  </>
);

// Back layer — two simpler distant pyramids
const PyramidsBack = (
  <>
    <polygon points="60,320 240,150 420,320" fill="#3d1160" opacity="0.75" />
    <polygon points="1020,320 1180,190 1340,320" fill="#3d1160" opacity="0.75" />
  </>
);

export const pyramidsScene: RetroScene = {
  back: PyramidsBack,
  front: PyramidsFront,
};
