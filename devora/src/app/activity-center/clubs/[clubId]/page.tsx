// Club detail page at /activity-center/clubs/[clubId].
// Displays the club info, one-click follow toggle, post input at top, and full post feed.
// Empty post feed state says: "No updates yet — be the first to post" (STRICTLY NO EMOJIS).

"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
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

interface ClubDetailPageProps {
  params: Promise<{
    clubId: string;
  }>;
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const resolvedParams = use(params);
  const clubId = resolvedParams.clubId;
  const { showToast } = useActivityCenter();

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
      <div className="py-20 text-center font-nb-mono text-xs uppercase tracking-wider text-nb-muted">
        Loading club details…
      </div>
    );
  }

  if (!club) {
    return (
      <div className="rounded-xl border-2 border-nb-ink bg-nb-white p-12 text-center shadow-nb">
        <h2 className="font-nb-display text-lg font-bold text-nb-ink">Club not found</h2>
        <p className="mt-2 font-nb-mono text-xs text-nb-muted">
          The requested club does not exist or may have been moved.
        </p>
        <Link
          href="/activity-center/clubs"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-nb-ink bg-nb-pink px-4 py-2 font-nb-mono text-xs font-bold uppercase text-nb-ink shadow-nb-sm"
        >
          <ArrowLeft size={14} />
          <span>Back to Clubs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/activity-center/clubs"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-nb-ink bg-nb-white px-3.5 py-1.5 font-nb-mono text-xs font-bold uppercase text-nb-ink shadow-nb-sm hover:-translate-x-0.5 hover:shadow-nb transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Clubs Directory</span>
        </Link>
      </div>

      {/* Main Club Header Banner Card */}
      <div className="rounded-xl border-2 border-nb-ink bg-nb-white p-6 sm:p-8 shadow-nb">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b-2 border-nb-ink pb-6">
          <div>
            <span className="inline-block rounded-md border-2 border-nb-ink bg-nb-pink/15 px-3 py-0.5 font-nb-mono text-xs font-bold uppercase tracking-wider text-nb-ink mb-2">
              {club.category}
            </span>
            <h1 className="font-nb-display text-2xl sm:text-3xl font-extrabold text-nb-ink">
              {club.name}
            </h1>
            {club.shortName !== club.name && (
              <p className="font-nb-mono text-sm font-bold text-nb-pink mt-1">
                ({club.shortName})
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={isTogglingFollow}
            onClick={handleToggleFollow}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 border-nb-ink px-5 py-2.5 font-nb-mono text-xs font-bold uppercase tracking-wider transition-all self-start ${
              isFollowed
                ? "bg-nb-ink text-nb-white hover:bg-neutral-800"
                : "bg-nb-pink text-nb-ink hover:bg-pink-300 shadow-nb-sm"
            } ${isTogglingFollow ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Bookmark size={15} className={isFollowed ? "fill-current" : ""} />
            <span>{isFollowed ? "Following" : "Follow Club"}</span>
          </button>
        </div>

        {/* Club Details Grid */}
        <div className="mt-6 space-y-4">
          <p className="text-sm sm:text-base leading-relaxed text-neutral-700">
            {club.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 rounded-lg border border-nb-ink/30 bg-neutral-50 px-3.5 py-2 text-xs font-nb-mono text-neutral-800">
              <Calendar size={14} className="text-nb-pink" />
              <span>
                <strong>Meetings:</strong> {club.meetingFrequency}
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-nb-ink/30 bg-neutral-50 px-3.5 py-2 text-xs font-nb-mono text-neutral-800">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-nb-ink" />
                <strong>{club.memberCount}</strong> Devora members
              </span>
              <span className="flex items-center gap-1.5">
                <Bookmark size={14} className="text-nb-pink" />
                <strong>{club.followerCount}</strong> followers
              </span>
            </div>

            {club.link && (
              <a
                href={club.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-nb-ink bg-nb-white px-3.5 py-2 text-xs font-nb-mono font-bold text-nb-ink hover:bg-neutral-100 hover:underline shadow-nb-xs"
              >
                <span>VictorsLink / Portal</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Post Update Form Card */}
      <div className="rounded-xl border-2 border-nb-ink bg-nb-white p-6 shadow-nb">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-nb-pink" />
          <h2 className="font-nb-display text-base font-bold uppercase tracking-wide text-nb-ink">
            Post an Update
          </h2>
        </div>
        <p className="font-nb-mono text-xs text-nb-muted mb-4">
          Share meeting times, upcoming hackathons, recruitment announcements, or group discussions with the club feed.
        </p>

        <form onSubmit={handlePostUpdate} className="space-y-4">
          <textarea
            rows={3}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's happening in this club? Post a meeting time, announcement, or call for members..."
            className="w-full rounded-lg border-2 border-nb-ink bg-neutral-50 p-3 text-sm font-nb-body text-nb-ink placeholder:text-neutral-400 focus:bg-white focus:border-nb-pink focus:outline-none"
            maxLength={1000}
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between">
            <span className="font-nb-mono text-[11px] text-nb-muted">
              {newPostText.length}/1000 characters
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !newPostText.trim()}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-nb-ink bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] px-5 py-2 font-nb-mono text-xs font-extrabold uppercase text-nb-ink shadow-nb-sm hover:-translate-y-0.5 hover:shadow-nb active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={13} />
              <span>{isSubmitting ? "Posting…" : "Post Update"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Post Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-nb-ink pb-2">
          <h2 className="font-nb-display text-lg font-bold uppercase text-nb-ink">
            Club Feed
          </h2>
          <span className="font-nb-mono text-xs font-bold text-nb-muted">
            {posts.length} {posts.length === 1 ? "update" : "updates"}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border-2 border-nb-ink bg-nb-white p-5 shadow-nb"
              >
                <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-nb-ink bg-gradient-to-br from-nb-pink to-nb-orange font-nb-mono text-xs font-bold text-nb-ink">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-nb-mono text-xs font-bold text-nb-ink">
                      {post.authorName}
                    </span>
                  </div>

                  <span className="font-nb-mono text-[11px] text-nb-muted">
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

                <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
                  {post.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Empty feed state per requirement - STRICTLY NO EMOJIS */
          <div className="rounded-xl border-2 border-dashed border-nb-ink bg-nb-white/50 p-12 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-nb-muted" />
            <h3 className="font-nb-display text-base font-bold text-nb-ink">
              No updates yet — be the first to post
            </h3>
            <p className="mt-1 font-nb-mono text-xs text-nb-muted">
              Use the input above to share the first announcement or meeting note with the club.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

