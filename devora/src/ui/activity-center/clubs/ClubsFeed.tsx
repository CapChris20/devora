// Feed of UM-Dearborn CECS Clubs with category filtering, search, and one-click follow.

"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Compass, AlertCircle } from "lucide-react";
import type { Club } from "@/types/clubs";
import { auth } from "@/backend/firebase/start-firebase";
import {
  fetchClubsFromFirestore,
  fetchUserFollowedClubIds,
  toggleFollowClubInFirestore,
} from "@/backend/firebase/clubs";
import { REAL_SEEDED_CLUBS } from "./seeded-clubs";
import ClubCard from "./ClubCard";
import ClubCategoryFilter, { type FilterCategory } from "./ClubCategoryFilter";
import { useActivityCenter } from "../ActivityCenterContext";

export default function ClubsFeed() {
  const { showToast } = useActivityCenter();
  const [clubs, setClubs] = useState<Club[]>(REAL_SEEDED_CLUBS);
  const [followedClubIds, setFollowedClubIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingClubId, setTogglingClubId] = useState<string | null>(null);

  // Load clubs and user's followed clubs on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const fetchedClubs = await fetchClubsFromFirestore();
        if (isMounted && fetchedClubs.length > 0) {
          setClubs(fetchedClubs);
        }

        const currentUser = auth.currentUser;
        if (currentUser && isMounted) {
          const ids = await fetchUserFollowedClubIds(currentUser.uid);
          setFollowedClubIds(new Set(ids));
        }
      } catch (err) {
        console.error("Failed to load clubs feed data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Listen to auth state change to update followed clubs if user logs in/out
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserFollowedClubIds(user.uid).then((ids) => {
          if (isMounted) setFollowedClubIds(new Set(ids));
        });
      } else {
        if (isMounted) setFollowedClubIds(new Set());
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Handle follow / unfollow toggle
  const handleToggleFollow = async (clubId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("Please sign in to follow clubs");
      return;
    }

    const isCurrentlyFollowed = followedClubIds.has(clubId);
    setTogglingClubId(clubId);

    // Optimistic UI update
    setFollowedClubIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFollowed) {
        next.delete(clubId);
      } else {
        next.add(clubId);
      }
      return next;
    });

    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            followerCount: isCurrentlyFollowed
              ? Math.max(0, c.followerCount - 1)
              : c.followerCount + 1,
          };
        }
        return c;
      })
    );

    try {
      const isNowFollowed = await toggleFollowClubInFirestore(
        currentUser.uid,
        clubId,
        isCurrentlyFollowed
      );

      const targetClub = clubs.find((c) => c.id === clubId);
      const clubName = targetClub?.shortName || "Club";

      if (isNowFollowed) {
        showToast(`Now following ${clubName}`);
      } else {
        showToast(`Unfollowed ${clubName}`);
      }
    } catch {
      // Revert on error
      setFollowedClubIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFollowed) next.add(clubId);
        else next.delete(clubId);
        return next;
      });
      showToast("Could not update follow status");
    } finally {
      setTogglingClubId(null);
    }
  };

  // Filter and search
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      // Category check
      if (activeCategory !== "all" && club.category !== activeCategory) {
        return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = club.name.toLowerCase().includes(q);
        const matchesShort = club.shortName.toLowerCase().includes(q);
        const matchesDesc = club.description.toLowerCase().includes(q);
        return matchesName || matchesShort || matchesDesc;
      }

      return true;
    });
  }, [clubs, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="py-20 text-center font-nb-mono text-xs uppercase tracking-wider text-nb-muted">
        Loading CECS clubs…
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls Row: Category Filter bar & Search box */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <ClubCategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Search input */}
        <div className="relative mb-6 lg:mb-0 min-w-[280px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nb-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search clubs by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-2 border-nb-ink bg-nb-white pl-10 pr-4 py-2 text-xs font-nb-mono text-nb-ink placeholder:text-nb-muted focus:border-nb-pink focus:outline-none shadow-nb-sm"
          />
        </div>
      </div>

      {/* Header Info count */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-nb-ink pb-3">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-nb-pink" />
          <h2 className="font-nb-display text-lg font-bold uppercase tracking-wider text-nb-ink">
            CECS Student Organizations
          </h2>
        </div>
        <span className="font-nb-mono text-xs font-bold text-nb-muted">
          Showing {filteredClubs.length} of {clubs.length} clubs
        </span>
      </div>

      {/* Grid of Club Cards */}
      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              isFollowed={followedClubIds.has(club.id)}
              onToggleFollow={handleToggleFollow}
              isToggling={togglingClubId === club.id}
            />
          ))}
        </div>
      ) : (
        /* Empty search state - STRICTLY NO EMOJIS */
        <div className="rounded-xl border-2 border-dashed border-nb-ink bg-nb-white/50 p-12 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-nb-muted" />
          <h3 className="font-nb-display text-base font-bold text-nb-ink">
            No matching clubs found
          </h3>
          <p className="mt-1 font-nb-mono text-xs text-nb-muted">
            Try adjusting your search query or switching categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-lg border-2 border-nb-ink bg-nb-white px-4 py-2 font-nb-mono text-xs font-bold uppercase text-nb-ink shadow-nb-sm hover:bg-neutral-100"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
