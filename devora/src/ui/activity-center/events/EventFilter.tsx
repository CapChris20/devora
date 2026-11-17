// Event filter chips (All, Academic, Social, Workshop, Club).
// Neo-brutalist pill buttons that toggle the active event category.

"use client";

// ===== IMPORTS =====

import { useActivityCenter } from "../ActivityCenterContext";

// ===== FILTER CONSTANTS =====

const FILTERS = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "social", label: "Social" },
  { id: "workshop", label: "Workshop" },
  { id: "club", label: "Club" },
  { id: "hangout", label: "Hangout" },
];

// ===== MAIN COMPONENT =====

export default function EventFilter() {
  const { eventFilter, setEventFilter } = useActivityCenter();

  return (
    <div
      role="group"
      aria-label="Filter events"
      data-in
      className="flex flex-wrap gap-2 mb-8 sm:mb-10"
    >
      {FILTERS.map((item) => {
        const isSelected = eventFilter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setEventFilter(item.id)}
            className={`min-h-[38px] px-4 rounded-full border-2 border-nb-ink font-nb-mono text-xs font-bold tracking-[0.08em] uppercase transition-all duration-120 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-sm active:translate-x-px active:translate-y-px ${
              isSelected
                ? "bg-nb-ink text-nb-white"
                : "bg-nb-white text-nb-ink"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
