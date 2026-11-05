// Discovery Grid Content per DISCOVERY_GRID.md.
// Toolbar (filters ghost button, search pill, tabular count, active chips)
// 3-column .dgrid (max 3 cols, 1fr rows), no-match state, empty state,
// animated filters drawer and profile peek with session-local connect & toast notifications.

"use client";

// ===== IMPORTS =====

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { auth, getUserProfile, listPublicProfiles, type UserProfile } from "@/backend/firebase";

import DiscoveryProfileCard from "./cards/DiscoveryProfileCard";
import DiscoveryProfilePeek from "./cards/DiscoveryProfilePeek";
import DiscoveryEmptyState from "./DiscoveryEmptyState";
import DiscoveryFilterSidebar from "./filters/DiscoveryFilterSidebar";
import {
  countActiveFilters,
  emptyFilterSelection,
  type FilterSectionId,
} from "./filter-options";
import { buildDiscoveryBrowseList } from "./map-discovery-profile";
import type { DiscoveryProfile } from "./mock-profiles";

// ===== NAMED CONSTANTS =====

const LOGIN_PATH = "/auth/login";
const ONBOARDING_PATH = "/onboarding";
const TOAST_DURATION_MS = 3200;

// ===== TYPES =====

type OverlayPortalProps = {
  children: ReactNode;
};

// ===== HELPER FUNCTIONS =====

function OverlayPortal({ children }: OverlayPortalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return createPortal(children, document.body);
}

