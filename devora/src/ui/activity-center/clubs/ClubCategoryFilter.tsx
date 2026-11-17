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
      className="flex flex-wrap gap-2 mb-6"
    >
      {FILTERS.map((item) => {
        const isSelected = activeCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(item.id)}
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

