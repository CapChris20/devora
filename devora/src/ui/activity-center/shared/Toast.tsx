// Toast notification banner.
// Neo-brutalist alert that springs up from the screen bottom when actions occur.
// Uses GSAP back.out ease to mirror the reference prototype animation.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ===== TYPES =====

type ToastProps = {
  message: string | null;
};

// ===== MAIN COMPONENT =====

export default function Toast({ message }: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!message || !toastRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          toastRef.current,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }
        );
      });
    },
    { dependencies: [message], scope: toastRef }
  );

  if (!message) return null;

  return (
    <div
      ref={toastRef}
      role="status"
      aria-live="polite"
      className="fixed z-[90] left-0 right-0 mx-auto w-fit bottom-5 max-w-[calc(100%-32px)] px-4 py-3 border-nb border-nb-ink rounded-nb bg-nb-ink text-nb-white font-semibold shadow-nb-toast pointer-events-none"
    >
      {message}
    </div>
  );
}
