// Hero: kinetic headline + your week as a clay isometric board.
// Load sequence (the page's one orchestrated moment): words rise, the last word cycles
// through a few places you have gaps, then settles on "classes"; cubes build in a wave.

import { useRef } from "react";
import { CalendarClock, Users } from "lucide-react";

import { DAYS, TIME_BLOCKS, slotId, type SlotId } from "../config";
import type { Availability } from "../useAvailability";
import { IsoWeek, type CubeKind } from "../IsoWeek";
import { CountUp, EASE_OUT, gsap, prefersReducedMotion, useGSAP } from "../motion";

const CYCLE = ["labs", "shifts", "classes."];

type HeroProps = {
  availability: Availability;
  onSetHours: () => void;
  onJump: (target: string) => void;
};

export const Hero = ({ availability, onSetHours, onJump }: HeroProps) => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
      tl.from(".nb-hero-word-inner", { yPercent: 115, duration: 0.9, stagger: 0.07 })
        .from(".nb-hero-sub, .nb-hero-actions, .nb-hero-kicker", { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08 }, "-=0.55")
        .from(".nb-hero-board", { autoAlpha: 0, y: 24, duration: 0.8 }, "<");

      // The last word swaps through a few gaps, then lands on "classes." and stays.
      const slot = root.current?.querySelector<HTMLElement>(".nb-cycle-inner");
      if (slot) {
        CYCLE.forEach((word, i) => {
          tl.to(slot, { yPercent: -110, duration: 0.35, ease: "power2.inOut" }, i === 0 ? "+=0.5" : "+=0.65")
            .call(() => {
              slot.textContent = word;
            })
            .fromTo(slot, { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: EASE_OUT });
        });
      }

      // As the hero scrolls away, the board tips back and sinks a little (depth, scrubbed).
      gsap.to(".nb-hero-board .iso-stage", {
        yPercent: 12,
        rotate: -4,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.4 },
      });
    },
    { scope: root },
  );

  const cubes: Partial<Record<SlotId, CubeKind>> = {};
  DAYS.forEach((d) =>
    TIME_BLOCKS.forEach((b) => {
      const s = slotId(d.id, b.id);
      if (availability.isFree(s)) cubes[s] = "free";
    }),
  );

  return (
    <section ref={root} className="nb-hero" aria-labelledby="hero-title">
      <div className="nb-hero-copy">
        <p className="nb-kicker nb-hero-kicker font-pixel">
          <span aria-hidden="true" className="nb-kicker-rule">
            +--
          </span>{" "}
          THE CECS HUB
        </p>
        <h2 id="hero-title" className="nb-hero-title font-display">
          <span className="sr-only">Find your people between classes.</span>
          <span aria-hidden="true">
            {["Find", "your", "people", "between"].map((w) => (
              <span key={w}>
                <span className="nb-word">
                  <span className="nb-word-inner nb-hero-word-inner">{w}</span>
                </span>{" "}
              </span>
            ))}
            <span className="nb-word nb-cycle">
              <span className="nb-word-inner nb-hero-word-inner">
                <span className="nb-cycle-inner">classes.</span>
              </span>
            </span>
          </span>
        </h2>
        <p className="nb-hero-sub">
          Set the hours you are usually free. Devora shows the study groups, classmates, and CECS events that fit them.
        </p>
        <div className="nb-hero-actions">
          <button type="button" className="nb-btn nb-btn-primary nb-btn-lg" onClick={onSetHours}>
            <CalendarClock className="nb-btn-icon" aria-hidden="true" />
            Set my hours
          </button>
          <button type="button" className="nb-btn nb-btn-lg" onClick={() => onJump("study")}>
            <Users className="nb-btn-icon" aria-hidden="true" />
            Browse study groups
          </button>
        </div>
      </div>

      <div className="nb-hero-board">
        <IsoWeek cubes={cubes} label={`Your week: ${availability.freeCount} free blocks`} buildIn />
        <div className="nb-board-caption">
          <span className="nb-board-count font-display">
            <CountUp value={availability.freeCount} />
          </span>
          <span>
            free blocks in your week
            <br />
            <span className="nb-faint">Raised blocks are your free time</span>
          </span>
        </div>
      </div>
    </section>
  );
};
