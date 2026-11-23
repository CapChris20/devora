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
      className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-8 sm:mb-10 w-full"
    >
      {filters.map((item) => {
        const isSelected = eventFilter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setEventFilter(item.id)}
            className={`min-h-[40px] sm:min-h-[42px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-2 font-mono text-xs sm:text-[12.5px] font-black uppercase tracking-wider transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 select-none ${
              isSelected
                ? item.isSpecial
                  ? "bg-gradient-to-r from-[#34d399] to-[#10b981] text-[#0A0A0A] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
                  : "bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0A0A0A] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
                : item.isSpecial && savedEventsCount > 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-600 shadow-[2.5px_2.5px_0px_#0A0A0A]"
                : "bg-white dark:bg-[#181026] text-[#0A0A0A] dark:text-white border-[#0A0A0A] dark:border-white/40 shadow-[2.5px_2.5px_0px_#0A0A0A] dark:shadow-[2.5px_2.5px_0px_#000000] hover:bg-neutral-50 dark:hover:bg-[#221636] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_#000000]"
            }`}
          >
            {item.isSpecial && <span className="text-[11px]">★</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
