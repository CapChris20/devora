// Marketing homepage (/home). Renders all landing sections in order.
// Flow: mount Lenis smooth scroll → stack nav + hero + feature sections top to bottom.
// Also starts smooth scrolling on this page only (see useEffect below).

"use client";

// vocab/symbol: Lenis — npm package that animates scroll on the homepage
import Lenis from "lenis";
import { useEffect } from "react";

import TopSection from "@/ui/hero/TopSection";
import GoodReasons from "@/ui/homepage-sections/GoodReasons";
import FeatureCards from "@/ui/homepage-sections/FeatureCards";
import JoinNowSection from "@/ui/homepage-sections/JoinNowSection";
import FourSteps from "@/ui/homepage-sections/FourSteps";
import ScrollingTextStrip from "@/ui/homepage-sections/ScrollingTextStrip";
import WhatIsDevora from "@/ui/homepage-sections/WhatIsDevora";
import WhyNot from "@/ui/homepage-sections/WhyNot";
import NavBar from "@/ui/navbar/NavBar";

// TypeScript-only — tells the editor window.smoothScroller may exist.
// Not code that runs in the browser.
// vocab: declare global = extend the built-in Window type for this project
declare global {
  interface Window {
    // vocab: smoothScroller = Lenis instance NavBar reads for scroll position
    smoothScroller?: Lenis;
  }
}

// Landing page: nav + hero + feature sections stacked top to bottom.
export default function LandingPage() {
  // This effect is the heartbeat of homepage smooth scrolling.
  // Start Lenis when /home mounts; destroy when the user navigates away.
  // Stored on window so NavBar knows how far the user has scrolled.
  // vocab: useEffect = React hook that runs after paint (and cleanup on leave)
  // vocab/symbol: [] = run this effect once on mount, not on every re-render
  useEffect(() => {
    // Manipulate here: duration = how long a scroll animation lasts (higher = floatier)
    // Manipulate here: touchMultiplier = phone swipe strength; raise = faster touch scroll
    // vocab: autoRaf true = Lenis hooks into requestAnimationFrame itself
    const smoothScroller = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.15,
      autoRaf: true,
    });

    // Why window.? NavBar (and anything else) can read scroll without prop-drilling Lenis.
    window.smoothScroller = smoothScroller;

    // Cleanup when leaving /home so other pages don't keep Lenis running.
    // vocab: return () => ... = React cleanup function for this effect
    return () => {
      smoothScroller.destroy();
      window.smoothScroller = undefined;
    };
  }, []);

  return (
    <main className="page-shell min-h-screen">
      {/*
        Section order = the story of the landing page top → bottom.
        Manipulate here: reorder / remove these components to change the homepage narrative
        vocab: activeItem="Home" = tells NavBar which link looks selected
      */}
      <NavBar activeItem="Home" />
      {/* Hero composition: Devora brand, tagline, primary CTAs */}
      <TopSection />
      {/* Moving text marquee between hero and “what is Devora” */}
      <ScrollingTextStrip />
      {/* Product pitch: what Devora is */}
      <WhatIsDevora />
      {/* Feature highlights grid/cards */}
      <FeatureCards />
      {/* How it works in four steps */}
      <FourSteps />
      {/* Counter-argument / “why not” section */}
      <WhyNot />
      {/* Social-proof style reasons to join */}
      <GoodReasons />
      {/* Final CTA strip → signup */}
      <JoinNowSection />
    </main>
  );
}
