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
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#08040f]">
      <SplashCursor />
      <div className="noise pointer-events-none fixed inset-0 z-[60] opacity-[0.05]" />
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
