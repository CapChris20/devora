// Event filter chips (All, My Week, Academic, Social, Workshop, Club, Hangout).
// Neo-brutalist pill buttons that toggle the active event category.

"use client";

// ===== IMPORTS =====

import { useActivityCenter } from "../ActivityCenterContext";

// ===== MAIN COMPONENT =====

export default function EventFilter() {
  const { eventFilter, setEventFilter, savedEventsCount } = useActivityCenter();

  const filters = [
    { id: "all", label: "All Events" },
    {
      id: "saved",
      label: `My Week (${savedEventsCount})`,
      isSpecial: true,
    },
    { id: "academic", label: "Academic" },
    { id: "social", label: "Social" },
    { id: "workshop", label: "Workshop" },
    { id: "club", label: "Club" },
    { id: "hangout", label: "Hangout" },
  ];

  return (
    <div
      role="group"
      aria-label="Filter events"
      data-in
      className="flex flex-wrap items-center gap-2.5 mb-8 sm:mb-10"
    >
      {filters.map((item) => {
        const isSelected = eventFilter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setEventFilter(item.id)}
            className={`min-h-[40px] px-4.5 rounded-full border-2 font-mono text-xs font-black tracking-[0.06em] uppercase transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? item.isSpecial
                  ? "bg-[#10b981] text-white border-[#0A0A0A] shadow-[2.5px_2.5px_0px_#0A0A0A]"
                  : "bg-nb-ink dark:bg-white text-nb-white dark:text-[#0A0A0A] border-nb-ink dark:border-white shadow-[2.5px_2.5px_0px_#0A0A0A] dark:shadow-[2.5px_2.5px_0px_#000000]"
                : item.isSpecial && savedEventsCount > 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-600 shadow-[2px_2px_0px_#0A0A0A]"
                : "bg-nb-white dark:bg-[#181026] text-nb-ink dark:text-white border-nb-ink dark:border-white/40 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-neutral-100 dark:hover:bg-[#221636]"
            }`}
          >
            {item.isSpecial && <span>★</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
