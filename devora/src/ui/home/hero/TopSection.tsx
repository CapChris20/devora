// Homepage hero — pyramid shader background with a poster layout on top.
// Layout: left = eyebrow pill, giant Connect/Collaborate/Create headline, pitch plate, pill buttons;
// right = tilted DEVORA slab with sticker + spinning sponsor seal; bottom = credits, scroll hint, marquee.
// Flow: shader paints behind → content renders → GSAP plays the intro, then keeps the seal/marquee moving.
// Copy lives in top-section-text.ts. Styles live in hero-poster.css (all classes start with hp-).

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import PyramidShaderBackgroundClient from "@/ui/shared/backgrounds/PyramidShaderBackgroundClient";
import { NB_FONT_CLASS_NAME } from "@/ui/shared/design-law/nb-fonts";
import HeroCardActions from "./HeroCardActions";
import Credits from "./Credits";
import HeroHeadline from "./HeroHeadline";
import HeroMarquee from "./HeroMarquee";
import HeroScrollHint from "./HeroScrollHint";
import HeroWordmarkSlab from "./HeroWordmarkSlab";
import { topSectionText } from "./top-section-text";
import "./hero-poster.css";

// ===== NAMED CONSTANTS =====

// vocab: matchMedia query = GSAP only runs the block when this CSS media query is true
const MOTION_ALLOWED_QUERY = "(prefers-reduced-motion: no-preference)";
// Mouse tilt only on devices with a real mouse (phones/tablets skip it)
const MOUSE_TILT_QUERY = "(prefers-reduced-motion: no-preference) and (pointer: fine)";

// Manipulate here: bigger = the slab leans further toward the mouse (degrees)
const SLAB_TILT_SIDEWAYS_DEGREES = 14;
const SLAB_TILT_UP_DOWN_DEGREES = 10;
// Manipulate here: how far (px) the orchid backer drifts the opposite way
const BACKER_DRIFT_PX = 24;

// Manipulate here: seconds for one full spin of the seal / one full loop of the marquee
const SEAL_SPIN_SECONDS = 18;
const MARQUEE_LOOP_SECONDS = 32;

// ===== HELPER FUNCTIONS =====

// Intro timeline: words first, then the slab deals in from below, seal stamps down, footer rises.
// vocab: timeline = a list of tweens played in order; "-=0.3" = start 0.3s before the previous ends
function playIntro() {
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  // 1. Left column: eyebrow, rising letters, bubbles, swap chip, band wipe, pitch + buttons
  intro
    .from(".hp-eyebrow", { y: 16, autoAlpha: 0, duration: 0.45 })
    .from(".hp-ch", { yPercent: 110, rotate: 8, autoAlpha: 0, duration: 0.6, stagger: 0.025 }, "-=0.2")
    .from(".hp-face", { scale: 0, rotate: -90, duration: 0.6, stagger: 0.08, ease: "back.out(2.6)" }, "-=0.55")
    .from(".hp-swap", { scale: 0, rotate: -180, duration: 0.6, ease: "back.out(2.2)" }, "-=0.5")
    .from(".hp-band", { scaleX: 0, duration: 0.7, ease: "expo.out" }, "-=0.45")
    .from(".hp-pitch-row > *", { y: 20, autoAlpha: 0, duration: 0.5, stagger: 0.1 }, "-=0.4");

  // 2. Right column: placed at fixed times (seconds) so it overlaps the words
  intro
    .from(".hp-backer", { x: 80, rotate: 20, autoAlpha: 0, duration: 0.8, ease: "back.out(1.4)" }, 0.5)
    .from(".hp-slab", { y: 120, rotate: -14, autoAlpha: 0, duration: 0.9, ease: "back.out(1.3)" }, 0.6)
    .from(".hp-slab-logo", { scale: 0.5, rotate: -20, autoAlpha: 0, duration: 0.7, ease: "back.out(2)" }, 1.1)
    .from(".hp-wordmark", { yPercent: 60, autoAlpha: 0, duration: 0.6 }, 1.2)
    .from(".hp-sticker", { scale: 0, rotate: -40, duration: 0.6, ease: "back.out(2.4)" }, 1.4)
    .from(".hp-seal", { scale: 1.8, rotate: -60, autoAlpha: 0, duration: 0.55, ease: "power4.in" }, 1.5);

  // 3. Footer pieces and the marquee strip
  intro
    .from(".hp-foot > *", { y: 20, autoAlpha: 0, duration: 0.45, stagger: 0.1 }, 1.6)
    .from(".hp-marquee", { yPercent: 120, autoAlpha: 0, duration: 0.6 }, 1.7);
}

