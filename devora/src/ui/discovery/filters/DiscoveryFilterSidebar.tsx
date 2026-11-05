// Filter sidebar body for Discovery Grid per DISCOVERY_GRID.md § 4.8.
// Fieldsets with mono legends, 40px .pill buttons with aria-pressed.

"use client";

// ===== IMPORTS =====

import {
  FILTER_SECTIONS,
  type FilterSectionId,
} from "../filter-options";

// ===== TYPES =====

type DiscoveryFilterSidebarProps = {
  selected: Record<FilterSectionId, string[]>;
  onToggle: (sectionId: FilterSectionId, option: string) => void;
};

// ===== MAIN COMPONENT =====

/**
 * Filter sections per DISCOVERY_GRID.md § 4.8.
 * Renders fieldsets with Space Mono legends and 40px .pill buttons.
 */
export default function DiscoveryFilterSidebar({
  selected,
  onToggle,
}: DiscoveryFilterSidebarProps) {
  return (
    <div className="drawer-body">
      {FILTER_SECTIONS.map((section) => (
        <fieldset key={section.id} className="filter-fieldset">
          <legend className="filter-legend">
            <span>{section.label}</span>
            {selected[section.id]?.length > 0 && (
              <span className="filter-count-badge">
                {selected[section.id].length}
              </span>
            )}
          </legend>
          <div className="filter-pill-wrap">
            {section.options.map((option) => {
              const isSelected = selected[section.id]?.includes(option) ?? false;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  className={`filter-pill ${isSelected ? "is-active" : ""}`}
                  onClick={() => onToggle(section.id, option)}
                >
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <style jsx>{`
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .filter-fieldset {
          border: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-legend {
          font-family: var(--f-mono, monospace);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #a9a2a7);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .filter-count-badge {
          display: inline-grid;
          place-items: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          color: #0d0b0e;
          font-size: 11px;
          font-weight: 800;
        }

        .filter-pill-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-pill {
          height: 38px;
          display: inline-flex;
          align-items: center;
          padding: 0 16px;
          border-radius: 9999px;
          background: rgb(255 255 255 / 0.07);
          border: 2px solid rgb(255 255 255 / 0.16);
          color: var(--text, #fbf6f8);
          font-family: var(--f-body, sans-serif);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .filter-pill:hover {
          background: rgb(255 92 168 / 0.16);
          border-color: #ff5ca8;
          transform: translateY(-1px);
        }

        .filter-pill.is-active {
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%)) !important;
          border-color: #ff2bd6 !important;
          color: #0d0b0e !important;
          font-weight: 800;
          box-shadow: 0 3px 12px rgb(255 92 168 / 0.38);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
