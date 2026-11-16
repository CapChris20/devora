// Avatar component for Devora Activity Center.
// Displays neo-brutalist square-rounded initials avatar with ink borders and gradient tones.
// Handles size variants (xs for stacks, md for cards, lg for profiles) and user tones.

import { PEOPLE_ORDER, INITIAL_PEOPLE } from "../placeholder-data";

// ===== TYPES =====

type AvatarSize = "xs" | "sm" | "md" | "lg";

type AvatarProps = {
  uid?: string;
  name?: string;
  size?: AvatarSize;
  tone?: "bg-nb-brand" | "bg-nb-orchid" | "bg-nb-sky" | "bg-nb-blush";
  isMe?: boolean;
  className?: string;
  "data-me"?: boolean;
};

// ===== HELPER FUNCTIONS =====

function computeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function resolveTone(uid?: string): "bg-nb-brand" | "bg-nb-orchid" | "bg-nb-sky" | "bg-nb-blush" {
  if (!uid) return "bg-nb-brand";
  const index = PEOPLE_ORDER.indexOf(uid);
  const toneIndex = (index < 0 ? 0 : index) % 4;
  const tones: Array<"bg-nb-brand" | "bg-nb-orchid" | "bg-nb-sky" | "bg-nb-blush"> = [
    "bg-nb-brand",
    "bg-nb-orchid",
    "bg-nb-sky",
    "bg-nb-blush",
  ];
  return tones[toneIndex];
}

// ===== MAIN COMPONENT =====

export default function Avatar({
  uid,
  name,
  size = "md",
  tone,
  isMe = false,
  className = "",
  "data-me": dataMe,
}: AvatarProps) {
  const resolvedTone = tone || resolveTone(uid);
  const resolvedName = name || (uid && INITIAL_PEOPLE[uid] ? INITIAL_PEOPLE[uid].name : "");
  const letters = isMe ? "YU" : computeInitials(resolvedName);

  // Size specific styling
  const sizeClasses: Record<AvatarSize, string> = {
    xs: "w-[30px] h-[30px] text-[11px] rounded-[8px] -ml-2 first:ml-0 shadow-[0_0_0_2px_#FFFFFF]",
    sm: "w-9 h-9 text-xs rounded-nb",
    md: "w-[46px] h-[46px] text-[15px] rounded-nb",
    lg: "w-[58px] h-[58px] text-[17px] rounded-nb",
  };

  return (
    <span
      aria-hidden="true"
      data-me={dataMe ? "" : undefined}
      className={`inline-grid place-items-center flex-shrink-0 border-2 border-nb-ink font-bold text-nb-ink select-none ${resolvedTone} ${sizeClasses[size]} ${className}`}
    >
      {letters}
    </span>
  );
}
