// Infinite ticker band scrolling upcoming campus events.
// Driven by GSAP linear continuous translation, respecting reduced motion settings.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { INITIAL_EVENTS } from "../placeholder-data";

// ===== MAIN COMPONENT =====

export default function EventTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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
    { scope: containerRef }
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
            {INITIAL_EVENTS.map((event) => (
              <span
                key={`${copyIndex}-${event.id}`}
                className="inline-flex items-center gap-3.5 pr-7 font-nb-mono text-[13px] font-bold tracking-[0.12em] uppercase"
              >
                <b className="px-2 py-0.5 rounded-full bg-nb-brand text-nb-ink font-bold">
                  {event.mon} {event.day}
                </b>
                <span>{event.title}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
