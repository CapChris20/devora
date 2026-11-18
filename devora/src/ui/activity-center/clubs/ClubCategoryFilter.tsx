// Category filter chips for Clubs tab (All, Professional, Academic, Social, Competitive).
// Spacious Neo-Brutalist pill button style with generous horizontal padding,
// bold typography, 2.5px ink borders, and hard offset shadows.

"use client";

import type { ClubCategory } from "@/types/clubs";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

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
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      role="group"
      aria-label="Filter clubs by category"
      className="flex flex-wrap items-center gap-2.5 sm:gap-3"
    >
      {FILTERS.map((item) => {
        const isSelected = activeCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(item.id)}
            className={`min-h-[42px] px-5 sm:px-6 rounded-full border-[2.5px] font-mono text-xs sm:text-[13px] font-extrabold tracking-[0.06em] uppercase transition-all duration-150 cursor-pointer select-none active:translate-x-0.5 active:translate-y-0.5 ${
              item.id === "all" ? "min-w-[68px]" : ""
            } ${
              isSelected
                ? "bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                : isLight
                ? "bg-white text-[#0a0a0a] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0a0a0a]"
                : "bg-[#161022] text-white border-white/30 shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000000]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
