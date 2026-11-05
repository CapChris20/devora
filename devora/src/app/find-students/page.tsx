// Discovery Grid page per DESIGN.md § 5.3.
// Halftone Dots animated background in Devora brand gradient taking over the whole page.
// Hero band with quieted isometric cube SVG texture,
// h1.t-band "Discovery Grid", lead blurb, toolbar, and the live student grid.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import DiscoveryGridContent from "@/ui/discovery/DiscoveryGridContent";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

const S = 36;
const W = 62.3538; // sqrt(3) * 36
const H = 108; // 3 * S

function IsometricCube({ x, y }: { x: number; y: number }) {
  const halfW = W / 2;
  const halfS = S / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Top face */}
      <polygon
        points={`0,0 ${halfW},${halfS} 0,${S} -${halfW},${halfS}`}
        style={{ fill: "var(--cube-top, #241e24)" }}
        stroke="#ff5ca8"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
      {/* Left face */}
      <polygon
        points={`-${halfW},${halfS} 0,${S} 0,${2 * S} -${halfW},${1.5 * S}`}
        style={{ fill: "var(--cube-left, #191519)" }}
        stroke="#ff5ca8"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
      {/* Right face */}
      <polygon
        points={`0,${S} ${halfW},${halfS} ${halfW},${1.5 * S} 0,${2 * S}`}
        style={{ fill: "var(--cube-right, #121012)" }}
        stroke="#ff5ca8"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
    </g>
  );
}

export default function DiscoveryGridPage() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <BackgroundPicture variant="discovery" />

      <div className="relative z-10 min-h-screen">
        <NavBar activeItem="Discovery Grid" />

        {/* ── Hero band ── */}
        <section className="disc-hero">
          {/* Isometric Pattern SVG overlay */}
          <svg
            className="cubes opacity-40"
            width="100%"
            height="100%"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="cubePattern"
                width={W}
                height={H}
                patternUnits="userSpaceOnUse"
              >
                <IsometricCube x={0} y={0} />
                <IsometricCube x={W} y={0} />
                <IsometricCube x={W / 2} y={1.5 * S} />
                <IsometricCube x={0} y={H} />
                <IsometricCube x={W} y={H} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cubePattern)" />
          </svg>

          {/* Content */}
          <div className="wrap">
            <h1 className="t-band text-[var(--text)]">Discovery Grid</h1>
            <p className="lead">
              Find friends, colleagues and people in your career niche across CECS.
            </p>
          </div>
        </section>

        {/* ── Main Grid Container ── */}
        <main className="wrap pb-24 pt-6">
          <DiscoveryGridContent />
        </main>

        <Footer />
      </div>
    </div>
  );
}
