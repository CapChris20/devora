// Homepage hero — Voronoi shader background, brand title, info card, scroll hint.
// Layout: full-viewport section → glass DEVORA title + credits → horizontal info card.
// Flow: shader paints behind → title stack + credits + scroll hint on the left →
// CECS card (headline / pitch / CTAs / logo) on the right. Copy lives in top-section-text.ts.

"use client";

// vocab: framer-motion = animation library; motion.span = span that can fade/slide in
import { motion } from "framer-motion";
import DevoraLogo from "@/ui/logo/DevoraLogo";
import HeroCardActions from "./HeroCardActions";
import Credits from "./Credits";
import DevoraTitleStack from "./DevoraTitleStack";
import HeroScrollHint from "./HeroScrollHint";
import { topSectionText } from "./top-section-text";
import VoronoiShaderBackgroundClient from "@/ui/backgrounds/VoronoiShaderBackgroundClient";

// Three headline words from the shared copy file ("Connect." etc.).
// Manipulate here: edit top-section-text.ts → headline.lines to change these words
const HEADLINE = topSectionText.headline.lines;

export default function TopSection() {
  return (
    // Full first viewport — min height follows the device screen.
    // vocab: 100dvh = 100% of the dynamic viewport height (shrinks when mobile browser chrome shows)
    // overflow-x-hidden = stop any horizontal bleed from the shader / absolute layers
    <section className="relative min-h-[100dvh] overflow-x-hidden">
      {/* Animated Voronoi cells behind everything (decorative only).
          absolute inset-0 = fill the whole section box; z-0 stays under the hero layout.
          vocab: aria-hidden = hide from screen readers (purely visual layer) */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <VoronoiShaderBackgroundClient className="z-0" />
      </div>

      {/* Foreground hero layout: title column + info card.
          hero-layout / hero-* classes live in globals.css (responsive grid/flex). */}
      <div className="hero-layout">
        {/* Left/top: glass DEVORA wordmark, then credits + scroll hint stacked under it */}
        <div className="hero-title-wrap">
          {/* hero-devora-glass = frosted panel chrome around the wordmark (CSS) */}
          <div className="hero-devora-glass">
            {/* variant="logo" = soft gradient fill (not the floating pixel variant) */}
            <DevoraTitleStack variant="logo" className="hero-devora-title" />
          </div>
          <div className="hero-credits-column">
            <Credits />
            {/* targetId="more" matches ScrollingTextStrip’s id — click scrolls to the marquee */}
            <HeroScrollHint targetId="more" />
          </div>
        </div>

        {/* Right/bottom: CECS info card with eyebrow, headline, description, CTAs, logo */}
        <div className="hero-layout-content">
          <article className="hero-info-card hero-info-card-horizontal w-full max-w-[48rem]">
            <div className="hero-info-card-content">
              {/* Small campus eyebrow above the big headline */}
              <p className="theme-muted text-[10px] uppercase tracking-[0.45em] sm:text-[11px]">
                CECS · University of Michigan–Dearborn
              </p>

              {/* Animate each headline word in one after another (staggered motion.span) */}
              <h2 className="hero-info-card-headline font-display">
                {/* vocab: .map = make one element per word in the HEADLINE array */}
                {HEADLINE.map((word, i) => (
                  <motion.span
                    key={word}
                    // vocab: initial = starting pose before animation; animate = ending pose
                    // Start slightly below + invisible, then settle into place
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    // Stagger: word 0 at 0.35s, word 1 at 0.47s, word 2 at 0.59s…
                    // vocab: ease cubic-bezier = custom acceleration curve for the motion
                    // Manipulate here: change delay base (0.35) or step (0.12) to retune the cascade
                    transition={{
                      delay: 0.35 + i * 0.12,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    // headline-grad = brand gradient text; block = one word per line
                    className="headline-grad block"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>

              {/* Pitch line — edit topSectionText.subheading to change copy */}
              <p className="hero-description max-w-md">{topSectionText.subheading}</p>

              {/* View Grid + Sign Up — labels/hrefs from top-section-text.ts */}
              <HeroCardActions variant="card" />
            </div>

            {/* Logo sits in a ring on the card's side (CSS positions the wrap) */}
            <div className="hero-logo-wrap-card">
              <div className="hero-logo-ring">
                {/* size="card" picks the mid logo preset in DevoraLogo */}
                <DevoraLogo size="card" className="hero-logo-glow" />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
