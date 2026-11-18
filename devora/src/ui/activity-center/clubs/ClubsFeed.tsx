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
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

export default function ClubsFeed() {
  const { showToast } = useActivityCenter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [clubs, setClubs] = useState<Club[]>(REAL_SEEDED_CLUBS);
  const [followedClubIds, setFollowedClubIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingClubId, setTogglingClubId] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState<number>(36);

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
  const { filteredClubs, featuredClubId } = useMemo(() => {
    const list = clubs.filter((club) => {
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

    let featuredId: string | null = null;
    if (list.length >= 3) {
      let maxFollowers = -1;
      for (const c of list) {
        if (c.followerCount > maxFollowers) {
          maxFollowers = c.followerCount;
          featuredId = c.id;
        }
      }
    }

    const sorted = [...list].sort((a, b) => {
      return (b.id === featuredId ? 1 : 0) - (a.id === featuredId ? 1 : 0);
    });

    return { filteredClubs: sorted, featuredClubId: featuredId };
  }, [clubs, activeCategory, searchQuery]);

  const displayedClubs = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredClubs;
    }
    return filteredClubs.slice(0, visibleLimit);
  }, [filteredClubs, searchQuery, visibleLimit]);

  if (loading) {
    return (
      <div className="py-20 text-center font-nb-mono text-xs uppercase tracking-wider text-nb-muted">
        Loading campus clubs & student organizations…
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls Row: Category Filter bar & Search box */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <ClubCategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setVisibleLimit(36);
          }}
        />

        {/* Search input */}
        <div className="relative min-w-[280px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#575757] dark:text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search clubs by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-[2.5px] border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#161022] pl-10 pr-4 py-2 text-xs font-mono text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-400 focus:border-[#fb923c] dark:focus:border-[#fb923c] focus:outline-none shadow-[3px_3px_0px_#0a0a0a] dark:shadow-[3px_3px_0px_#000000]"
          />
        </div>
      </div>

      {/* Header Info count */}
      <div className={`flex items-center justify-between mb-8 border-b-2 pb-4 ${
        isLight ? "border-neutral-300" : "border-white/20"
      }`}>
        <div className="flex items-center gap-2.5">
          <Compass size={20} className="text-[#fb923c]" />
          <h2 className={`font-display text-lg font-bold uppercase tracking-wider ${
            isLight ? "text-[#0a0a0a]" : "text-white"
          }`}>
            Campus Student Organizations
          </h2>
        </div>
        <span className={`font-mono text-xs font-bold ${
          isLight ? "text-[#575757]" : "text-neutral-400"
        }`}>
          {searchQuery.trim()
            ? `Found ${filteredClubs.length} matching of ${clubs.length} clubs`
            : displayedClubs.length < filteredClubs.length
            ? `Showing ${displayedClubs.length} of ${filteredClubs.length} clubs (${clubs.length} total)`
            : `Showing all ${filteredClubs.length} clubs`}
        </span>
      </div>

      {/* Grid of Club Cards */}
      {filteredClubs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isFollowed={followedClubIds.has(club.id)}
                onToggleFollow={handleToggleFollow}
                isToggling={togglingClubId === club.id}
                isFeatured={club.id === featuredClubId}
              />
            ))}
          </div>

          {!searchQuery.trim() && displayedClubs.length < filteredClubs.length && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 36)}
                className="h-11 px-6 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#fb923c] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Load 36 More Clubs ({filteredClubs.length - displayedClubs.length} remaining)
              </button>
              <button
                type="button"
                onClick={() => setVisibleLimit(filteredClubs.length)}
                className="h-11 px-6 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/40 bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] dark:shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Show All {filteredClubs.length} Clubs
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty search state - STRICTLY NO EMOJIS */
        <div className={`rounded-[10px] border-[3px] border-dashed p-12 text-center ${
          isLight
            ? "bg-white border-[#0a0a0a] text-[#0a0a0a]"
            : "bg-[#140e22] border-white/30 text-white"
        }`}>
          <AlertCircle size={32} className="mx-auto mb-3 text-[#fb923c]" />
          <h3 className="font-display text-base uppercase font-bold m-0">
            No matching clubs found
          </h3>
          <p className={`mt-1 font-mono text-xs ${
            isLight ? "text-[#575757]" : "text-neutral-400"
          }`}>
            Try adjusting your search query or switching categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className={`mt-4 px-4 py-2 rounded-[8px] border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isLight
                ? "border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-[#f2f2f0]"
                : "border-white/30 bg-[#1e152e] text-white shadow-[2px_2px_0px_#000000]"
            }`}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
