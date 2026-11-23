// Section 01 — “What is Devora?” in the same rounded poster style as the homepage hero.
// Layout: chapter rail ("The platform") → prompt pill + giant sticker headline with "Devora?" on a band →
// left: the laptop animation on a tilted slab with a Classmates → Friends sticker;
// right: the lead line on a plate, three numbered claim cards, and the Discovery Grid pill.
// Motion: GSAP plays once when the section scrolls into view. Styles: what-is-devora.css (wi- classes).

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayoutGrid, ArrowRight } from "lucide-react";

import whatIsDevoraAnimation from "@/ui/shared/assets/lottie-animations/recolored/what-is-devora.json";
import { NB_FONT_CLASS_NAME } from "@/ui/shared/design-law/nb-fonts";
import MovingAnimation from "./MovingAnimation";
import MouseGridBackground from "./MouseGridBackground";
import ChapterRail from "./ChapterRail";
import "./what-is-devora.css";

// vocab: registerPlugin = tell GSAP about ScrollTrigger once so tweens can wait for scrolling
gsap.registerPlugin(ScrollTrigger);

// ===== NAMED CONSTANTS =====

const HEADLINE_FIRST_PART = "What is";
const HEADLINE_BAND_PART = "Devora?";

// Three claims. toneClass picks the round number chip's gradient.
// Manipulate here: edit titles/text, or swap wi-tone-* to recolor a chip
const CLAIMS = [
  {
    code: "01",
    title: "100% CECS verified",
    text: "UM‑Dearborn only. No recruiters, no bots, no off-campus noise.",
    toneClass: "wi-tone-brand",
  },
  {
    code: "02",
    title: "Every major and track",
    text: "CIS, CE, SE, DS and the rest of the building in one searchable grid.",
    toneClass: "wi-tone-sky",
  },
  {
    code: "03",
    title: "Find your people",
    text: "Friends, colleagues and study crews in your career niche.",
    toneClass: "wi-tone-orchid",
  },
] as const;

// vocab: matchMedia query = GSAP only runs the block when this CSS media query is true
const MOTION_ALLOWED_QUERY = "(prefers-reduced-motion: no-preference)";
// Manipulate here: "top 75%" = start when the section's top reaches 75% down the screen
const SCROLL_START_POINT = "top 75%";

// ===== HELPER FUNCTIONS =====

// Inline-block letter spans swallow normal spaces, so spaces become non-breaking ones.
// vocab: \u00a0 = non-breaking space (always takes up room, never collapses)
function toVisibleLetter(letter: string): string {
  if (letter === " ") return "\u00a0";
  return letter;
}

// One word group, split into letter spans so the letters can rise.
// vocab: aria-label = what a screen reader says instead of reading each letter span
function SplitLetters({ text }: { text: string }) {
  return (
    <span className="wi-word" aria-label={text} role="text">
      {Array.from(text).map((letter, index) => (
        <span key={`${letter}-${index}`} className="wi-ch" aria-hidden="true">
          {toVisibleLetter(letter)}
        </span>
      ))}
    </span>
  );
}

// Intro timeline that waits until ScrollTrigger sees the section.
// vocab: timeline = tweens played in order; "-=0.3" = start 0.3s before the previous one ends
function playIntro(sectionElement: HTMLElement) {
  const intro = gsap.timeline({
    defaults: { ease: "power3.out" },
    // vocab: once = play the first time it scrolls into view, never rewind
    scrollTrigger: { trigger: sectionElement, start: SCROLL_START_POINT, once: true },
  });

  // 1. Prompt pill, letters rise, band wipes in behind "Devora?"
  intro
    .from(".wi-prompt", { y: 16, autoAlpha: 0, duration: 0.45 })
    .from(".wi-ch", { yPercent: 110, rotate: 8, autoAlpha: 0, duration: 0.55, stagger: 0.03 }, "-=0.2")
    .from(".wi-band", { scaleX: 0, duration: 0.7, ease: "expo.out" }, "-=0.4");

  // 2. Animation slab deals in from below; sticker pops onto it
  intro
    .from(".wi-backer", { x: -60, rotate: -16, autoAlpha: 0, duration: 0.7, ease: "back.out(1.4)" }, 0.4)
    .from(".wi-slab", { y: 80, rotate: 10, autoAlpha: 0, duration: 0.8, ease: "back.out(1.3)" }, 0.5)
    .from(".wi-connector", { scale: 0, duration: 0.6, ease: "back.out(2.2)" }, 1.0);

  // 3. Right column: lead plate, claim cards deal in one by one, number chips spin in, CTA rises
  intro
    .from(".wi-lead", { y: 24, autoAlpha: 0, duration: 0.5 }, 0.6)
    .from(".wi-claim", { x: 50, rotate: 2, autoAlpha: 0, duration: 0.55, stagger: 0.1, ease: "back.out(1.5)" }, 0.75)
    .from(".wi-claim-chip", { scale: 0, rotate: -140, duration: 0.6, stagger: 0.1, ease: "back.out(2.6)" }, 0.85)
    .from(".wi-cta", { y: 20, autoAlpha: 0, duration: 0.45 }, 1.2);
}

