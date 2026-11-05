// Section 01 — “What is Devora?” per DESIGN.md § 5.1A.
// Night field, mouse-lit grid, chapter rail ("The platform").
// Panel with orange/pink corner marks, blinking prompt, Lottie frame,
// three claim rows, and footer row linking to /find-students.

"use client";

import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";
import whatIsDevoraAnimation from "@/ui/shared/assets/lottie-animations/recolored/what-is-devora.json";
import MovingAnimation from "./MovingAnimation";
import MouseGridBackground from "./MouseGridBackground";
import ChapterRail from "./ChapterRail";

const CLAIMS = [
  {
    code: "01",
    title: "100% CECS verified",
    text: "UM\u2011Dearborn only. No recruiters, no bots, no off-campus noise.",
  },
  {
    code: "02",
    title: "Every major and track",
    text: "CIS, CE, SE, DS and the rest of the building in one searchable grid.",
  },
  {
    code: "03",
    title: "Find your people",
    text: "Friends, colleagues and study crews in your career niche.",
  },
];

export default function WhatIsDevora() {
  return (
    <section
      id="what-is-devora"
      className="scene scene-night"
      style={{
        background: "var(--night)",
        color: "var(--text)",
        position: "relative",
      }}
    >
      <MouseGridBackground as="div">
        <div className="wrap what-is-wrap">
          <div className="chapter-grid">
            {/* Sticky chapter rail */}
            <ChapterRail label="The platform" field="night" />

            {/* Main Section Content */}
            <div>
              {/* Panel */}
              <div className="what-is-poster-panel">
                {/* Corner marks: 28px L-shape 3px border. Orange top-left, pink bottom-right */}
                <span className="corner-mark corner-mark-tl" aria-hidden="true" />
                <span className="corner-mark corner-mark-br" aria-hidden="true" />

                {/* 1. Prompt line: pink >, peers.find(friends && niche), blinking caret */}
                <div className="prompt-line">
                  <span className="prompt-angle">&gt;</span>
                  <span className="prompt-text">peers.find(friends &amp;&amp; niche)</span>
                  <span className="prompt-caret" aria-hidden="true" />
                </div>

                {/* 2. Headline */}
                <h2 className="t-title what-is-headline">
                  What is Devora?
                </h2>

                {/* 3. Two-column grid */}
                <div className="what-is-columns">
                  {/* Left: Lottie frame */}
                  <div className="lottie-frame">
                    <div className="lottie-glow" aria-hidden="true" />
                    <div className="lottie-inner">
                      <MovingAnimation
                        animationData={whatIsDevoraAnimation}
                        ariaLabel="What is Devora animation"
                        className="w-full h-full max-w-[420px] max-h-[250px] mx-auto aspect-[16/10]"
                      />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="claims-column">
                    <p className="lead what-is-lead">
                      The official hub for <strong>networking</strong>,{" "}
                      <strong>CECS events</strong> and{" "}
                      <strong>finding your people</strong>, built only for
                      Computer Engineering and Computer Science students at
                      UM&#8209;Dearborn.
                    </p>

                    {/* Three claim rows */}
                    <div className="claims-grid">
                      {CLAIMS.map((c) => (
                        <div key={c.code} className="claim-row">
                          <span className="claim-code">{c.code}</span>
                          <div className="claim-content">
                            <span className="claim-title">{c.title}:</span>{" "}
                            <span className="claim-text">{c.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer row */}
                    <div className="what-is-footer-row">
                      <div className="concept-connector">
                        <span className="mono text-white">Classmates</span>
                        <div className="connector-arrow">
                          <ArrowRight size={22} color="#ff5ca8" />
                        </div>
                        <span className="mono text-white">Friends</span>
                      </div>

                      <Link href="/find-students" className="btn-primary">
                        <LayoutGrid size={20} />
                        <span>Open the Discovery Grid</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MouseGridBackground>

      <style jsx>{`
        .what-is-wrap {
          max-width: 1400px;
        }

        .what-is-poster-panel {
          position: relative;
          padding: clamp(18px, 2.2vw, 32px);
          border-radius: 24px;
          background: linear-gradient(180deg, rgb(28 24 28 / .92), rgb(18 15 18 / .92));
          border: 2px solid var(--edge);
        }

        .what-is-poster-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: var(--grad);
          translate: 8px 8px;
          z-index: -1;
        }

        .corner-mark {
          position: absolute;
          width: 28px;
          height: 28px;
          pointer-events: none;
        }
        .corner-mark-tl {
          top: 14px;
          left: 14px;
          border-top: 3px solid var(--orange);
          border-left: 3px solid var(--orange);
        }
        .corner-mark-br {
          bottom: 14px;
          right: 14px;
          border-bottom: 3px solid var(--magenta);
          border-right: 3px solid var(--magenta);
        }

        .prompt-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--f-mono);
          font-size: 13.5px;
          margin-bottom: 12px;
        }
        .prompt-angle {
          background: var(--grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
        .prompt-text {
          color: var(--text-muted);
        }
        .prompt-caret {
          display: inline-block;
          width: 9px;
          height: 16px;
          background: #ff5ca8;
          animation: blink 1s steps(1) infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.1%, 100% { opacity: 0; }
        }

        .what-is-headline {
          color: var(--text);
          margin-bottom: 18px;
        }

        .what-is-columns {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: stretch;
        }

        @media (min-width: 980px) {
          .what-is-columns {
            grid-template-columns: 1fr 1.15fr;
            gap: 32px;
          }
        }

        .lottie-frame {
          position: relative;
          border-radius: 18px;
          background: var(--night);
          border: 2px solid var(--edge);
          min-height: 220px;
          max-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 12px;
        }

        .lottie-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 40% 40%, rgba(255, 92, 168, 0.35), transparent 60%),
                      radial-gradient(circle at 70% 70%, rgba(255, 154, 61, 0.25), transparent 50%);
          pointer-events: none;
        }

        .lottie-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .claims-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .what-is-lead {
          color: var(--text-body);
          font-size: clamp(15px, 1.3vw, 17.5px);
          line-height: 1.45;
        }

        .what-is-lead strong {
          color: var(--text);
          font-weight: 700;
        }

        .claims-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .claim-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: var(--surface-2);
          border-radius: 12px;
          padding: 10px 14px;
          border: 2px solid transparent;
          transition: border-color 0.2s ease, translate 0.2s var(--spring);
        }

        .claim-row:hover {
          border-color: #ff5ca8;
          translate: 4px 0;
        }

        .claim-code {
          font-family: var(--f-mono);
          font-size: 14px;
          font-weight: 700;
          background: var(--grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .claim-content {
          font-size: 15.5px;
          line-height: 1.45;
        }

        .claim-title {
          font-weight: 700;
          color: var(--text);
        }

        .claim-text {
          color: var(--text-muted);
        }

        .what-is-footer-row {
          margin-top: auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 16px;
        }

        .concept-connector {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .connector-arrow {
          display: flex;
          align-items: center;
        }
      `}</style>
    </section>
  );
}
