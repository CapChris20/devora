"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import SplashCursor from "@/ui/cursor/SplashCursorClient";
import TopSection from "@/ui/hero/TopSection";
import GoodReasons from "@/ui/homepage-sections/GoodReasons";
import FeatureCards from "@/ui/homepage-sections/FeatureCards";
import JoinNowSection from "@/ui/homepage-sections/JoinNowSection";
import FourSteps from "@/ui/homepage-sections/FourSteps";
import ScrollingTextStrip from "@/ui/homepage-sections/ScrollingTextStrip";
import WhatIsDevora from "@/ui/homepage-sections/WhatIsDevora";
import WhyNot from "@/ui/homepage-sections/WhyNot";
import NavBar from "@/ui/navbar/NavBar";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.15,
      autoRaf: true,
    });

    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return (
    <main className="page-shell min-h-screen">
      <SplashCursor />
      <div className="noise pointer-events-none fixed inset-0 z-[1] opacity-[0.05]" />
      <NavBar activeItem="Home" />
      <TopSection />
      <ScrollingTextStrip />
      <WhatIsDevora />
      <FeatureCards />
      <FourSteps />
      <WhyNot />
      <GoodReasons />
      <JoinNowSection />
    </main>
  );
}