// Things that keep moving after the intro: seal ring spins, marquee slides, logo bobs, scroll ball bobs.
// vocab: repeat: -1 = loop forever; yoyo = play forward then backward
function startIdleLoops() {
  gsap.to(".hp-seal-ring", { rotate: 360, duration: SEAL_SPIN_SECONDS, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
  gsap.to(".hp-marquee-track", { xPercent: -50, duration: MARQUEE_LOOP_SECONDS, ease: "none", repeat: -1 });
  gsap.to(".hp-slab-logo", { y: -8, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".hp-scroll-ball", { y: 4, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
}

// Slab leans toward the mouse; the backer drifts the other way. Returns a cleanup function.
// vocab: quickTo = a reusable tween you can feed new end values to many times per second
function startMouseTilt(stageElement: HTMLElement) {
  const tiltSideways = gsap.quickTo(".hp-slab", "rotationY", { duration: 0.6, ease: "power3.out" });
  const tiltUpDown = gsap.quickTo(".hp-slab", "rotationX", { duration: 0.6, ease: "power3.out" });
  const driftBacker = gsap.quickTo(".hp-backer", "x", { duration: 0.8, ease: "power3.out" });

  const handlePointerMove = (event: PointerEvent) => {
    // How far the mouse is from the slab's center, as a share of the window (-0.5 … 0.5 roughly)
    const stageBox = stageElement.getBoundingClientRect();
    const distanceSideways = (event.clientX - (stageBox.left + stageBox.width / 2)) / window.innerWidth;
    const distanceUpDown = (event.clientY - (stageBox.top + stageBox.height / 2)) / window.innerHeight;
    tiltSideways(distanceSideways * SLAB_TILT_SIDEWAYS_DEGREES);
    tiltUpDown(distanceUpDown * -SLAB_TILT_UP_DOWN_DEGREES);
    driftBacker(distanceSideways * -BACKER_DRIFT_PX);
  };

  window.addEventListener("pointermove", handlePointerMove);
  return () => window.removeEventListener("pointermove", handlePointerMove);
}

// ===== MAIN COMPONENT =====

export default function TopSection() {
  const heroRef = useRef<HTMLElement>(null);

  // GSAP setup. scope = only look for .hp-* classes inside this hero.
  // useGSAP cleans every tween up when the component unmounts.
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      // 1. Intro + idle loops — skipped entirely when the OS asks for reduced motion
      media.add(MOTION_ALLOWED_QUERY, () => {
        playIntro();
        startIdleLoops();
      });

      // 2. Mouse tilt — desktop mice only
      media.add(MOUSE_TILT_QUERY, () => {
        const stageElement = heroRef.current?.querySelector<HTMLElement>(".hp-stage");
        if (!stageElement) return;
        return startMouseTilt(stageElement);
      });

      return () => media.revert();
    },
    { scope: heroRef }
  );

  return (
    // NB_FONT_CLASS_NAME = loads Archivo Black / Space Grotesk / Space Mono as CSS variables
    <section ref={heroRef} className={`hp-hero ${NB_FONT_CLASS_NAME}`}>
      {/* 1. Animated pyramid scales behind everything (decorative only) */}
      <div className="hp-shader" aria-hidden="true">
        <PyramidShaderBackgroundClient className="z-0" />
      </div>

      <div className="hp-content">
        <div className="hp-grid">
          {/* 2. Left column: eyebrow, headline, pitch, buttons */}
          <div>
            <p className="hp-eyebrow">
              <span className="hp-eyebrow-dot" aria-hidden="true" />
              {topSectionText.eyebrow}
            </p>
            <HeroHeadline />
            <div className="hp-pitch-row">
              <p className="hp-pitch">{topSectionText.subheading}</p>
              <HeroCardActions variant="card" />
            </div>
          </div>

          {/* 3. Right column: DEVORA slab, sticker, sponsor seal */}
          <HeroWordmarkSlab />
        </div>

        {/* 4. Credits plate + scroll hint (scrolls to the What is Devora card) */}
        <div className="hp-foot">
          <Credits />
          <HeroScrollHint targetId="what-is-devora" />
        </div>

        {/* 5. Tilted ink marquee */}
        <HeroMarquee />
      </div>
    </section>
  );
}
