// Section 03 — Best use cases per DESIGN.md § 5.1D.
// Night field, mouse-lit grid, chapter rail ("How it works").
// Pinned sideways scroll: cards are in ONE continuous horizontal row and move
// towards the left as you scroll down.
// Each card has a layered 2-card structure:
// - A primary card in front (paper ground, ink border) showing the information.
// - A second card behind it with the orange-pink-magenta gradient (--grad).

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TornEdge from "@/ui/shared/TornEdge";
import ChapterRail from "./ChapterRail";
import MouseGridBackground from "./MouseGridBackground";

import ucPeers from "@/ui/shared/assets/small-assets/recolored/use-case-peers.png";
import ucStudy from "@/ui/shared/assets/small-assets/recolored/use-case-study.png";
import ucEvents from "@/ui/shared/assets/small-assets/recolored/use-case-events.png";
import ucNetwork from "@/ui/shared/assets/small-assets/recolored/use-case-network.png";
import ucAnxiety from "@/ui/shared/assets/small-assets/recolored/use-case-anxiety.png";
import ucFeedback from "@/ui/shared/assets/small-assets/recolored/use-case-feedback.png";
import ucDecisions from "@/ui/shared/assets/small-assets/recolored/use-case-decisions.png";
import ucHelp from "@/ui/shared/assets/small-assets/recolored/use-case-help.png";

gsap.registerPlugin(ScrollTrigger);

const USE_CASES = [
  {
    num: "01",
    icon: ucPeers,
    title: "Finding a friend or peer",
    text: "Find someone who shares your interests, goals or experiences. This can be a friend, a study partner or a mentor.",
  },
  {
    num: "02",
    icon: ucStudy,
    title: "Searching for study groups",
    text: "Find a study group that meets your needs: for a specific course, a specific project or a specific interest.",
  },
  {
    num: "03",
    icon: ucEvents,
    title: "Events and opportunities",
    text: "A job fair, a workshop, a hackathon, a study session or a social event. A great way to meet new people and get involved.",
  },
  {
    num: "04",
    icon: ucNetwork,
    title: "Building a professional network",
    text: "Connect with people who share your interests, goals or experiences, whether a mentor, a colleague or a friend.",
  },
  {
    num: "05",
    icon: ucAnxiety,
    title: "Less anxiety for commuters",
    text: "Know who you align with, emotionally and professionally, and feel more connected to the community even when you're off campus.",
  },
  {
    num: "06",
    icon: ucFeedback,
    title: "Feedback on your experiences",
    text: "Not everyone is confident in what they do. Devora is a quick way to get honest feedback from peers.",
  },
  {
    num: "07",
    icon: ucDecisions,
    title: "Navigating academic decisions",
    text: "Ask upperclassmen which classes are worth it, and find reviews on professors.",
  },
  {
    num: "08",
    icon: ucHelp,
    title: "Help from classmates",
    text: "Ask peers who've already taken the class, navigated the same major or been through the same career questions.",
  },
];

