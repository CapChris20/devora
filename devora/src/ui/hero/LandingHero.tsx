"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import DevoraLogo from "@/ui/logo/DevoraLogo";
import HeroCardActions from "./HeroCardActions";
import HeroScrollHint from "./HeroScrollHint";
import { landingHeroCopy } from "./landing-hero.copy";

const HEADLINE = landingHeroCopy.headline.lines;

const STARS = Array.from({ length: 60 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 23.3) % 52,
  size: 1 + ((i * 7) % 3),
  delay: (i % 10) * 0.35,
}));

const FRONT_RIDGE =
  "0,260 80,260 80,230 140,230 140,200 200,200 200,240 260,240 260,270 340,270 340,230 420,230 420,190 480,190 480,160 540,160 540,200 620,200 620,240 700,240 700,210 780,210 780,170 860,170 860,210 940,210 940,250 1020,250 1020,220 1100,220 1100,250 1180,250 1180,280 1260,280 1260,250 1340,250 1340,270 1440,270";

export default function LandingHero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });

  const sunX = useTransform(sx, [-0.5, 0.5], [-26, 26]);
  const sunY = useTransform(sy, [-0.5, 0.5], [-12, 16]);
  const backX = useTransform(sx, [-0.5, 0.5], [16, -16]);
  const frontX = useTransform(sx, [-0.5, 0.5], [38, -38]);
  const frontY = useTransform(sy, [-0.5, 0.5], [0, 12]);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section onMouseMove={onMove} className="relative min-h-screen overflow-hidden">
      <div className="hero-sky absolute inset-0" />

      <div className="absolute inset-0" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-[12%] z-[2] flex justify-center"
        aria-hidden="true"
      >
        <motion.div style={{ x: sunX, y: sunY }} className="sun">
          <div className="sun-top" />
          <div className="sun-bottom" />
        </motion.div>
      </div>

      <motion.div
        style={{ x: backX }}
        className="absolute inset-x-0 bottom-0 z-[5]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="h-[36vh] w-full">
          <path
            fill="#3d1160"
            opacity="0.85"
            d="M0,320 L0,220 L60,220 L60,190 L120,190 L120,150 L160,150 L160,120 L220,120 L220,150 L280,150 L280,180 L340,180 L340,140 L400,140 L400,100 L460,100 L460,70 L520,70 L520,110 L580,110 L580,150 L640,150 L640,190 L720,190 L720,160 L780,160 L780,120 L840,120 L840,90 L900,90 L900,130 L960,130 L960,170 L1020,170 L1020,140 L1080,140 L1080,180 L1140,180 L1140,210 L1200,210 L1200,170 L1260,170 L1260,140 L1320,140 L1320,180 L1380,180 L1380,220 L1440,220 L1440,320 Z"
          />
        </svg>
      </motion.div>

      <motion.div
        style={{ x: frontX, y: frontY }}
        className="absolute inset-x-0 bottom-0 z-[8]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="h-[30vh] w-full">
          <path
            fill="#12071f"
            d="M0,320 L0,260 L80,260 L80,230 L140,230 L140,200 L200,200 L200,240 L260,240 L260,270 L340,270 L340,230 L420,230 L420,190 L480,190 L480,160 L540,160 L540,200 L620,200 L620,240 L700,240 L700,210 L780,210 L780,170 L860,170 L860,210 L940,210 L940,250 L1020,250 L1020,220 L1100,220 L1100,250 L1180,250 L1180,280 L1260,280 L1260,250 L1340,250 L1340,270 L1440,270 L1440,320 Z"
          />
          <polyline
            points={FRONT_RIDGE}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="7"
            opacity="0.25"
            strokeLinejoin="miter"
          />
          <polyline
            points={FRONT_RIDGE}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.5"
            opacity="0.9"
            strokeLinejoin="miter"
          />
        </svg>
      </motion.div>

      <div className="grid-floor z-[10]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] z-[12] h-[560px] w-[1000px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0b0518]/55 blur-[110px]"
        aria-hidden="true"
      />
      <div className="scanlines pointer-events-none absolute inset-0 z-[30] opacity-40" aria-hidden="true" />
      <div className="vignette pointer-events-none absolute inset-0 z-[15]" aria-hidden="true" />

      <div className="relative z-40 flex min-h-screen flex-col px-5 pb-24 pt-24 sm:px-8 sm:pb-28 sm:pt-28 md:px-10 md:pt-32 lg:px-12">
        <div className="flex w-full shrink-0 justify-center">
          <h1 className="hero-devora-title logo-gradient font-pixel">DEVORA</h1>
        </div>

        <div className="mt-4 flex w-full flex-1 items-center justify-center sm:mt-6">
          <article className="hero-info-card hero-info-card-horizontal mx-auto w-full max-w-[52rem]">
            <div className="hero-info-card-content">
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/60 sm:text-[11px]">
                CECS · University of Michigan–Dearborn
              </p>

              <h2 className="hero-info-card-headline font-display">
                {HEADLINE.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.35 + i * 0.12,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="headline-grad block"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>

              <p className="hero-description max-w-md">{landingHeroCopy.subheading}</p>

              <HeroCardActions variant="card" />
            </div>

            <div className="hero-logo-wrap-card">
              <div className="hero-logo-ring">
                <DevoraLogo size="card" className="hero-logo-glow" />
              </div>
            </div>
          </article>
        </div>
      </div>

      <HeroScrollHint targetId="more" />
    </section>
  );
}
