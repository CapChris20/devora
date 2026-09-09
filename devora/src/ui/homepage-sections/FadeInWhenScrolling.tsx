// Shared scroll helpers for homepage sections.
// FadeIn: fade + slide up when the block enters the viewport (used by every landing chapter).
// SectionNumber: small “01 · The Platform” chapter label above each section headline.

"use client";

// vocab: framer-motion = animation library; whileInView = animate when scrolled into view
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  // Seconds to wait after entering view before starting (stagger siblings with 0.08 * i)
  // Manipulate here: pass delay={0.2} for a later entrance
  delay?: number;
  // How many pixels below its final spot the block starts (higher = bigger slide)
  // Manipulate here: lower y for a subtler rise; raise for a more dramatic entrance
  y?: number;
  className?: string;
};

// Wrap any block so it stays invisible until the user scrolls it into view.
export function FadeIn({ children, delay = 0, y = 44, className = "" }: FadeInProps) {
  return (
    <motion.div
      className={className}
      // Start slightly below and fully transparent.
      // vocab: opacity 0 = invisible; y = vertical offset in pixels (positive = lower on screen)
      initial={{ opacity: 0, y }}
      // Animate to normal place once visible.
      // vocab: whileInView = trigger when this block enters the viewport (not on mount alone)
      whileInView={{ opacity: 1, y: 0 }}
      // once: true = don’t replay when scrolling back up; margin fires a bit early.
      // vocab: viewport.margin = "-80px" starts the animation ~80px before the block is fully on screen
      // Manipulate here: change margin to fire earlier/later; set once:false to replay on re-entry
      viewport={{ once: true, margin: "-80px" }}
      // vocab: ease cubic-bezier = custom acceleration [x1,y1,x2,y2] — this one eases out softly
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

type SectionNumberProps = {
  // Two-digit chapter string, e.g. "01"
  num: string;
  // Uppercase short title after the rule, e.g. "The Platform"
  title: string;
};

// Chapter row: pixel number, short line, then uppercase section title.
// Manipulate here: change num/title at each call site (WhatIsDevora, FourSteps, …)
export function SectionNumber({ num, title }: SectionNumberProps) {
  return (
    <div className="flex items-center gap-4">
      {/* logo-gradient = brand fill on the pixel chapter number */}
      <span className="landing-chapter-num font-pixel logo-gradient text-[10px]">{num}</span>
      {/* Decorative hairline between number and title — hidden from assistive tech */}
      <span className="landing-chapter-line h-px w-16" aria-hidden="true" />
      <span className="theme-faint text-xs uppercase tracking-[0.4em]">{title}</span>
    </div>
  );
}
