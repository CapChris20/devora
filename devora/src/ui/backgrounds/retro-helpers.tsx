import type { ReactNode } from "react";

export const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 41.3) % 100,
  top: (i * 27.1) % 50,
  size: 1 + ((i * 7) % 3),
  delay: (i % 10) * 0.35,
}));

export const DOTS = Array.from({ length: 170 }, (_, i) => ({
  x: (i * 97) % 1440,
  y: 45 + ((i * 53) % 275),
  r: 0.8 + (i % 3) * 0.5,
  o: 0.08 + ((i * 7) % 10) / 45,
}));

export const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

type NeonRidgeProps = {
  points: string;
  color: string;
};

export function NeonRidge({ points, color }: NeonRidgeProps) {
  return (
    <>
      <polyline points={points} fill="none" stroke={color} strokeWidth="9" opacity="0.22" strokeLinejoin="round" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" opacity="0.95" strokeLinejoin="round" />
    </>
  );
}

export type RetroScene = {
  back: ReactNode;
  front: ReactNode;
};
