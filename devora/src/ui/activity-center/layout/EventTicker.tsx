// Infinite ticker band scrolling upcoming campus events.
// Driven by GSAP linear continuous translation, respecting reduced motion settings.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useActivityCenter } from "../ActivityCenterContext";

// ===== MAIN COMPONENT =====

export default function EventTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { events } = useActivityCenter();

  useGSAP(
    () => {
      if (!trackRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(trackRef.current, {
          xPercent: -50,
          duration: 38,
          ease: "none",
          repeat: -1,
        });
      });
    },
    { dependencies: [events.length], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="bg-nb-ink text-nb-white border-y-nb border-nb-ink overflow-hidden whitespace-nowrap select-none"
    >
      <div
        ref={trackRef}
        className="inline-flex gap-0 py-2.5 will-change-transform"
      >
        {/* Render twice for continuous loop */}
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className="inline-flex gap-0">
            {events.length > 0 ? (
              events.map((event) => (
                <span
                  key={`${copyIndex}-${event.id}`}
                  className="inline-flex items-center gap-3.5 pr-7 font-nb-mono text-[13px] font-bold tracking-[0.12em] uppercase"
                >
                  <b className="px-2 py-0.5 rounded-full bg-nb-brand text-nb-ink font-bold">
                    {event.mon} {event.day}
                  </b>
                  <span>{event.title}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-6 pr-8 font-nb-mono text-[13px] font-bold tracking-[0.14em] uppercase text-nb-white">
                <span className="text-nb-brand font-bold">{"//"}</span>
                <span>Welcome to Devora Activity Center</span>
                <span className="text-nb-brand font-bold">{"//"}</span>
                <span>Post an event to see it live across campus</span>
                <span className="text-nb-brand font-bold">{"//"}</span>
                <span>Form study groups with CECS classmates</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
