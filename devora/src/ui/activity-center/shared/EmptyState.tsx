// Creative Neo-Brutalist Empty State component for feeds and screens with zero data.
// Features geometric technical glyphs, monospace status chips, and hard block shadows.
// Strictly NO emojis.

import type { ReactNode } from "react";

// ===== TYPES =====

type EmptyStateProps = {
  statusTag?: string;
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

// ===== MAIN COMPONENT =====

export default function EmptyState({
  statusTag = "SYSTEM // 00_STANDBY",
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      data-in
      className={`relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-nb-white border-2 border-nb-ink rounded-nb shadow-nb-card ${className}`}
    >
      {/* Decorative technical corner watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-3 right-4 font-nb-mono text-[10px] font-bold tracking-[0.2em] text-nb-ink/20 uppercase"
      >
        DEVORA // 00_NULL
      </span>

      {/* Geometric glyph container with hard offset shadow */}
      <div className="relative mb-4 flex items-center justify-center w-16 h-16 rounded-nb border-2 border-nb-ink bg-nb-brand shadow-[4px_4px_0px_#000000] -rotate-2 transition-transform duration-200 hover:rotate-0">
        {icon ? (
          icon
        ) : (
          <svg
            aria-hidden="true"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#0A0A0A]"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      {/* Technical status tag */}
      <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border-2 border-nb-ink bg-nb-paper font-nb-mono text-[10px] font-bold tracking-[0.16em] uppercase text-nb-ink">
        <span className="w-2 h-2 rounded-full bg-nb-brand animate-pulse border border-nb-ink" />
        <span>{statusTag}</span>
      </div>

      {/* Main Title & Description */}
      <h3 className="m-0 text-xl sm:text-2xl font-bold tracking-tight text-nb-ink">
        {title}
      </h3>
      <p className="mt-2 mb-0 text-sm sm:text-base text-nb-muted max-w-[46ch] leading-relaxed">
        {description}
      </p>

      {/* Action button slot */}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