// ===== MAIN COMPONENT =====

export default function WhatIsDevora() {
  const sectionRef = useRef<HTMLElement>(null);

  // GSAP setup. scope = only look for .wi-* classes inside this section; cleans up on unmount.
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(MOTION_ALLOWED_QUERY, () => {
        if (!sectionRef.current) return;
        playIntro(sectionRef.current);
      });
      return () => media.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="what-is-devora"
      className={`scene scene-night wi-section ${NB_FONT_CLASS_NAME}`}
    >
      <MouseGridBackground as="div">
        <div className="wrap wi-wrap">
          <div className="chapter-grid">
            {/* 1. Sticky chapter rail */}
            <ChapterRail label="The platform" field="night" />

            <div>
              {/* 2. Prompt pill with blinking caret */}
              <p className="wi-prompt">
                <span className="wi-prompt-angle" aria-hidden="true">&gt;</span>
                peers.find(friends &amp;&amp; niche)
                <span className="wi-prompt-caret" aria-hidden="true" />
              </p>

              {/* 3. Giant headline: "What is" in sticker letters, "Devora?" on the tilted band */}
              <h2 className="wi-headline">
                <SplitLetters text={HEADLINE_FIRST_PART} />{" "}
                <span className="wi-band-word">
                  <span className="wi-band" aria-hidden="true" />
                  <SplitLetters text={HEADLINE_BAND_PART} />
                </span>
              </h2>

              <div className="wi-columns">
                {/* 4. Left: laptop animation on a tilted slab + Classmates → Friends sticker */}
                <div className="wi-stage">
                  <div className="wi-backer" aria-hidden="true" />
                  <div className="wi-slab">
                    <MovingAnimation
                      animationData={whatIsDevoraAnimation}
                      ariaLabel="What is Devora animation"
                      className="w-full h-full max-w-[440px] mx-auto aspect-[16/10]"
                    />
                  </div>
                  <div className="wi-connector">
                    <span>Classmates</span>
                    <span className="wi-connector-ball" aria-hidden="true">
                      <ArrowRight size={18} strokeWidth={3} />
                    </span>
                    <span>Friends</span>
                  </div>
                </div>

                {/* 5. Right: lead plate, claims, CTA */}
                <div className="wi-right">
                  <p className="wi-lead">
                    The official hub for <strong>networking</strong>,{" "}
                    <strong>CECS events</strong> and{" "}
                    <strong>finding your people</strong>, built only for
                    Computer Engineering and Computer Science students at
                    UM&#8209;Dearborn.
                  </p>

                  <ol className="wi-claims">
                    {CLAIMS.map((claim) => (
                      <li key={claim.code} className="wi-claim">
                        <span className={`wi-claim-chip ${claim.toneClass}`}>{claim.code}</span>
                        <div>
                          <h3 className="wi-claim-title">{claim.title}</h3>
                          <p className="wi-claim-text">{claim.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <Link href="/find-students" className="wi-cta">
                    <LayoutGrid size={20} strokeWidth={2.6} />
                    Open the Discovery Grid
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MouseGridBackground>
    </section>
  );
}
