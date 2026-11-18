// Tag component for categories, meeting preferences, and course codes.
// Neo-brutalist pill badge with 2px ink outline and uppercase mono typography.

import type { ReactNode } from "react";

// ===== TYPES =====

type TagProps = {
  children: ReactNode;
  tone?: "bg-nb-brand" | "bg-nb-orchid" | "bg-nb-sky" | "bg-nb-blush" | "default";
  className?: string;
};

// ===== MAIN COMPONENT =====

export default function Tag({ children, tone = "default", className = "" }: TagProps) {
  const toneClass =
    tone === "default"
      ? "bg-nb-white text-nb-ink"
      : `${tone} text-[#0A0A0A]`;

  return (
    <span
      className={`inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full border-2 border-[#0A0A0A] dark:border-white/40 font-mono text-xs sm:text-[13px] font-black tracking-wider uppercase whitespace-nowrap shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
