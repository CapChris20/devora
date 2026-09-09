// Section 01 — “What is Devora?” on the homepage.
// Mouse-grid background → chapter label → headline + Lottie left, copy + stat badges right.
// Manipulate here: edit STATS for the claim chips; swap the Lottie JSON import to change the animation.

import whatIsDevoraAnimation from "@/ui/lottie-animations/what-is-devora.json";
import MouseGridBackground from "./MouseGridBackground";
import MovingAnimation from "./MovingAnimation";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

// Short claim chips shown under the description.
// Manipulate here: add/remove/rewrite strings — they map 1:1 into badges
const STATS = ["100% CECS Verified", "Every Major & Track", "Zero Recruiter Noise"];

export default function WhatIsDevora() {
  return (
    // Full-width section with the mouse-following grid glow behind everything.
    // landing-section-alt = alternating section tint from globals.css
    <MouseGridBackground className="landing-section-alt">
      <div className="mx-auto max-w-6xl px-6">
        {/* Chapter label: “01 · The Platform” fades in first */}
        <FadeIn>
          <SectionNumber num="01" title="The Platform" />
        </FadeIn>

        {/* Two-column layout on large screens: media left, text right.
            vocab: lg:grid-cols-2 = 2 columns from the large breakpoint up */}
        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left column — headline and looping Lottie */}
          <div className="flex flex-col gap-6">
            <FadeIn delay={0.1}>
              <h2 className="font-display headline-grad text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                What is Devora?
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <MovingAnimation
                animationData={whatIsDevoraAnimation}
                ariaLabel="What is Devora animation"
                className="landing-lottie-what-is mx-auto w-full max-w-[560px] lg:mx-0"
              />
            </FadeIn>
          </div>

          {/* Right column — body copy and the three stat badges */}
          <FadeIn delay={0.2} className="space-y-6">
            <p className="theme-body text-base leading-relaxed md:text-lg">
              {/* vocab: &amp; / &apos; = HTML entities for & and ' inside JSX text
                  (raw & or ' can confuse the JSX parser in some spots) */}
              Devora is the private network built exclusively for Computer Engineering &amp;
              Computer Science students at the University of Michigan–Dearborn. It&apos;s where
              classmates become collaborators — find teammates by skill, join project hubs, and
              turn hallway conversations into shipped work.
            </p>
            <p className="theme-muted text-base leading-relaxed">
              No recruiters. No noise. Just the people building the future of CECS, one
              connection at a time.
            </p>
            {/* One badge per string in STATS */}
            <div className="flex flex-wrap gap-3 pt-2">
              {/* vocab: key={s} = React identity for each badge (needed in lists) */}
              {STATS.map((s) => (
                <span key={s} className="landing-stat-badge">
                  {s}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </MouseGridBackground>
  );
}
