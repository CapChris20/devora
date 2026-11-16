// Hero section for the Devora Activity Center.
// Displays the eyebrow, big letter-staggered display title, accent strip, lede, and WeekTiles.
// Coordinates GSAP intro sequence on page mount, respecting reduced motion settings.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import WeekTiles from "./WeekTiles";

// ===== NAMED CONSTANTS =====

const TITLE_LINE_ONE = "Activity";
const TITLE_LINE_TWO = "Center";

// ===== MAIN COMPONENT =====

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

        timeline
          .from(".hero-char", {
            yPercent: 110,
            rotation: 8,
            duration: 0.7,
            stagger: 0.035,
            clearProps: "transform,opacity,visibility",
          })
          .from(
            stripRef.current,
            {
              scaleX: 0,
              duration: 0.6,
              ease: "expo.out",
              clearProps: "transform",
            },
            "-=0.35"
          )
          .from(
            [eyebrowRef.current, ledeRef.current],
            {
              y: 16,
              autoAlpha: 0,
              duration: 0.5,
              stagger: 0.08,
              clearProps: "transform,opacity,visibility",
            },
            "-=0.45"
          );
      });
    },
    { scope: heroRef }
  );

  return (
    <section ref={heroRef} className="hero w-full">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 items-end">
        {/* Left column: Title & text */}
        <div>
          <p
            ref={eyebrowRef}
            className="flex items-center gap-2 mb-3.5 font-nb-mono text-[11px] font-bold tracking-[0.18em] uppercase text-nb-muted"
          >
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full border-2 border-nb-ink bg-nb-brand flex-shrink-0"
            />
            <span>Mon, Nov 16 · Week 12 of fall</span>
          </p>

          <h1
            aria-label="Activity Center"
            className="font-nb-display font-normal uppercase text-[clamp(48px,9vw,104px)] leading-[0.88] tracking-[-0.03em] m-0 text-nb-ink"
          >
            <span className="block overflow-hidden pb-[0.04em]" aria-hidden="true">
              {TITLE_LINE_ONE.split("").map((char, index) => (
                <span
                  key={`line1-${index}`}
                  className="hero-char inline-block will-change-transform"
                >
                  {char}
                </span>
              ))}
            </span>
            <span className="block overflow-hidden pb-[0.04em]" aria-hidden="true">
              {TITLE_LINE_TWO.split("").map((char, index) => (
                <span
                  key={`line2-${index}`}
                  className="hero-char inline-block will-change-transform"
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>

          <div
            ref={stripRef}
            aria-hidden="true"
            className="w-40 h-3.5 mt-4 sm:mt-5 rounded-full border-nb border-nb-ink bg-nb-accent origin-left"
          />

          <p
            ref={ledeRef}
            className="mt-4 sm:mt-5 max-w-[46ch] text-lg leading-[1.55] text-nb-muted font-normal"
          >
            Events, study groups and the people you study with. Built for commuters
            who can&apos;t hang around campus.
          </p>
        </div>

        {/* Right column: Bento tiles */}
        <div>
          <WeekTiles />
        </div>
      </div>
    </section>
  );
}
