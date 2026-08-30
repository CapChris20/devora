"use client";

import { motion } from "framer-motion";
import { landingHeroCopy } from "./landing-hero.copy";

type HeroScrollHintProps = {
  targetId?: string;
};

function ScrollArrow() {
  return (
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      className="hero-scroll-hint-arrow"
      aria-hidden="true"
    />
  );
}

export default function HeroScrollHint({ targetId = "more" }: HeroScrollHintProps) {
  const scrollToMore = () => {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -96, duration: 1.4 });
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="hero-scroll-hint">
      <button
        type="button"
        onClick={scrollToMore}
        className="hero-scroll-hint-btn pointer-events-auto"
        aria-label={landingHeroCopy.scrollHint}
      >
        <ScrollArrow />
        <span className="hero-scroll-hint-label">{landingHeroCopy.scrollHint}</span>
        <ScrollArrow />
      </button>
    </div>
  );
}
