// Empty state placeholder for feeds with zero results.
// Neo-brutalist dashed container with primary message, helper copy, and optional action button.

import type { ReactNode } from "react";

// ===== TYPES =====

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

// ===== MAIN COMPONENT =====

export default function EmptyState({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      data-in
      className={`flex flex-col items-center justify-center gap-2.5 p-11 text-center bg-nb-white border-nb border-dashed border-nb-ink rounded-nb ${className}`}
    >
      <p className="m-0 text-xl font-bold text-nb-ink">{title}</p>
      <p className="m-0 text-sm text-nb-muted max-w-[48ch]">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
