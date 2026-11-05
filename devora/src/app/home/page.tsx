// Marketing homepage (/home). Renders all landing sections in order.
// Flow: mount Lenis smooth scroll → stack nav + hero + feature sections top to bottom.
// Hero (TopSection) is untouched per instruction.

"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import TopSection from "@/ui/home/hero/TopSection";
import WhatIsDevora from "@/ui/home/sections/WhatIsDevora";
import ScrollingTextStrip from "@/ui/home/sections/ScrollingTextStrip";
import FeatureCards from "@/ui/home/sections/FeatureCards";
import BestUseCases from "@/ui/home/sections/BestUseCases";
import WhyDevora from "@/ui/home/sections/WhyDevora";
import GoodReasons from "@/ui/home/sections/GoodReasons";
import JoinNowSection from "@/ui/home/sections/JoinNowSection";
import NavBar from "@/ui/shared/navbar/NavBar";

declare global {
  interface Window {
    smoothScroller?: Lenis;
  }
}

export default function LandingPage() {
  useEffect(() => {
    const smoothScroller = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.15,
      autoRaf: true,
    });

    window.smoothScroller = smoothScroller;

    return () => {
      smoothScroller.destroy();
      window.smoothScroller = undefined;
    };
  }, []);

  return (
    <main className="page-shell min-h-screen">
      <NavBar activeItem="Home" />
      {/* Hero section untouched per user instruction */}
      <TopSection />
      {/* Redesigned sections per DESIGN.md § 5.1 */}
      {/* 1. What is Devora (night) */}
      <WhatIsDevora />
      {/* 2. Marquee (gradient band) */}
      <ScrollingTextStrip />
      {/* 3. Key info (paper) */}
      <FeatureCards />
      {/* 4. Best use cases (night) */}
      <BestUseCases />
      {/* 5. Why Devora (pink) */}
      <WhyDevora />
      {/* 6. Benefits (orange) */}
      <GoodReasons />
      {/* 7. Join Now & Footer */}
      <JoinNowSection />
    </main>
  );
}
