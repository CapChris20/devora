// Chapter rail for Home sections — DESIGN.md § 4.3.
// Holds the section's mono label and a scroll-linked meter.
// Desktop: 150px sticky rail pinned at calc(var(--nav-h) + 28px).
// Mobile (<1100px): inline row with 72px meter above the title.

"use client";

import { useEffect, useRef, useState } from "react";

type ChapterRailProps = {
  label: string;
  field?: "night" | "paper" | "pink" | "orange";
};

export default function ChapterRail({ label, field = "night" }: ChapterRailProps) {
  const [progress, setProgress] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = railRef.current?.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const h = rect.height;
      if (h <= 0) return;
      // Section scroll progress: (innerHeight * 0.35 - rect.top) / rect.height per § 7.4
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.35 - rect.top) / h));
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fillBackground = field === "night" ? "var(--grad)" : "currentColor";

  return (
    <div ref={railRef} className="chapter-rail-container">
      {/* Desktop sticky rail */}
      <div className="chapter-rail-desktop">
        <span className="mono chapter-rail-label">{label}</span>
        <div className="chapter-rail-track">
          <div
            className="chapter-rail-fill"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: fillBackground,
            }}
          />
        </div>
      </div>

      {/* Mobile inline header (<1100px) */}
      <div className="chapter-rail-mobile">
        <span className="mono chapter-rail-label">{label}</span>
        <div className="chapter-rail-track-mobile">
          <div
            className="chapter-rail-fill"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: fillBackground,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .chapter-rail-container {
          position: relative;
        }
        .chapter-rail-desktop {
          display: none;
        }
        .chapter-rail-mobile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .chapter-rail-label {
          color: currentColor;
          opacity: 0.85;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
        }
        .chapter-rail-track {
          width: 120px;
          height: 4px;
          border-radius: 999px;
          background: currentColor;
          opacity: 0.25;
          position: relative;
          overflow: hidden;
          margin-top: 10px;
        }
        .chapter-rail-track-mobile {
          width: 72px;
          height: 4px;
          border-radius: 999px;
          background: currentColor;
          opacity: 0.25;
          position: relative;
          overflow: hidden;
        }
        .chapter-rail-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 80ms linear;
        }
        @media (min-width: 1100px) {
          .chapter-rail-desktop {
            display: flex;
            flex-direction: column;
            position: sticky;
            top: calc(var(--nav-h) + 28px);
            align-self: start;
          }
          .chapter-rail-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

