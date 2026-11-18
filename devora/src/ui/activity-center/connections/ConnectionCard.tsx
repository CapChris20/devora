// Individual accepted connection card.
// Shows student avatar, name, major, academic year, and a Message button that links to chat.

"use client";

// ===== IMPORTS =====

import { useActivityCenter } from "../ActivityCenterContext";
import Avatar from "../shared/Avatar";

// ===== TYPES =====

type ConnectionCardProps = {
  uid: string;
};

// ===== MAIN COMPONENT =====

export default function ConnectionCard({ uid }: ConnectionCardProps) {
  const { people, openChatWithUser } = useActivityCenter();
  const profile = people[uid];

  if (!profile) return null;

  return (
    <article
      data-person={uid}
      className="card lift flex items-center gap-3.5 p-4 min-w-0 bg-nb-white border-nb border-nb-ink rounded-nb shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg"
    >
      <Avatar uid={uid} size="lg" />

      <div className="flex-1 min-w-0">
        <p className="m-0 text-[17px] font-bold text-nb-ink truncate">
          {profile.name}
        </p>
        <p className="mt-0.5 mb-0 text-sm text-nb-muted truncate">
          {profile.major}
        </p>
        <p className="mt-0.5 mb-0 font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
          {profile.year}
        </p>
      </div>

      <button
        type="button"
        onClick={() => openChatWithUser(uid)}
        className="flex-shrink-0 min-h-[44px] px-5 rounded-[9px] border-2 border-nb-ink bg-nb-white text-nb-ink font-mono text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
      >
        Message
      </button>
    </article>
  );
}
