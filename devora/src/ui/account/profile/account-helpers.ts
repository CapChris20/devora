// Helpers that turn a raw Firestore profile into text the account page can show.
// Initials, dates, tags, bio snippets, and the profile strength score.
// Used by AccountProfileView, AccountDiscoveryPreview, and AccountProfileEditor.

// ===== IMPORTS =====

import type { Timestamp } from "firebase/firestore";

import type { UserProfile } from "@/backend/firebase";
import { PERSONAL_INTERESTS } from "@/ui/account/onboarding/onboarding-options";

// ===== NAMED CONSTANTS =====

const MISSING_JOINED_DATE_LABEL = "—";
const JOINED_DATE_LOCALE = "en-US";
const MISSING_INITIAL = "?";
const BIO_PREVIEW_CHARACTER_LIMIT = 80;
const DISCOVERY_TAG_LIMIT = 4;
const PROFILE_SCORE_MAX_PERCENT = 100;
const DEARBORN_EMAIL_SUFFIX = "@umd.umich.edu";
const ANN_ARBOR_EMAIL_SUFFIX = "@umich.edu";

// Fast lookup of every known interest pill, versus interests the student typed themselves.
// vocab: Set = a collection that answers "is this string in the list?" quickly
const knownInterestSet = new Set<string>(PERSONAL_INTERESTS);

// ===== HELPER FUNCTIONS =====

function isKnownInterest(interest: string): boolean {
  return knownInterestSet.has(interest);
}

// ===== MAIN FUNCTIONS =====

/**
 * Two-letter initials from the first and last name, or the display name.
 * @param profile - Needs firstName, lastName, and displayName
 * @returns Uppercase initials, or "?" when no name exists
 */