function matchesSearch(profile: DiscoveryProfile, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const words = trimmed.split(/\s+/).filter(Boolean);
  const haystack = [
    profile.displayName,
    profile.major,
    profile.majorShort,
    profile.concentration,
    profile.classRank,
    ...(profile.careerNiche || []),
    ...(profile.casualInterests || []),
    ...(profile.clubs || []),
    ...(profile.lookingFor || []),
    profile.bio,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return words.every((w) => haystack.includes(w));
}

function matchesFilters(
  profile: DiscoveryProfile,
  selected: Record<FilterSectionId, string[]>
): boolean {
  // Major
  if (selected.majors.length > 0) {
    const passed = selected.majors.some(
      (m) =>
        m.toLowerCase() === profile.major?.toLowerCase() ||
        m.toLowerCase() === profile.majorShort?.toLowerCase()
    );
    if (!passed) return false;
  }
  // Concentration
  if (selected.concentrations.length > 0) {
    if (!profile.concentration) return false;
    const passed = selected.concentrations.some(
      (c) => c.toLowerCase() === profile.concentration?.toLowerCase()
    );
    if (!passed) return false;
  }
  // Niches
  if (selected.niches.length > 0) {
    const passed = selected.niches.some((n) =>
      profile.careerNiche?.some((item) => item.toLowerCase() === n.toLowerCase())
    );
    if (!passed) return false;
  }
  // Hobbies
  if (selected.hobbies.length > 0) {
    const passed = selected.hobbies.some((h) =>
      profile.casualInterests?.some((item) => item.toLowerCase() === h.toLowerCase())
    );
    if (!passed) return false;
  }
  // Media
  if (selected.media.length > 0) {
    const passed = selected.media.some((m) =>
      profile.casualInterests?.some((item) => item.toLowerCase() === m.toLowerCase())
    );
    if (!passed) return false;
  }
  // Clubs
  if (selected.clubs.length > 0) {
    const passed = selected.clubs.some((cl) =>
      profile.clubs?.some((item) => item.toLowerCase() === cl.toLowerCase())
    );
    if (!passed) return false;
  }
  // Looking for
  if (selected.lookingFor.length > 0) {
    const passed = selected.lookingFor.some((item) =>
      profile.lookingFor?.some((target) => target.toLowerCase() === item.toLowerCase())
    );
    if (!passed) return false;
  }
  // Class year
  if (selected.classYear.length > 0) {
    const passed = selected.classYear.some(
      (y) => y.toLowerCase() === profile.classRank?.toLowerCase()
    );
    if (!passed) return false;
  }
  return true;
}

// ===== MAIN COMPONENT =====

export default function DiscoveryGridContent() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Search with 120ms debounce per § 4.3
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 120);
    return () => clearTimeout(timer);
  }, [query]);

  // Selected filters
  const [selectedFilters, setSelectedFilters] = useState(emptyFilterSelection);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  // Data fetching
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [browseProfiles, setBrowseProfiles] = useState<DiscoveryProfile[]>([]);
  const [viewerProfile, setViewerProfile] = useState<UserProfile | null>(null);

  // Selection & Interactions
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [requestedProfileIds, setRequestedProfileIds] = useState<string[]>([]);
  const [toastText, setToastText] = useState("");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeFilterCount = countActiveFilters(selectedFilters);
  const hasActiveFilters = activeFilterCount > 0;

  // Filter computation
  const filteredProfiles = useMemo(() => {
    return browseProfiles.filter(
      (p) => matchesSearch(p, debouncedQuery) && matchesFilters(p, selectedFilters)
    );
  }, [browseProfiles, debouncedQuery, selectedFilters]);

  const selectedProfile =
    filteredProfiles.find((p) => p.id === selectedProfileId) ?? null;

  // Stale peek guard per DISCOVERY_GRID.md § 4.9:
  // "Do not open peek from a stale id after filters change."
  useEffect(() => {
    if (selectedProfileId && !selectedProfile) {
      setSelectedProfileId("");
    }
  }, [selectedProfileId, selectedProfile]);

  function showToast(message: string) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastText(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastText("");
    }, TOAST_DURATION_MS);
  }

  function toggleSelectedFilter(sectionId: FilterSectionId, option: string) {
    setSelectedFilters((prev) => {
      const current = prev[sectionId];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [sectionId]: next };
    });
  }

  function clearSearchAndFilters() {
    setQuery("");
    setDebouncedQuery("");
    setSelectedFilters(emptyFilterSelection());
  }

  function handleConnect(profile: DiscoveryProfile) {
    if (!requestedProfileIds.includes(profile.id)) {
      setRequestedProfileIds((prev) => [...prev, profile.id]);
    }
    showToast(`Connect request sent to ${profile.displayName}.`);
  }

  // Load public students from Firestore
  useEffect(() => {
    let isCancelled = false;

    async function loadBrowseProfiles(signedInUser: User) {
      const viewer = await getUserProfile(signedInUser.uid);
      if (isCancelled) return;
      if (!viewer?.onboardingComplete) {
        router.replace(ONBOARDING_PATH);
        return;
      }
      setViewerProfile(viewer);

      try {
        const records = await listPublicProfiles();
        if (isCancelled) return;
        setBrowseProfiles(buildDiscoveryBrowseList(records, signedInUser.uid));
        setErrorMessage("");
      } catch {
        if (isCancelled) return;
        setBrowseProfiles([]);
        setErrorMessage("Could not load students. Try again.");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (signedInUser) => {
      if (!signedInUser) {
        router.replace(LOGIN_PATH);
        return;
      }
      void loadBrowseProfiles(signedInUser);
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [loadAttempt, router]);

  // Escape key closes peek first, then filters drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedProfileId) {
          setSelectedProfileId("");
          return;
        }
        setAreFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProfileId]);

  // Flatten active filter chips for easy pill display
  const activeChips: Array<{ sectionId: FilterSectionId; option: string }> = [];
  (Object.keys(selectedFilters) as FilterSectionId[]).forEach((sec) => {
    selectedFilters[sec].forEach((opt) => {
      activeChips.push({ sectionId: sec, option: opt });
    });
  });

  return (
    <div className="discovery-container">
      {/* ── 4.3 High-Finish Toolbar Deck ── */}
      <div className="dtools-dock">
        {/* Filters ghost button */}
        <button
          type="button"
          id="filtersBtn"
          className={`dtools-filter-btn ${activeFilterCount > 0 ? "has-active" : ""}`}
          aria-expanded={areFiltersOpen}
          aria-controls="discovery-filters-drawer"
          onClick={() => setAreFiltersOpen(true)}
        >
          <SlidersHorizontal size={18} className="dtools-icon" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="dtools-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* Search input pill */}
        <div className="dtools-search-pill">
          <span className="dtools-search-icon" aria-hidden="true">
            <Search size={18} />
          </span>
          <input
            type="search"
            aria-label="Search by name, major, niche or club"
            placeholder="Search by name, major, niche or club…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="dtools-clear-query"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Student Count Chip */}
        <div className="dtools-count-chip tnum" aria-live="polite">
          <span className="live-dot" aria-hidden="true" />
          <span>
            {isLoading
              ? "Loading…"
              : `${filteredProfiles.length} student${filteredProfiles.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {activeChips.length > 0 && (
        <div className="active-filters-bar" aria-label="Active filters">
          <div className="active-chips-scroll">
            {activeChips.map(({ sectionId, option }) => (
              <button
                key={`${sectionId}-${option}`}
                type="button"
                className="fchip-elevated"
                onClick={() => toggleSelectedFilter(sectionId, option)}
                aria-label={`Remove filter ${option}`}
              >
                <span>{option}</span>
                <X size={14} className="fchip-x" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="clear-all-btn"
            onClick={clearSearchAndFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Results / Conditional States ── */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="mono text-[var(--text-muted)]">Loading students…</p>
        </div>
      ) : errorMessage ? (
        <div className="no-match">
          <h3 className="t-card text-[var(--danger)]">{errorMessage}</h3>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setLoadAttempt((prev) => prev + 1)}
          >
            Try again
          </button>
        </div>
      ) : browseProfiles.length === 0 ? (
        /* 4.10 Empty state when no public students exist yet */
        <DiscoveryEmptyState
          hasPublicStudents={false}
          onClearFilters={clearSearchAndFilters}
          viewerProfile={viewerProfile}
          onToast={showToast}
        />
      ) : filteredProfiles.length === 0 ? (
        /* 4.7 No match when search or filters return 0 results */
        <div className="no-match">
          <h3 className="t-card text-[var(--text)]">
            No students match these filters
          </h3>
          <p className="text-[var(--text-body)]">
            Try removing a filter or searching a shorter word.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={clearSearchAndFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* 4.4 / 4.5 3-column discovery grid */
        <div className="dgrid">
          {filteredProfiles.map((profile, i) => (
            <DiscoveryProfileCard
              key={profile.id}
              profile={profile}
              index={i}
              isRequested={requestedProfileIds.includes(profile.id)}
              onView={(p) => setSelectedProfileId(p.id)}
            />
          ))}
        </div>
      )}

      {/* ── Overlays: Filters Drawer & Profile Peek ── */}
      <OverlayPortal>
        <AnimatePresence>
          {/* 4.8 Filters Drawer */}
          {areFiltersOpen && (
            <motion.div
              className="drawer-backdrop"
              onClick={() => setAreFiltersOpen(false)}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <motion.div
                id="discovery-filters-drawer"
                className="drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                onClick={(e) => e.stopPropagation()}
                initial={shouldReduceMotion ? false : { x: -60 }}
                animate={{ x: 0 }}
                exit={shouldReduceMotion ? undefined : { x: -60 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="drawer-head">
                  <h2 className="t-card" style={{ margin: 0, color: "var(--text)" }}>
                    Filters
                  </h2>
                  <button
                    type="button"
                    className="round-btn"
                    aria-label="Close filters"
                    onClick={() => setAreFiltersOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <DiscoveryFilterSidebar
                  selected={selectedFilters}
                  onToggle={toggleSelectedFilter}
                />

                <div className="drawer-foot">
                  <button
                    type="button"
                    className="link"
                    onClick={clearSearchAndFilters}
                    disabled={!hasActiveFilters}
                  >
                    Clear filters
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setAreFiltersOpen(false)}
                  >
                    Show {filteredProfiles.length} student{filteredProfiles.length === 1 ? "" : "s"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 4.9 Profile Peek */}
          {selectedProfile && (
            <DiscoveryProfilePeek
              key={selectedProfile.id}
              profile={selectedProfile}
              requested={requestedProfileIds.includes(selectedProfile.id)}
              onClose={() => setSelectedProfileId("")}
              onConnect={() => handleConnect(selectedProfile)}
            />
          )}
        </AnimatePresence>

        {/* 4.6 Toast notification */}
        <div
          className={`toast ${toastText ? "show" : ""}`}
          role="status"
          aria-live="polite"
        >
          {toastText}
        </div>
      </OverlayPortal>

      <style jsx>{`
        .dtools-dock {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 16px;
          padding: 8px 14px 8px 10px;
          border-radius: 9999px;
          background: #0d0a11;
          border: 2px solid rgba(255, 92, 168, 0.32);
          box-shadow: 0 14px 36px -10px rgba(0, 0, 0, 0.75), 0 0 20px -8px rgba(255, 92, 168, 0.2);
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .dtools-dock {
            border-radius: 20px;
            padding: 12px;
          }
        }

        .dtools-filter-btn {
          height: 48px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px;
          border-radius: 9999px;
          background: #18131f;
          border: 2px solid #362a3f;
          color: #ffffff;
          font-family: var(--f-body, sans-serif);
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dtools-filter-btn:hover {
          background: #251b2f;
          border-color: #ff5ca8;
          transform: translateY(-1px);
        }

        .dtools-filter-btn.has-active {
          background: #28142b;
          border-color: #ff5ca8;
          box-shadow: 0 0 16px rgba(255, 92, 168, 0.35);
        }

        :global(.dtools-icon) {
          color: #ff5ca8;
        }

        .dtools-badge {
          display: inline-grid;
          place-items: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          color: #0d0b0e;
          font-family: var(--f-mono);
          font-size: 11.5px;
          font-weight: 800;
        }

        .dtools-search-pill {
          flex: 1 1 300px;
          position: relative;
          display: flex;
          align-items: center;
          min-height: 48px;
          border-radius: 9999px;
          background: #120e17;
          border: 2px solid #362a3f;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .dtools-search-pill:focus-within {
          border-color: #ff5ca8;
          box-shadow: 0 0 0 3px rgba(255, 92, 168, 0.25);
        }

        .dtools-search-icon {
          position: absolute;
          left: 16px;
          color: #ff5ca8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .dtools-search-pill input {
          width: 100%;
          height: 44px;
          background: transparent;
          border: none;
          outline: none;
          padding-left: 46px;
          padding-right: 36px;
          color: #ffffff;
          font-family: var(--f-body, sans-serif);
          font-size: 15px;
          font-weight: 500;
        }

        .dtools-search-pill input::placeholder {
          color: #b5aab3;
          font-size: 14px;
        }

        .dtools-clear-query {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #251b2f;
          border: 1px solid #4a3858;
          color: #ffffff;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .dtools-clear-query:hover {
          background: #ff5ca8;
          color: #0d0b0e;
        }

        .dtools-count-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: #18131f;
          border: 1.5px solid #362a3f;
          color: #ffffff;
          font-family: var(--f-mono);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff5ca8;
          box-shadow: 0 0 8px #ff5ca8;
        }

        .active-filters-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .active-chips-scroll {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .fchip-elevated {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          padding: 0 10px 0 14px;
          border-radius: 999px;
          background: #241228;
          border: 1.5px solid #ff5ca8;
          color: white;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .fchip-elevated:hover {
          background: rgb(255 92 168 / 0.2);
          border-color: #ff5ca8;
          transform: translateY(-1px);
        }

        :global(.fchip-x) {
          color: #ff5ca8;
        }

        .clear-all-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: var(--f-mono);
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.15s ease;
        }

        .clear-all-btn:hover {
          color: #ff5ca8;
        }
      `}</style>
    </div>
  );
}