export default function BestUseCases() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    const count = countRef.current;
    if (!section || !track) return;

    // Calculate total horizontal travel distance:
    // How far the track needs to travel left so the last card reaches the viewport
    const getTravelDistance = () => {
      const scrollW = track.scrollWidth;
      const winW = window.innerWidth;
      return Math.max(0, scrollW - winW + Math.min(winW * 0.45, 520));
    };

    const ctx = gsap.context(() => {
      const travelDist = getTravelDistance();
      if (travelDist <= 0) return;

      gsap.to(track, {
        x: () => -getTravelDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top 68px", // Pinned just below the 68px navigation bar
          end: () => `+=${Math.max(1600, getTravelDistance() * 1.25)}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Update progress bar scale
            if (bar) {
              bar.style.transform = `scaleX(${Math.max(0.125, self.progress)})`;
            }
            // Update "01 / 08" counter
            if (count) {
              const currentNum = Math.min(8, Math.max(1, Math.ceil(self.progress * 8)));
              count.textContent = `${String(currentNum).padStart(2, "0")} / 08`;
            }
          },
        },
      });
    }, section);

    // Refresh after DOM layout and images settle
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="best-use-cases"
      className="scene scene-night relative overflow-hidden"
      style={{
        background: "var(--night)",
        color: "var(--text)",
        position: "relative",
      }}
    >
      <TornEdge color="var(--night)" />

      <MouseGridBackground as="div">
        <div className="wrap">
          <div className="chapter-grid">
            <ChapterRail label="How it works" field="night" />

            {/* Header row */}
            <div className="use-cases-header-row">
              <div>
                <h2 className="t-title text-[var(--text)]">Best use cases</h2>
                <p className="lead text-[var(--text-body)] mt-2">
                  Eight things CECS students open Devora for. Keep scrolling to
                  move through them.
                </p>
              </div>

              {/* Progress block */}
              <div className="use-cases-progress-block">
                <span
                  ref={countRef}
                  className="mono text-white text-[14px] font-bold"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  01 / 08
                </span>
                <div className="use-cases-track-bar">
                  <div
                    ref={barRef}
                    className="use-cases-fill-bar"
                    style={{ transform: "scaleX(0.125)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Track — Always in ONE horizontal row moving towards the left */}
        <div className="use-cases-viewport">
          <div ref={trackRef} className="use-cases-track">
            {USE_CASES.map((uc) => (
              <div key={uc.num} className="use-case-card-wrapper">
                {/* Second card behind it with gradient */}
                <div className="card-behind-gradient" aria-hidden="true" />

                {/* Primary card in front showing the information */}
                <div className="primary-card-face">
                  {/* Big faint number top-right */}
                  <span className="card-faint-number" aria-hidden="true">
                    {uc.num}
                  </span>

                  <div className="card-icon-container">
                    <Image
                      src={uc.icon}
                      alt=""
                      width={54}
                      height={54}
                      className="object-contain"
                    />
                  </div>

                  <h3 className="t-card card-title">{uc.title}</h3>

                  <p className="card-text">
                    {uc.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MouseGridBackground>

      <style jsx>{`
        :global(#best-use-cases) {
          padding-top: 16px !important;
          padding-bottom: 24px !important;
        }

        .use-cases-header-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 18px;
        }

        @media (min-width: 768px) {
          .use-cases-header-row {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
          }
        }

        .use-cases-progress-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .use-cases-progress-block {
            align-items: flex-end;
          }
        }

        .use-cases-track-bar {
          width: 140px;
          height: 6px;
          border-radius: 999px;
          background: var(--surface-2);
          overflow: hidden;
        }

        .use-cases-fill-bar {
          height: 100%;
          width: 100%;
          border-radius: 999px;
          background: var(--grad);
          transform-origin: left;
          transition: transform 60ms linear;
        }

        .use-cases-viewport {
          width: 100%;
          overflow: visible;
          padding-block: 8px 24px;
        }

        /* ONE horizontal row, no wrapping */
        .use-cases-track {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 28px;
          width: max-content;
          will-change: transform;
          padding-left: max(
            calc((100vw - 1240px) / 2 + var(--gutter) + 198px),
            var(--gutter)
          );
          padding-right: 25vw;
        }

        @media (max-width: 1099px) {
          .use-cases-track {
            padding-left: max(var(--gutter), 24px);
            padding-right: 20vw;
          }
        }

        /* Card Wrapper holding the two-card layer */
        .use-case-card-wrapper {
          position: relative;
          width: clamp(280px, 78vw, 340px);
          min-width: clamp(280px, 78vw, 340px);
          flex-shrink: 0;
          user-select: none;
        }

        /* Second card behind it: orange-pink-magenta gradient */
        .card-behind-gradient {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: var(--grad);
          border: 2px solid var(--ink);
          transform: translate(8px, 8px);
          z-index: 1;
          pointer-events: none;
          transition: transform 0.25s var(--spring);
        }

        /* Primary card in front: paper face, ink border, showing information */
        .primary-card-face {
          position: relative;
          z-index: 2;
          border-radius: 16px;
          background: var(--paper);
          color: var(--ink);
          border: 2px solid var(--ink);
          padding: 22px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 250px;
          height: 100%;
          transition: transform 0.25s var(--spring);
        }

        /* Hover: primary card lifts, second card behind extends */
        .use-case-card-wrapper:hover .primary-card-face {
          transform: translate(-3px, -3px);
        }

        .use-case-card-wrapper:hover .card-behind-gradient {
          transform: translate(12px, 12px);
        }

        .use-case-card-wrapper:active .primary-card-face {
          transform: translate(4px, 4px);
        }

        .use-case-card-wrapper:active .card-behind-gradient {
          transform: translate(4px, 4px);
        }

        .card-icon-container {
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          margin-bottom: 2px;
        }

        .card-title {
          color: var(--ink);
          font-size: clamp(16.5px, 1.4vw, 19px);
          line-height: 1.2;
          margin: 0;
        }

        .card-text {
          font-size: 14px;
          line-height: 1.48;
          color: var(--ink-body);
          margin: 0;
        }

        .card-faint-number {
          position: absolute;
          top: 16px;
          right: 18px;
          font-family: var(--f-display);
          font-weight: 800;
          font-size: 34px;
          line-height: 1;
          color: var(--paper-2);
          user-select: none;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