export function getInitials(
  profile: Pick<UserProfile, "firstName" | "lastName" | "displayName">
): string {
  // vocab: Pick = TypeScript helper that only requires these fields from the profile
  // vocab: ?. = don't crash if the name is missing. ?? = use the next fallback.
  const firstInitial =
    profile.firstName?.trim()?.[0] ?? profile.displayName?.trim()?.[0] ?? MISSING_INITIAL;
  const lastInitial = profile.lastName?.trim()?.[0] ?? "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

/**
 * Format a Firestore join date as "Jan 2025".
 * @param createdAt - Firestore timestamp from the profile, if it exists
 * @returns A short month-and-year string, or an em dash when the date is missing
 */
export function formatJoinedDate(createdAt?: Timestamp): string {
  // vocab: Timestamp = Firestore date type with a .toDate() method
  const hasRealTimestamp = Boolean(createdAt) && typeof createdAt?.toDate === "function";
  if (!createdAt || !hasRealTimestamp) {
    return MISSING_JOINED_DATE_LABEL;
  }

  // vocab: toLocaleDateString = format a Date using the browser's locale rules
  // Manipulate here: change month/year if you want a longer date
  return createdAt.toDate().toLocaleDateString(JOINED_DATE_LOCALE, {
    month: "short",
    year: "numeric",
  });
}

/**
 * Split saved interests into known pills versus custom typed ones.
 * The account editor uses this so the pills and the free-text field stay in sync.
 * @param interests - Saved casualInterests, or an empty list
 * @returns Known pill labels, plus the custom ones joined into one comma-separated string
 */
export function splitCasualInterests(interests: string[] = []) {
  const knownInterests: string[] = [];
  const customInterests: string[] = [];

  for (const interest of interests) {
    if (isKnownInterest(interest)) {
      knownInterests.push(interest);
    } else {
      customInterests.push(interest);
    }
  }

  return { known: knownInterests, customText: customInterests.join(", ") };
}

/**
 * Short hostname for a social link, such as github.com.
 * @param url - Full link from the profile
 * @returns The hostname without www, or the original string if it is not a valid URL
 */
export function formatLinkLabel(url: string): string {
  try {
    // vocab: new URL(url) = parse a full URL. It throws when the string is not valid.
    const parsedUrl = new URL(url);
    // vocab: .replace(/^www\./, "") = strip a leading "www."
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Cut a bio down to the Discovery card length and add an ellipsis.
 * @param bio - Full bio text
 * @param maximumCharacterCount - How many characters to keep. Defaults to the grid card length.
 * @returns The original bio, or a shortened bio ending in …
 */
export function truncateBio(
  bio: string,
  maximumCharacterCount = BIO_PREVIEW_CHARACTER_LIMIT
): string {
  const trimmedBio = bio.trim();
  if (trimmedBio.length <= maximumCharacterCount) {
    return trimmedBio;
  }

  // vocab: slice(0, maximumCharacterCount) = characters from the start up to that count
  return `${trimmedBio.slice(0, maximumCharacterCount).trimEnd()}…`;
}

/**
 * Career focus plus interests, with duplicates removed, capped for the grid card.
 * @param profile - Student profile
 * @param maximumTagCount - How many chips to keep. Defaults to the Discovery preview count.
 * @returns Unique tags, shortest list first
 */
export function getDiscoveryTags(
  profile: UserProfile,
  maximumTagCount = DISCOVERY_TAG_LIMIT
): string[] {
  // vocab: ?? [] = use an empty list when the field is missing
  const combinedTags = [...(profile.careerNiche ?? []), ...(profile.casualInterests ?? [])];
  // vocab: new Set = removes duplicates. Array.from turns it back into a list.
  // Manipulate here: raise maximumTagCount to show more chips on the preview card
  return Array.from(new Set(combinedTags)).slice(0, maximumTagCount);
}

/**
 * One-line subtitle such as "Computer Science · Junior".
 * @param profile - Student profile
 * @returns Major and class year, or the school name when both are empty
 */
export function getProfileSubtitle(profile: UserProfile): string {
  // vocab: filter(Boolean) = drop empty parts before joining
  const subtitleParts = [profile.major, profile.classRank].filter(Boolean);
  return subtitleParts.join(" · ") || profile.school;
}

/**
 * True when the email is @umich.edu or @umd.umich.edu.
 * This is only the "Verified" badge. The real sign-in gate is isUmichEmail in the backend.
 * @param emailAddress - Profile email, if one is saved
 * @returns True for a Michigan school email
 */
export function isUmichVerified(emailAddress?: string): boolean {
  if (!emailAddress) {
    return false;
  }

  const lowercaseEmail = emailAddress.toLowerCase();
  const isDearbornEmail = lowercaseEmail.endsWith(DEARBORN_EMAIL_SUFFIX);
  const isAnnArborEmail = lowercaseEmail.endsWith(ANN_ARBOR_EMAIL_SUFFIX);
  return isDearbornEmail || isAnnArborEmail;
}

/**
 * Score from 0 to 100 based on how many profile sections are filled in.
 * Drives the profile strength meter on the account page.
 * @param profile - Student profile
 * @returns The percent complete, plus labels for the sections that are still empty
 */
export function getProfileCompleteness(profile: UserProfile): {
  score: number;
  missing: string[];
} {
  // Each row is [is this section filled, label shown when it is missing].
  // Manipulate here: add or remove rows to change what counts toward 100%
  const profileSectionChecks: Array<[boolean, string]> = [
    [Boolean(profile.photoURL), "Profile photo"],
    [Boolean(profile.bio?.trim()), "Bio"],
    [(profile.careerNiche?.length ?? 0) > 0, "Career focus"],
    [(profile.casualInterests?.length ?? 0) > 0, "Interests"],
    [Boolean(profile.links?.github || profile.links?.linkedin), "GitHub or LinkedIn"],
    [Boolean(profile.hasExperience && profile.experienceDetails?.trim()), "Experience"],
  ];

  const filledSectionCount = profileSectionChecks.filter(([isFilled]) => isFilled).length;
  const missingSectionLabels = profileSectionChecks
    .filter(([isFilled]) => !isFilled)
    .map(([, sectionLabel]) => sectionLabel);

  return {
    // vocab: Math.round = nearest whole percent
    score: Math.round((filledSectionCount / profileSectionChecks.length) * PROFILE_SCORE_MAX_PERCENT),
    missing: missingSectionLabels,
  };
}
