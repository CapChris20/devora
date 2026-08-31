"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, y = 44, className = "" }: FadeInProps) {
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

type SectionNumberProps = {
  num: string;
  title: string;
};

export function SectionNumber({ num, title }: SectionNumberProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="landing-chapter-num font-pixel logo-gradient text-[10px]">{num}</span>
      <span className="landing-chapter-line h-px w-16" aria-hidden="true" />
      <span className="theme-faint text-xs uppercase tracking-[0.4em]">{title}</span>
    </div>
  );
}
