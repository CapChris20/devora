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
      : `${tone} text-nb-ink`;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border-2 border-nb-ink font-nb-mono text-[10px] font-bold tracking-[0.08em] uppercase whitespace-nowrap ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
