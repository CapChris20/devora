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
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.8 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="hero-scroll-hint pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-6 sm:bottom-8">
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
