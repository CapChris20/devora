// Shared auto-cycle for Why Devora + Best Use Cases cards.
// Flow: a timer-bar fills → onAnimationEnd advances the page → bar restarts.
// Hover pauses the CSS animation (so the switch waits). Dots still jump immediately.
// Used by WhyNot.tsx and BestUseCases.tsx.

"use client";

import { useEffect, useState } from "react";

// How long each card state stays on screen before auto-advancing.
// Manipulate here: lower = faster carousel; raise = more reading time
export const CARD_CYCLE_MS = 8000;

type UseCardCycleResult = {
  // Which page / rival is showing (0-based)
  index: number;
  // Jump to a specific page (dot click) and restart that page’s bar
  goTo: (next: number) => void;
  // true while the pointer is over the card — CSS animation-play-state: paused
  paused: boolean;
  setPaused: (next: boolean) => void;
  // Bumped on every goTo so the active bar remounts even if the index stayed the same
  cycleKey: number;
  // OS “reduce motion” — no autoplay, no bar
  reduceMotion: boolean;
  // Called when the active bar’s CSS animation finishes
  onComplete: () => void;
};

// Holds the current page index and the pause/restart knobs the progress bar needs.
// vocab: count = how many states to loop (3 rivals, or 2 use-case pages)
export function useCardCycle(count: number): UseCardCycleResult {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Read the OS accessibility setting once, then keep it in sync if the user toggles it.
  // vocab: matchMedia = CSS-media-query API from JS; "reduce" means “don’t auto-animate”
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    // vocab: addEventListener("change") = fire apply() when the user flips the OS setting
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Dot click (or any jump): set the page AND restart the fill on that page’s bar.
  const goTo = (next: number) => {
    setIndex(next);
    setCycleKey((k) => k + 1);
  };

  // Bar finished filling → next state. `% count` wraps 2 → 0 (or 1 → 0 on two pages).
  const onComplete = () => {
    setIndex((i) => (i + 1) % count);
  };

  return {
    index,
    goTo,
    paused,
    setPaused,
    cycleKey,
    reduceMotion,
    onComplete,
  };
}

type CardCycleBarProps = {
  // How many segments (one per card state)
  count: number;
  // Which segment is currently filling
  activeIndex: number;
  durationMs?: number;
  paused: boolean;
  cycleKey: number;
  reduceMotion: boolean;
  onComplete: () => void;
};

// Instagram-style segment row: past = full, current = filling, future = empty.
// Manipulate here: durationMs on the fill; CSS lives under .card-cycle-* in globals.css
export function CardCycleBar({
  count,
  activeIndex,
  durationMs = CARD_CYCLE_MS,
  paused,
  cycleKey,
  reduceMotion,
  onComplete,
}: CardCycleBarProps) {
  // Accessibility: no autoplay, so a ticking bar would be a lie — hide it.
  if (reduceMotion) return null;

  return (
    <div
      className="card-cycle-bar"
      // vocab: aria-hidden = decorative only; dots already expose which page is selected
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;

        return (
          <div key={i} className="card-cycle-seg">
            <div
              // Remount the active fill when cycleKey changes so a dot click restarts the timer.
              // vocab: key = React identity; new key = throw away the old node and start the CSS animation again
              key={isActive ? `${i}-${cycleKey}` : i}
              className={`card-cycle-fill${isDone ? " card-cycle-fill-done" : ""}${
                isActive ? " card-cycle-fill-active" : ""
              }`}
              style={
                isActive
                  ? {
                      animationDuration: `${durationMs}ms`,
                      // vocab: animationPlayState = running | paused (hover uses paused)
                      animationPlayState: paused ? "paused" : "running",
                    }
                  : undefined
              }
              onAnimationEnd={isActive ? onComplete : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
