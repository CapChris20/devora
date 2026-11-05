// Marquee band per DESIGN.md § 5.1B.
// Wrapper has overflow: hidden, padding-block: 28px, margin-block: -56px, z-index: 5.
// Band has --grad fill, 3px ink border top & bottom, padding-block: 18px, width: 108%,
// margin-left: -4%, rotate(-2deg). Seamless loop with 4-point ink stars and alternating outlined text.

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_ITEMS = [
  "Connect",
  "Be more confident",
  "Collaborate",
  "Create",
  "Meet new peers",
  "Develop further bonds",
  "Sponsored by CECS",
  "UM\u2011Dearborn",
  "Build the network",
];

export default function ScrollingTextStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Base loop
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 28,
      ease: "none",
      repeat: -1,
    });

    // ScrollTrigger velocity interaction per § 7.4
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      onUpdate: (self) => {
        const vel = self.getVelocity();
        const dir = self.direction || 1;
        const targetScale = dir * (1 + Math.min(Math.abs(vel) / 250, 6));

        gsap.to(tween, {
          timeScale: targetScale,
          duration: 0.25,
          ease: "power1.out",
          onComplete: () => {
            gsap.to(tween, {
              timeScale: dir,
              duration: 1.2,
              ease: "power3.out",
            });
          },
        });

        const skewVal = Math.max(-8, Math.min(8, -vel / 220));
        gsap.to(track, {
          skewX: skewVal,
          duration: 0.25,
          ease: "power1.out",
          onComplete: () => {
            gsap.to(track, {
              skewX: 0,
              duration: 0.9,
              ease: "power3.out",
            });
          },
        });
      },
    });

    return () => {
      tween.kill();
      st.kill();
    };
  }, []);

  const renderItemSequence = (keyPrefix: string) => (
    <div className="flex items-center flex-shrink-0" key={keyPrefix}>
      {MARQUEE_ITEMS.map((item, idx) => {
        const isOdd = idx % 2 === 1;
        return (
          <div key={`${keyPrefix}-${idx}`} className="flex items-center flex-shrink-0">
            <span
              className="marquee-text"
              style={{
                color: isOdd ? "transparent" : "var(--ink)",
                WebkitTextStroke: isOdd ? "1.6px var(--ink)" : "none",
              }}
            >
              {item}
            </span>
            {/* 26px four-point star in ink */}
            <svg
              className="marquee-star flex-shrink-0"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="var(--ink)"
              aria-hidden="true"
            >
              <path d="M12 2C12.4 7.2 16.8 11.6 22 12C16.8 12.4 12.4 16.8 12 22C11.6 16.8 7.2 12.4 2 12C7.2 11.6 11.6 7.2 12 2Z" />
            </svg>
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className="marquee-wrapper" aria-hidden="true">
      <div className="marquee-band">
        <div ref={trackRef} className="marquee-track">
          {renderItemSequence("seq-1")}
          {renderItemSequence("seq-2")}
        </div>
      </div>

      <style jsx>{`
        .marquee-wrapper {
          overflow: hidden;
          padding-block: 28px;
          margin-block: -56px;
          position: relative;
          z-index: 5;
        }

        .marquee-band {
          background: var(--grad);
          border-top: 3px solid var(--ink);
          border-bottom: 3px solid var(--ink);
          padding-block: 18px;
          width: 108%;
          margin-left: -4%;
          transform: rotate(-2deg);
        }

        .marquee-track {
          display: flex;
          width: max-content;
          align-items: center;
          will-change: transform;
        }

        .marquee-text {
          font-family: var(--f-display);
          font-weight: 800;
          text-transform: uppercase;
          font-size: clamp(22px, 2.6vw, 36px);
          line-height: 1;
          letter-spacing: -0.02em;
          padding-inline: 28px;
          white-space: nowrap;
        }

        .marquee-star {
          margin-inline: 4px;
        }
      `}</style>
    </div>
  );
}
