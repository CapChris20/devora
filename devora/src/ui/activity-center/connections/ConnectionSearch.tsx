// Search box component for accepted connections.
// Filters contacts in real-time by student name and major.

"use client";

// ===== IMPORTS =====

import { useActivityCenter } from "../ActivityCenterContext";

// ===== MAIN COMPONENT =====

export default function ConnectionSearch() {
  const { searchQuery, setSearchQuery } = useActivityCenter();

  return (
    <label
      htmlFor="people-search"
      className="flex items-center gap-2 min-h-[46px] px-3 border-nb border-nb-ink rounded-nb bg-nb-white mb-4 focus-within:shadow-nb-sm"
    >
      <span aria-hidden="true" className="text-nb-ink flex-shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      </span>

      <input
        id="people-search"
        type="search"
        placeholder="Search by name or major"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoComplete="off"
        className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[15px] text-nb-ink placeholder:text-nb-muted"
      />
    </label>
  );
}
