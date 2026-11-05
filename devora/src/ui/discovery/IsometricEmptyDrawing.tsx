// Isometric SVG drawing for the Discovery Grid empty state per DESIGN.md § 6.4.
// viewBox 600x500 with projection:
// x' = (x - y) * cos(30) * u + 300
// y' = (x + y) * sin(30) * u - z * u + 110
// with u = 52.
// Base slab 6x6x0.45 in #2a2329.
// 6x6 grid of 0.8 tiles in #e8dde2, minus tile (3,2) which has an ink hole + pink dashed outline.
// Lifted orange tile at z = 1.7 with a pink person, bobbing vertically.

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);
const U = 52;

function project(x: number, y: number, z: number): [number, number] {
  const px = (x - y) * COS30 * U + 300;
  const py = (x + y) * SIN30 * U - z * U + 140;
  return [Math.round(px * 10) / 10, Math.round(py * 10) / 10];
}

function projectPoly(coords: [number, number, number][]): string {
  return coords
    .map(([x, y, z]) => {
      const [px, py] = project(x, y, z);
      return `${px},${py}`;
    })
    .join(" ");
}

export default function IsometricEmptyDrawing() {
  const bobGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!bobGroupRef.current) return;

    // The lifted group bobs: y: -14, 1.6s, sine.inOut, yoyo, repeat forever per § 7.5
    const tween = gsap.to(bobGroupRef.current, {
      y: -14,
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, []);

  // Base slab 6x6x0.45 at z=0..0.45
  const slabTop = projectPoly([
    [0, 0, 0.45],
    [6, 0, 0.45],
    [6, 6, 0.45],
    [0, 6, 0.45],
  ]);
  const slabLeft = projectPoly([
    [0, 6, 0.45],
    [6, 6, 0.45],
    [6, 6, 0],
    [0, 6, 0],
  ]);
  const slabRight = projectPoly([
    [6, 0, 0.45],
    [6, 6, 0.45],
    [6, 6, 0],
    [6, 0, 0],
  ]);

  // Generate 6x6 tiles at z = 0.45..0.55
  const tiles: Array<{
    top: string;
    left: string;
    right: string;
    isHole?: boolean;
  }> = [];

  for (let ix = 0; ix < 6; ix++) {
    for (let iy = 0; iy < 6; iy++) {
      const isHole = ix === 3 && iy === 2;
      const x0 = ix + 0.1;
      const x1 = ix + 0.9;
      const y0 = iy + 0.1;
      const y1 = iy + 0.9;
      const z0 = 0.45;
      const z1 = 0.55;

      const top = projectPoly([
        [x0, y0, z1],
        [x1, y0, z1],
        [x1, y1, z1],
        [x0, y1, z1],
      ]);
      const left = projectPoly([
        [x0, y1, z1],
        [x1, y1, z1],
        [x1, y1, z0],
        [x0, y1, z0],
      ]);
      const right = projectPoly([
        [x1, y0, z1],
        [x1, y1, z1],
        [x1, y1, z0],
        [x1, y0, z0],
      ]);

      tiles.push({ top, left, right, isHole });
    }
  }

  // Lifted tile at z = 1.7..1.8 with person
  const lx0 = 3.1;
  const lx1 = 3.9;
  const ly0 = 2.1;
  const ly1 = 2.9;
  const lz0 = 1.7;
  const lz1 = 1.8;

  const liftedTop = projectPoly([
    [lx0, ly0, lz1],
    [lx1, ly0, lz1],
    [lx1, ly1, lz1],
    [lx0, ly1, lz1],
  ]);
  const liftedLeft = projectPoly([
    [lx0, ly1, lz1],
    [lx1, ly1, lz1],
    [lx1, ly1, lz0],
    [lx0, ly1, lz0],
  ]);
  const liftedRight = projectPoly([
    [lx1, ly0, lz1],
    [lx1, ly1, lz1],
    [lx1, ly1, lz0],
    [lx1, ly0, lz0],
  ]);

  // Person: body box 0.5x0.5x0.85 sitting on the lifted tile
  const bx0 = 3.25;
  const bx1 = 3.75;
  const by0 = 2.25;
  const by1 = 2.75;
  const bz0 = 1.8;
  const bz1 = 2.65;

  const bodyTop = projectPoly([
    [bx0, by0, bz1],
    [bx1, by0, bz1],
    [bx1, by1, bz1],
    [bx0, by1, bz1],
  ]);
  const bodyLeft = projectPoly([
    [bx0, by1, bz1],
    [bx1, by1, bz1],
    [bx1, by1, bz0],
    [bx0, by1, bz0],
  ]);
  const bodyRight = projectPoly([
    [bx1, by0, bz1],
    [bx1, by1, bz1],
    [bx1, by1, bz0],
    [bx1, by0, bz0],
  ]);

  // Head center projection
  const [hx, hy] = project(3.5, 2.5, 2.9);

  // Dashed line from hole center to lifted tile center
  const [holeX, holeY] = project(3.5, 2.5, 0.55);
  const [liftedBottomX, liftedBottomY] = project(3.5, 2.5, 1.7);

  return (
    <svg
      viewBox="0 0 600 500"
      className="w-full h-auto max-w-[480px] mx-auto select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="isoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9a3d" />
          <stop offset="52%" stopColor="#ff5ca8" />
          <stop offset="100%" stopColor="#ff2bd6" />
        </linearGradient>
      </defs>

      {/* Base slab */}
      <polygon points={slabTop} fill="#2a2329" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={slabLeft} fill="#1c171b" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={slabRight} fill="#110d10" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />

      {/* Tiles */}
      {tiles.map((t, i) => {
        if (t.isHole) {
          // Missing tile: drawn as ink tile with 2px dashed outline
          return (
            <polygon
              key={i}
              points={t.top}
              fill="#0d0b0e"
              stroke="url(#isoGrad)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinejoin="round"
            />
          );
        }
        return (
          <g key={i}>
            <polygon points={t.top} fill="#e8dde2" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
            <polygon points={t.left} fill="#b8aeb3" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
            <polygon points={t.right} fill="#8a8286" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
          </g>
        );
      })}

      {/* Dashed gradient tether line from hole to lifted tile */}
      <line
        x1={holeX}
        y1={holeY}
        x2={liftedBottomX}
        y2={liftedBottomY}
        stroke="url(#isoGrad)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Bobbing lifted tile & person group */}
      <g ref={bobGroupRef}>
        {/* Lifted Orange Tile */}
        <polygon points={liftedTop} fill="#ff9a3d" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={liftedLeft} fill="#cc7b30" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={liftedRight} fill="#995c24" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />

        {/* Gradient Person Body */}
        <polygon points={bodyTop} fill="url(#isoGrad)" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={bodyLeft} fill="#cc4b8a" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={bodyRight} fill="#8c2f5b" stroke="#0d0b0e" strokeWidth="2" strokeLinejoin="round" />

        {/* Gradient Person Head */}
        <circle cx={hx} cy={hy} r="14" fill="url(#isoGrad)" stroke="#0d0b0e" strokeWidth="2" />
      </g>
    </svg>
  );
}

