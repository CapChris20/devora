"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type LandingRevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

export function LandingReveal({ children, delay = 0, y = 44, className = "" }: LandingRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

type LandingChapterProps = {
  num: string;
  title: string;
};

export function LandingChapter({ num, title }: LandingChapterProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-pixel text-[10px] text-[#ff5ca8] [text-shadow:0_0_14px_rgba(255,92,168,0.9)]">
        {num}
      </span>
      <span className="h-px w-16 bg-gradient-to-r from-[#ff5ca8] to-transparent" />
      <span className="text-xs uppercase tracking-[0.4em] text-white/50">{title}</span>
    </div>
  );
}
