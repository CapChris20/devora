// Motion layer: GSAP setup, scroll reveals, kinetic titles, Flip lists, and count-ups.
// Rules (Emil Kowalski + GSAP skills): transform/opacity only, strong ease-out,
// reveals fire once, everything has a reduced-motion path that keeps the content.

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

export const EASE_OUT = "expo.out";
export const EASE_IN_OUT = "power3.inOut";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll reveals for every [data-reveal] element inside the scope. Fires once per element.
export const useScrollReveals = (scope: RefObject<HTMLElement | null>) => {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(items, { autoAlpha: 0, y: 28 });
        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE_OUT, stagger: 0.07, overwrite: true }),
        });

        // Kinetic titles: words rise out of a mask, once, as the section arrives.
        gsap.utils.toArray<HTMLElement>("[data-kinetic]").forEach((title) => {
          const words = title.querySelectorAll<HTMLElement>(".nb-word-inner");
          gsap.set(words, { yPercent: 110 });
          ScrollTrigger.create({
            trigger: title,
            start: "top 92%",
            once: true,
            onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.06 }),
          });
        });

        // Scroll progress bar under the nav.
        gsap.fromTo(
          ".nb-progress-bar",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 } },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );
};

// One gradient across a whole title even though each word is its own animated box:
// every word gets the title's width as background-size and its own offset as position.
export const useTitleGradients = (scope: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const paint = () => {
      root.querySelectorAll<HTMLElement>(".nb-section-title, .nb-hero-title").forEach((title) => {
        const width = title.getBoundingClientRect().width;
        title.querySelectorAll<HTMLElement>(".nb-word:not(.nb-cycle) .nb-word-inner").forEach((word) => {
          const left = (word.parentElement?.offsetLeft ?? 0);
          word.style.backgroundSize = `${width}px 100%`;
          word.style.backgroundPosition = `${-left}px 0`;
        });
      });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(root);
    document.fonts?.ready.then(paint).catch(() => undefined);
    return () => ro.disconnect();
  }, [scope]);
};

// Splits a title into masked words for the kinetic reveal. Screen readers get the plain string.
export const KineticText = ({ text }: { text: string }) => (
  <>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="nb-word">
            <span className="nb-word-inner">{word}</span>
          </span>{" "}
        </span>
      ))}
    </span>
  </>
);

// Animate list items between layouts (filter, sort, add) with Flip.
// Reads the old layout during render, before React commits the new one.
export const useFlipList = (listRef: RefObject<HTMLElement | null>, key: string) => {
  const lastKey = useRef(key);
  const pending = useRef<Flip.FlipState | null>(null);

  if (lastKey.current !== key && listRef.current && !prefersReducedMotion()) {
    pending.current = Flip.getState(listRef.current.querySelectorAll("[data-flip-id]"));
  }
  lastKey.current = key;

  useLayoutEffect(() => {
    const state = pending.current;
    pending.current = null;
    if (!state || !listRef.current) return;
    Flip.from(state, {
      targets: listRef.current.querySelectorAll("[data-flip-id]"),
      duration: 0.55,
      ease: EASE_IN_OUT,
      absolute: true,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: EASE_OUT }),
    });
  }, [key, listRef]);
};

// Number that tweens to its new value when it changes (state indication, not decoration).
export const CountUp = ({ value, className }: { value: number; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.textContent = String(value);
        shown.current = value;
        return;
      }
      const counter = { n: shown.current };
      gsap.to(counter, {
        n: value,
        duration: 0.5,
        ease: EASE_OUT,
        onUpdate: () => {
          el.textContent = String(Math.round(counter.n));
        },
        onComplete: () => {
          shown.current = value;
        },
      });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
};

export const Reveal = ({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "section" }) => (
  <Tag className={className} data-reveal="">
    {children}
  </Tag>
);

export { gsap, Flip, ScrollTrigger, useGSAP };
