// Club detail page at /activity-center/clubs/[clubId].
// Neo-Brutalist Design Law layout:
// - Back button pill with hard offset shadow
// - Ticket header card with category gradient badge, poster shortName, follow toggle
// - Meeting frequency and member/follower stats
// - "Post an Update" card with clean textarea and brand gradient submit button
// - Club Feed of posts with author initial badges and timestamps
// - High-contrast text across both light and dark mode

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  ExternalLink,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { auth } from "@/backend/firebase/start-firebase";
import {
  fetchClubById,
  fetchClubPosts,
  createClubPost,
  fetchUserFollowedClubIds,
  toggleFollowClubInFirestore,
} from "@/backend/firebase/clubs";
import type { Club, ClubPost } from "@/types/clubs";
import { useActivityCenter } from "@/ui/activity-center/ActivityCenterContext";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

function getCategoryGradient(category: string): string {
  switch (category?.toLowerCase()) {
    case "academic":
      return "bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] text-[#0a0a0a]";
    case "competitive":
      return "bg-gradient-to-br from-[#a78bfa] to-[#e879f9] text-[#0a0a0a]";
    case "social":
      return "bg-gradient-to-br from-[#fda4af] to-[#fb7185] text-[#0a0a0a]";
    case "professional":
    default:
      return "bg-gradient-to-br from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a]";
  }
}

