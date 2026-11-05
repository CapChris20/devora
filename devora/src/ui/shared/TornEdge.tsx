// Torn-paper seam SVG that sits at the bottom of a section to overlap the next.
// The jagged polygon is seeded so it stays stable across renders.
// DESIGN.md § 4.1 — absolutely positioned at top: -26px of the FOLLOWING section,
// or at the bottom of the preceding section. Here we position it at the bottom of the
// parent so callers don't need to manage z-index stacking on the child.

// ===== TYPES =====

type TornEdgeProps = {
  /** The fill colour of the section below — the colour the torn edge should be. */
  color: string;
  /** Extra class on the wrapper. */
  className?: string;
};

// ===== SEEDED JITTER =====

/** Deterministic pseudo-random sequence so SSR and client match. */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildTornPoints(): string {
  const rand = seededRandom(42);
  const points: [number, number][] = [[0, 28]];
  let x = 0;
  while (x < 1440) {
    const step = 24 + rand() * 30; // 24 – 54px steps
    x = Math.min(x + step, 1440);
    const y = 4 + rand() * 20; // 4 – 24px top jag
    points.push([Math.round(x), Math.round(y)]);
  }
  points.push([1440, 28]);
  return points.map(([px, py]) => `${px},${py}`).join(" ");
}

const TORN_POINTS = buildTornPoints();

// ===== MAIN COMPONENT =====

/**
 * SVG torn-paper edge. Place at the bottom of a section so the jagged polygon
 * in the following section's colour overlaps the seam.
 */
export default function TornEdge({ color, className = "" }: TornEdgeProps) {
  const isGradient = color === "var(--grad)" || color === "gradient";
  const gradId = "devora-torn-grad";
  const fillValue = isGradient ? `url(#${gradId})` : color;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 28"
      preserveAspectRatio="none"
      className={className}
      style={{
        position: "absolute",
        bottom: -26,
        left: 0,
        right: 0,
        width: "100%",
        height: 28,
        display: "block",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      {isGradient && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff9a3d" />
            <stop offset="52%" stopColor="#ff5ca8" />
            <stop offset="100%" stopColor="#ff2bd6" />
          </linearGradient>
        </defs>
      )}
      <polygon points={TORN_POINTS} fill={fillValue} />
    </svg>
  );
}

