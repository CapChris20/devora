// Category filter chips for Clubs tab (All, Professional, Academic, Social, Competitive).
// Matches the neo-brutalist pill button style used in EventFilter.

"use client";

import type { ClubCategory } from "@/types/clubs";

export type FilterCategory = "all" | ClubCategory;

const FILTERS: { id: FilterCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Professional", label: "Professional" },
  { id: "Academic", label: "Academic" },
  { id: "Social", label: "Social" },
  { id: "Competitive", label: "Competitive" },
];

interface ClubCategoryFilterProps {
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
}

export default function ClubCategoryFilter({
  activeCategory,
  onSelectCategory,
}: ClubCategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter clubs by category"
      className="flex flex-wrap gap-2 sm:gap-2.5"
    >
      {FILTERS.map((item) => {
        const isSelected = activeCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(item.id)}
            className={`min-h-[38px] px-4.5 rounded-full border-2 font-mono text-xs font-bold tracking-[0.08em] uppercase transition-all duration-120 cursor-pointer select-none active:translate-x-px active:translate-y-px ${
              isSelected
                ? "bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] font-extrabold"
                : "bg-white dark:bg-[#161022] text-[#0a0a0a] dark:text-neutral-300 border-[#0a0a0a] dark:border-white/20 shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

