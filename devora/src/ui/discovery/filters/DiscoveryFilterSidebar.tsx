// Filter sidebar for Discovery Grid — search + 8 pill sections + clear footer.
// Flow: type search / click pills → parent stores selection (grid filtering comes with Firestore).
// Styles: .page-panel / .page-pill / .page-search-* in globals.css. Used by DiscoveryGridContent.

"use client";

import { Search } from "lucide-react";

import {
  FILTER_SECTIONS,
  countActiveFilters,
  type FilterSectionId,
} from "../filter-options";

type DiscoveryFilterSidebarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  selected: Record<FilterSectionId, string[]>;
  onToggle: (sectionId: FilterSectionId, option: string) => void;
  onClear: () => void;
};

// Glass sidebar: search on top, scrollable pill groups, sticky clear at the bottom.
export default function DiscoveryFilterSidebar({
  query,
  onQueryChange,
  selected,
  onToggle,
  onClear,
}: DiscoveryFilterSidebarProps) {
  const activeCount = countActiveFilters(selected);

  return (
    <aside className="discovery-filters page-panel">
      {/* Search icon uses gold from the shader, not flat cyan */}
      <label className="page-search-wrap discovery-search">
        <span className="sr-only">Search students</span>
        <Search className="discovery-search-icon" size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, major, tags…"
          className="page-search-input"
        />
      </label>

      <div className="discovery-filter-scroll">
        {FILTER_SECTIONS.map((section) => {
          const activeSet = selected[section.id];

          return (
            <div key={section.id} className="discovery-filter-block">
              {/* page-section-label + gradient class = DESIGN_SCOPE cycling titles */}
              <p className={`page-section-label discovery-filter-label ${section.labelClass}`}>
                {section.label}
              </p>
              <div className="discovery-pill-row">
                {section.options.map((option) => {
                  const isActive = activeSet.includes(option);
                  const pillClass = [
                    "page-pill",
                    section.pillClass,
                    isActive ? "page-pill-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={option}
                      type="button"
                      // vocab: aria-pressed = toggle button state for screen readers
                      aria-pressed={isActive}
                      className={pillClass}
                      onClick={() => onToggle(section.id, option)}
                    >
                      {/* Active pills get gradient text; inactive stay theme-neutral */}
                      <span
                        className={
                          isActive
                            ? `page-pill-active-label ${section.activeLabelClass}`.trim()
                            : undefined
                        }
                      >
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {activeCount > 0 ? (
        <div className="discovery-filter-footer">
          <button
            type="button"
            className="page-btn-outline page-btn-grad-logo discovery-clear-btn"
            onClick={onClear}
          >
            Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
