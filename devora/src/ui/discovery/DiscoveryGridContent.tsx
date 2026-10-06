// Discovery Grid shell — Filters overlay only until Firestore browse is wired.
// Flow: Filters button → left glass drawer (search + pills). Cards / peek stay unmounted.
// When data lands, mount the grid from src/docs/discovery-grid.md (not mock-profiles).

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import DiscoveryFilterSidebar from "./filters/DiscoveryFilterSidebar";
import {
  countActiveFilters,
  emptyFilterSelection,
  type FilterSectionId,
} from "./filter-options";

// Paint the drawer on <body> so it covers navbar + footer.
// Why? PageLayout wraps content in `relative z-10`. A `position: fixed` drawer
// inside that column stays trapped — the footer paints over the bottom of it.
// vocab: createPortal = React still owns the tree, DOM node goes on document.body
// vocab: useState(false) + useEffect = wait one paint so we don't touch document during SSR
function OverlayPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function DiscoveryGridContent() {
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(emptyFilterSelection);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // vocab: useReducedMotion = Framer hook — skip the slide when OS Reduce motion is on
  const reduceMotion = useReducedMotion();

  const activeCount = countActiveFilters(selected);

  function toggleFilter(sectionId: FilterSectionId, option: string) {
    setSelected((prev) => {
      const current = prev[sectionId];
      const nextValues = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [sectionId]: nextValues };
    });
  }

  function clearFilters() {
    setQuery("");
    setSelected(emptyFilterSelection());
  }

  // Escape closes the filter drawer.
  // vocab: useEffect = run after paint; the return function is cleanup (remove the listener)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      setFiltersOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="discovery-root">
      {/* Toolbar stays so the real grid can sit full-width under it later. */}
      <div className="discovery-toolbar">
        <button
          type="button"
          className="discovery-menu-btn"
          aria-expanded={filtersOpen}
          aria-controls="discovery-filters-drawer"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span>Filters</span>
          {activeCount > 0 ? (
            <span className="discovery-menu-badge">{activeCount}</span>
          ) : null}
        </button>
      </div>

      {/*
        Grid / peek are intentionally not rendered.
        Rebuild from src/docs/discovery-grid.md when users/{uid} browse exists.
      */}

      <OverlayPortal>
        <AnimatePresence>
          {filtersOpen ? (
            <motion.div
              className="discovery-drawer-backdrop"
              onClick={() => setFiltersOpen(false)}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <motion.div
                id="discovery-filters-drawer"
                className="discovery-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                onClick={(e) => e.stopPropagation()}
                // vocab: x = slide from the left; 0 = rest position
                initial={reduceMotion ? false : { x: -28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { x: -24, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="discovery-drawer-head">
                  <p className="discovery-drawer-title">Filters</p>
                  <button
                    type="button"
                    className="page-icon-btn"
                    aria-label="Close filters"
                    onClick={() => setFiltersOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <DiscoveryFilterSidebar
                  query={query}
                  onQueryChange={setQuery}
                  selected={selected}
                  onToggle={toggleFilter}
                  onClear={clearFilters}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </OverlayPortal>
    </div>
  );
}
