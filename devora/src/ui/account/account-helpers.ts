// Helpers that turn raw Firestore profile data into display-ready text.
// Initials, dates, tags, bio snippets, and profile strength score.
// Used by AccountProfileView, AccountDiscoveryPreview, and AccountProfileEditor.

import type { Timestamp } from "firebase/firestore";

import type { UserProfile } from "@/backend/firebase";
import { PERSONAL_INTERESTS } from "@/ui/auth/onboarding-options";

// Fast lookup of every known interest pill (vs custom typed ones).
// vocab: Set = collection that answers "is this string in the list?" quickly
const knownInterestSet = new Set<string>(PERSONAL_INTERESTS);

// Two-letter initials from first/last name or display name.
// vocab: Pick<UserProfile, ...> = TypeScript — only these fields are required from the profile
export function getInitials(
  profile: Pick<UserProfile, "firstName" | "lastName" | "displayName">
): string {
  // vocab/symbol: ?. = optional chaining; ?? = if missing, use the next fallback
  const first = profile.firstName?.trim()?.[0] ?? profile.displayName?.trim()?.[0] ?? "?";
  const last = profile.lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

// "Jan 2025" style join date from Firestore timestamp.
// vocab: Timestamp = Firestore date type with a .toDate() method
export function formatJoinedDate(createdAt?: Timestamp): string {
  // Missing or weird timestamp — show a dash instead of crashing.
  if (!createdAt || typeof createdAt.toDate !== "function") {
    return "—";
  }

  // vocab: toLocaleDateString = format a Date using the browser's locale rules
  // Manipulate here: change month/year options if you want a longer date string
  return createdAt.toDate().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// Split saved interests into known pills vs custom comma-typed ones.
// Used by AccountProfileEditor so pills and the free-text field stay in sync.
export function splitCasualInterests(interests: string[] = []) {
  const known: string[] = [];
  const custom: string[] = [];

  for (const item of interests) {
    // Known = matches a pill from onboarding; custom = typed by the student.
    // vocab: knownInterestSet.has = true if this string is in PERSONAL_INTERESTS
    if (knownInterestSet.has(item)) {
      known.push(item);
    } else {
      custom.push(item);
    }
  }

  // customText is what the "add your own" input shows (comma-joined)
  return { known, customText: custom.join(", ") };
}

// Short hostname for social link display (e.g. github.com).
export function formatLinkLabel(url: string): string {
  try {
    // vocab: new URL(url) = parse a full URL; throws if the string isn't valid
    const parsed = new URL(url);
    // vocab/symbol: .replace(/^www\./, "") — strip leading "www." from hostname
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    // Not a valid URL — just show whatever they typed.
    return url;
  }
}

// Truncate bio to ~80 chars — matches Discovery Grid card snippet.
// Manipulate here: change max (or the call site) if grid cards should show more/less
export function truncateBio(bio: string, max = 80): string {
  const trimmed = bio.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  // Cut at max, trim trailing space, then add an ellipsis.
  // vocab: slice(0, max) = take characters from index 0 up to (not including) max
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

// Merge careerNiche + casualInterests, deduped, capped for grid card preview.
export function getDiscoveryTags(profile: UserProfile, max = 4): string[] {
  // vocab/symbol: ?? [] = if the field is missing, use an empty list
  const tags = [...(profile.careerNiche ?? []), ...(profile.casualInterests ?? [])];
  // vocab/symbol: new Set — removes duplicates; Array.from turns it back into a list
  // vocab: slice(0, max) = keep only the first `max` tags for the card
  // Manipulate here: raise max to show more chips on the Discovery preview card
  return Array.from(new Set(tags)).slice(0, max);
}

// One-line subtitle like "Computer Science · Junior".
export function getProfileSubtitle(profile: UserProfile): string {
  // vocab/symbol: filter(Boolean) = drop empty / falsy parts before joining
  const parts = [profile.major, profile.classRank].filter(Boolean);
  return parts.join(" · ") || profile.school;
}

// True when email is @umich.edu or @umd.umich.edu.
// Display-only "Verified" badge helper — real auth gate is isUmichEmail in the backend.
export function isUmichVerified(email?: string): boolean {
  if (!email) {
    return false;
  }
  const lower = email.toLowerCase();
  return lower.endsWith("@umich.edu") || lower.endsWith("@umd.umich.edu");
}

// Score 0–100 based on how many profile sections are filled in.
// Drives the "Profile strength" meter on AccountProfileView.
// Manipulate here: add/remove rows in `checks` to change what counts toward 100%
export function getProfileCompleteness(profile: UserProfile): {
  score: number;
  missing: string[];
} {
  // Each row is [isFilled, labelShownWhenMissing].
  const checks: Array<[boolean, string]> = [
    [Boolean(profile.photoURL), "Profile photo"],
    [Boolean(profile.bio?.trim()), "Bio"],
    [(profile.careerNiche?.length ?? 0) > 0, "Career focus"],
    [(profile.casualInterests?.length ?? 0) > 0, "Interests"],
    [Boolean(profile.links?.github || profile.links?.linkedin), "GitHub or LinkedIn"],
    [Boolean(profile.hasExperience && profile.experienceDetails?.trim()), "Experience"],
  ];

  // Count how many checks passed; collect labels for the ones that failed.
  const done = checks.filter(([ok]) => ok).length;
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);

  return {
    // vocab: Math.round = nearest whole percent
    score: Math.round((done / checks.length) * 100),
    missing,
  };
}
