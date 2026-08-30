"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import SplashCursor from "@/ui/cursor/SplashCursorClient";
import LandingHero from "@/ui/hero/LandingHero";
import LandingBenefits from "@/ui/landing/LandingBenefits";
import LandingFeatures from "@/ui/landing/LandingFeatures";
import LandingFooter from "@/ui/landing/LandingFooter";
import LandingHowItWorks from "@/ui/landing/LandingHowItWorks";
import LandingMarquee from "@/ui/landing/LandingMarquee";
import LandingWhatIs from "@/ui/landing/LandingWhatIs";
import LandingWhyDevora from "@/ui/landing/LandingWhyDevora";
import SiteNavBar from "@/ui/navbar/SiteNavBar";

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
      <SiteNavBar activeItem="Home" />
      <LandingHero />
      <LandingMarquee />
      <LandingWhatIs />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingWhyDevora />
      <LandingBenefits />
      <LandingFooter />
    </main>
  );
}
