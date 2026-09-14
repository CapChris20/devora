// Section 01 — “What is Devora?” on the homepage.
// Flow: mouse-grid bg → chapter label → asymmetric signal panel (Lottie frame + manifesto + claim rails).
// Manipulate here: edit CLAIMS for the three signal rows; swap the Lottie JSON import to change the animation.

"use client";

// vocab: framer-motion = animation library used for staggered claim-rail entrances
import { motion } from "framer-motion";
import whatIsDevoraAnimation from "@/ui/lottie-animations/what-is-devora.json";
import MouseGridBackground from "./MouseGridBackground";
import MovingAnimation from "./MovingAnimation";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

// Three “signal” claim rows under the manifesto — pixel index + accent + title/desc.
// accent maps to a CSS gradient class on the claim title.
// Manipulate here: rewrite titles/descs, reorder, or point accent at a different gradient
const CLAIMS = [
  {
    code: "01",
    title: "100% CECS Verified",
    desc: "UM-Dearborn only — no recruiters, no bots, no off-campus noise.",
    accent: "soft-pink" as const,
  },
  {
    code: "02",
    title: "Every Major & Track",
    desc: "CIS, CE, SE, DS, and the rest of the building — one searchable grid.",
    accent: "soft-peach" as const,
  },
  {
    code: "03",
    title: "Built to Ship Together",
    desc: "Hackathons, study crews, side projects — find who actually builds.",
    accent: "soft-violet" as const,
  },
];

export default function WhatIsDevora() {
  return (
    // Full-width section with the mouse-following grid glow behind everything.
    // landing-section-alt = alternating section tint from globals.css
    <MouseGridBackground id="what-is-devora" className="landing-section-alt what-is-section">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {/* Chapter label: “01 · The Platform” fades in first */}
        <FadeIn>
          <SectionNumber num="01" title="The Platform" />
        </FadeIn>

        {/* Main composition — glass “signal panel” holding media + manifesto.
            vocab: what-is-panel = custom chrome in globals.css (glow frame, not a flat text block) */}
        <FadeIn delay={0.08}>
          <div className="what-is-panel mt-12 sm:mt-14">
            {/* Soft corner stamps — decorative only */}
            <span className="what-is-corner what-is-corner-tl" aria-hidden="true" />
            <span className="what-is-corner what-is-corner-br" aria-hidden="true" />

            <div className="what-is-panel-inner">
              {/* Left: oversized title + Lottie in a tilted media frame */}
              <div className="what-is-media">
                <FadeIn delay={0.12}>
                  {/* Eyebrow + giant question — brand-first signal for this chapter */}
                  <p className="what-is-eyebrow font-pixel">
                    <span className="soft-pink">SIGNAL</span>
                    <span className="what-is-eyebrow-sep" aria-hidden="true">
                      /
                    </span>
                    <span className="theme-faint">CECS · UM-DEARBORN</span>
                  </p>
                  <h2 className="what-is-title font-display soft-headline">
                    What is
                    <br />
                    Devora?
                  </h2>
                </FadeIn>

                <FadeIn delay={0.18}>
                  {/* Media frame: glow ring + slight tilt so it doesn’t feel like a stock two-column layout */}
                  <div className="what-is-lottie-frame">
                    <div className="what-is-lottie-glow" aria-hidden="true" />
                    <MovingAnimation
                      animationData={whatIsDevoraAnimation}
                      ariaLabel="What is Devora animation"
                      className="landing-lottie-what-is what-is-lottie"
                    />
                  </div>
                </FadeIn>
              </div>

              {/* Right: manifesto copy + claim rails */}
              <div className="what-is-copy">
                <FadeIn delay={0.2}>
                  {/* Terminal-style prompt line — sets the tone before the pitch */}
                  <p className="what-is-prompt font-pixel">
                    {/* vocab: {" > "} = literal > in JSX so it isn’t parsed as a tag */}
                    <span className="soft-pink">{">"}</span>
                    <span className="theme-muted"> peers.find(</span>
                    <span className="soft-peach">verified && building</span>
                    <span className="theme-muted">)</span>
                  </p>
                </FadeIn>

                <FadeIn delay={0.24}>
                  <div className="what-is-manifesto">
                    <p className="what-is-lead">
                      Devora is the official hub for networking, CECS events, and collaborating opportunities exclusively for Computer Engineering
                      &amp; Computer Science students at the University of Michigan–Dearborn.
                    </p>
                    <p className="what-is-body">
                      It&apos;s where classmates become collaborators — find teammates by skill,
                      join project hubs, and turn hallway conversations into shipped work. No
                      recruiters. No noise. Just CECS people who actually build.
                    </p>
                  </div>
                </FadeIn>

                {/* Claim rails — replace boring pills with numbered neon rows */}
                <ul className="what-is-claims">
                  {CLAIMS.map((claim, i) => (
                    <motion.li
                      key={claim.code}
                      className="what-is-claim"
                      // vocab: whileInView = animate when this row scrolls into view
                      initial={{ opacity: 0, x: 28 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      // Manipulate here: delay step (0.08) controls cascade speed between rails
                      transition={{
                        duration: 0.7,
                        delay: 0.28 + i * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {/* Pixel index + accent title + short desc */}
                      <span className={`what-is-claim-code font-pixel ${claim.accent}`}>
                        {claim.code}
                      </span>
                      <div className="what-is-claim-text">
                        <p className={`what-is-claim-title font-display ${claim.accent}`}>
                          {claim.title}
                        </p>
                        <p className="what-is-claim-desc">{claim.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <FadeIn delay={0.5}>
                  {/* Closing transformation line under a glow rule */}
                  <div className="what-is-footer">
                    <div className="glow-line h-px w-full" aria-hidden="true" />
                    <p className="what-is-footer-line font-pixel">
                      <span className="theme-faint">classmates</span>
                      <span className="what-is-arrow soft-pink" aria-hidden="true">
                        {" → "}
                      </span>
                      <span className="soft-headline">collaborators</span>
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </MouseGridBackground>
  );
}