export default function ClubDetailClient() {
  const routeParams = useParams();
  const clubId = (routeParams?.clubId as string) || "";
  const { showToast } = useActivityCenter();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [club, setClub] = useState<Club | null>(null);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load club data, followed status, and posts
  useEffect(() => {
    let isMounted = true;
    if (!clubId) {
      setLoading(false);
      return;
    }

    async function loadClubData() {
      try {
        const clubData = await fetchClubById(clubId);
        if (isMounted) setClub(clubData);

        const clubPosts = await fetchClubPosts(clubId);
        if (isMounted) setPosts(clubPosts);

        const currentUser = auth.currentUser;
        if (currentUser && isMounted) {
          const followedIds = await fetchUserFollowedClubIds(currentUser.uid);
          setIsFollowed(followedIds.includes(clubId));
        }
      } catch (err) {
        console.error("Error loading club detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadClubData();

    return () => {
      isMounted = false;
    };
  }, [clubId]);

  // Handle follow / unfollow toggle
  const handleToggleFollow = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("Please sign in to follow this club");
      return;
    }

    setIsTogglingFollow(true);
    const prevStatus = isFollowed;
    setIsFollowed(!prevStatus);
    setClub((prev) =>
      prev
        ? {
            ...prev,
            followerCount: prevStatus
              ? Math.max(0, prev.followerCount - 1)
              : prev.followerCount + 1,
          }
        : null
    );

    try {
      const nowFollowed = await toggleFollowClubInFirestore(
        currentUser.uid,
        clubId,
        prevStatus
      );
      setIsFollowed(nowFollowed);
      showToast(nowFollowed ? `Now following ${club?.shortName || "Club"}` : `Unfollowed ${club?.shortName || "Club"}`);
    } catch {
      setIsFollowed(prevStatus);
      showToast("Failed to update follow status");
    } finally {
      setIsTogglingFollow(false);
    }
  };

  // Handle submitting a post update
  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("Please sign in to post an update");
      return;
    }

    if (!newPostText.trim()) return;

    setIsSubmitting(true);
    const authorName =
      currentUser.displayName ||
      currentUser.email?.split("@")[0] ||
      "CECS Student";

    try {
      const created = await createClubPost(
        clubId,
        currentUser.uid,
        authorName,
        newPostText.trim(),
        currentUser.email || undefined,
        currentUser.photoURL || undefined
      );

      if (created) {
        setPosts((prev) => [created, ...prev]);
        setNewPostText("");
        showToast("Update posted to club feed");
      } else {
        showToast("Could not post update");
      }
    } catch {
      showToast("Error posting update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs uppercase tracking-wider text-[#575757] dark:text-neutral-400">
        Loading club details…
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-[12px] border-[3px] border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120c1c] text-center shadow-[6px_6px_0px_#0a0a0a] dark:shadow-[6px_6px_0px_#000000]">
        <h2 className="font-display uppercase font-normal text-2xl text-[#0a0a0a] dark:text-white m-0">
          Club not found
        </h2>
        <p className="mt-2 font-mono text-xs text-[#575757] dark:text-neutral-400">
          The requested club does not exist or may have been relocated.
        </p>
        <Link
          href="/activity-center/clubs"
          className="mt-6 inline-flex items-center gap-2 rounded-[8px] border-[2.5px] border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] px-4 py-2 font-mono text-xs font-bold uppercase text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
        >
          <ArrowLeft size={14} />
          <span>Back to Clubs</span>
        </Link>
      </div>
    );
  }

  const badgeGradient = getCategoryGradient(club.category);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* ── Top Back Button ── */}
      <div>
        <Link
          href="/activity-center/clubs"
          className="inline-flex items-center gap-2 rounded-[8px] border-[2.5px] border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#181124] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-white shadow-[3px_3px_0px_#0a0a0a] dark:shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Clubs Directory</span>
        </Link>
      </div>

      {/* ── Main Club Header Card ── */}
      <article
        className={`rounded-[12px] overflow-hidden border-[3px] transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[7px_7px_0px_#0a0a0a]"
            : "bg-[#120c1c] border-2 border-white/30 shadow-[8px_8px_0px_#000000]"
        }`}
      >
        {/* Top Gradient Banner with Category and Poster Short Name */}
        <div
          className={`p-6 sm:p-8 flex flex-col justify-between gap-4 border-b-[3px] border-[#0a0a0a] dark:border-white/20 ${badgeGradient}`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-[#0a0a0a] bg-white font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]">
              {club.category}
            </span>

            <button
              type="button"
              disabled={isTogglingFollow}
              onClick={handleToggleFollow}
              className={`inline-flex items-center justify-center gap-2 rounded-[8px] border-[2.5px] border-[#0a0a0a] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 select-none ${
                isFollowed
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-white text-[#0a0a0a] hover:bg-neutral-100"
              }`}
            >
              <Bookmark size={15} className={isFollowed ? "fill-current" : ""} />
              <span>{isFollowed ? "Following" : "Follow Club"}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {(club.logoUrl || club.id) && (
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[12px] border-[2.5px] border-[#0a0a0a] bg-white p-2 shadow-[3px_3px_0px_#0a0a0a] overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={club.logoUrl || `/clubs/logos/${club.id}.png`}
                  alt={`${club.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Hide container if image fails to load
                    (e.currentTarget.parentElement as HTMLElement)?.style.setProperty("display", "none");
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="font-display uppercase font-normal text-4xl sm:text-5xl text-[#0a0a0a] leading-[0.88] tracking-tight m-0">
                {club.shortName}
              </h1>
              {club.shortName !== club.name && (
                <p className="font-body text-base font-semibold text-[#0a0a0a]/80 mt-2 m-0">
                  {club.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body Details: Description, Meetings, Counts, Site */}
        <div className="p-6 sm:p-8 space-y-4">
          <p className="font-body text-base leading-[1.6] text-[#262626] dark:text-neutral-200 m-0">
            {club.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {club.meetingFrequency && (
              <div className="inline-flex items-center gap-2 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#f2f2f0] dark:bg-[#1a1328] px-3.5 py-2 font-mono text-xs font-medium text-[#0a0a0a] dark:text-white shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000]">
                <Calendar size={14} className="text-[#fb923c]" />
                <span>
                  <strong className="font-bold">Meetings:</strong> {club.meetingFrequency}
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#f2f2f0] dark:bg-[#1a1328] px-3.5 py-2 font-mono text-xs text-[#0a0a0a] dark:text-white shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000]">
              <span className="inline-flex items-center gap-1.5 font-bold">
                <Users size={14} />
                {club.memberCount} members
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5 font-bold">
                <Bookmark size={14} />
                {club.followerCount} followers
              </span>
            </div>

            {club.link && (
              <a
                href={club.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#1f1630] px-3.5 py-2 font-mono text-xs font-bold text-[#0a0a0a] dark:text-white shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:underline"
              >
                <span>View Official Page</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </article>

      {/* ── Post an Update Form Card ── */}
      <section
        aria-label="Post an update"
        className={`rounded-[12px] p-6 sm:p-7 border-[3px] transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a]"
            : "bg-[#120c1c] border-2 border-white/30 shadow-[6px_6px_0px_#000000]"
        }`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <MessageSquare size={18} className="text-[#fb923c]" />
          <h2 className="font-display uppercase font-normal text-xl leading-none text-[#0a0a0a] dark:text-white m-0">
            Post an Update
          </h2>
        </div>
        <p className="font-mono text-xs text-[#575757] dark:text-neutral-400 mb-4 m-0">
          Share meeting announcements, room changes, hackathon teams, or workshops with followers.
        </p>

        <form onSubmit={handlePostUpdate} className="space-y-3">
          <textarea
            rows={3}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's happening in this club? Post a meeting time, agenda, or announcement..."
            className="w-full rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#181124] p-3 text-sm font-body text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#fb923c] shadow-[2px_2px_0px_#0a0a0a]"
            maxLength={1000}
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#575757] dark:text-neutral-400">
              {newPostText.length}/1000
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !newPostText.trim()}
              className="inline-flex items-center gap-2 rounded-[8px] border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={13} />
              <span>{isSubmitting ? "Posting…" : "Post Update"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* ── Feed Section ── */}
      <section aria-label="Club feed updates" className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] dark:border-white/20 pb-2">
          <h2 className="font-display uppercase font-normal text-xl text-[#0a0a0a] dark:text-white m-0">
            Club Feed
          </h2>
          <span className="font-mono text-xs font-bold text-[#575757] dark:text-neutral-400">
            {posts.length} {posts.length === 1 ? "update" : "updates"}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`rounded-[10px] p-5 border-2 border-[#0a0a0a] dark:border-white/30 transition-all ${
                  isLight
                    ? "bg-white shadow-[4px_4px_0px_#0a0a0a]"
                    : "bg-[#140e22] shadow-[4px_4px_0px_#000000]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#e3e3df] dark:border-white/10 pb-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] font-display text-xs text-[#0a0a0a]">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0a0a0a] dark:text-white">
                      {post.authorName}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[#575757] dark:text-neutral-400">
                    {post.timestamp instanceof Date
                      ? post.timestamp.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : typeof post.timestamp === "string"
                      ? post.timestamp
                      : "Recently"}
                  </span>
                </div>

                <p className="font-body text-sm sm:text-[15px] leading-relaxed text-[#262626] dark:text-neutral-200 whitespace-pre-wrap m-0">
                  {post.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-[10px] p-12 text-center border-2 border-dashed ${
              isLight
                ? "bg-white/60 border-[#0a0a0a]"
                : "bg-[#140e22]/60 border-white/25 text-white"
            }`}
          >
            <MessageSquare size={32} className="mx-auto mb-3 text-[#575757] dark:text-neutral-400" />
            <h3 className="font-display uppercase font-normal text-lg text-[#0a0a0a] dark:text-white m-0">
              No updates yet — be the first to post
            </h3>
            <p className="mt-1 font-body text-xs text-[#575757] dark:text-neutral-400 m-0">
              Use the input above to share the first announcement or meeting note with the club.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
