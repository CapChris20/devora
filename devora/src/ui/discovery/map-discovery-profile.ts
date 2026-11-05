// Turn a Firestore users/{uid} document into the public card shape.
// Flow: drop private fields → honor Settings visibility toggles → assign a cycling accent.
// Used by DiscoveryGridContent. Mock students stay in mock-profiles.ts and are not loaded here.

// ===== IMPORTS =====

import {
  resolveUserPreferences,
  type PublicProfileRecord,
} from "@/backend/firebase";

import type { DiscoveryAccent, DiscoveryProfile } from "./mock-profiles";

// ===== NAMED CONSTANTS =====

// CSS still keys accents as cyan / purple / gold / pink. The stylesheet paints the shader pairs.
const ACCENT_CYCLE: DiscoveryAccent[] = ["cyan", "purple", "gold", "pink"];

// ===== HELPER FUNCTIONS =====

function readAccentForIndex(profileIndex: number): DiscoveryAccent {
  const accentIndex = profileIndex % ACCENT_CYCLE.length;
  return ACCENT_CYCLE[accentIndex];
}

function readDisplayName(record: PublicProfileRecord): string {
  const savedName = record.profile.displayName?.trim();
  if (savedName) {
    return savedName;
  }

  const firstName = record.profile.firstName?.trim() ?? "";
  const lastName = record.profile.lastName?.trim() ?? "";
  return `${firstName} ${lastName}`.trim();
}

function canClassmatesSeeThisProfile(record: PublicProfileRecord, viewerUserId: string): boolean {
  if (record.userId === viewerUserId) {
    return false;
  }
  if (record.profile.onboardingComplete !== true) {
    return false;
  }
  if (record.profile.isPublic !== true) {
    return false;
  }
  if (record.profile.isDeactivated === true) {
    return false;
  }
  return true;
}

function mapVisibleProfile(record: PublicProfileRecord, profileIndex: number): DiscoveryProfile {
  const preferences = resolveUserPreferences(record.profile.preferences);
  const major = record.profile.major ?? "";
  // Settings already promises these three can be hidden from classmates.
  const careerNiche = preferences.showSkills ? record.profile.careerNiche ?? [] : [];
  const casualInterests = preferences.showInterests ? record.profile.casualInterests ?? [] : [];
  const classRank = preferences.showClassYear ? record.profile.classRank ?? "" : "";

  return {
    id: record.userId,
    displayName: readDisplayName(record),
    majorShort: major,
    major,
    classRank,
    careerNiche,
    casualInterests,
    lookingFor: record.profile.aboutYou ?? [],
    // Clubs are not collected in onboarding yet, so the peek section stays empty.
    clubs: [],
    bio: record.profile.bio ?? "",
    links: record.profile.links ?? {},
    accent: readAccentForIndex(profileIndex),
    photoUrl: record.profile.photoURL,
  };
}

// ===== MAIN FUNCTION =====

/**
 * Build the browse list for the signed-in student.
 * Hides their own card, unfinished onboarding, private profiles, and deactivated accounts.
 * @param records - Public documents from listPublicProfiles
 * @param viewerUserId - Firebase uid of the person looking at the grid
 * @returns Card-ready profiles in query order, with accents assigned after the hide rules
 */
export function buildDiscoveryBrowseList(
  records: PublicProfileRecord[],
  viewerUserId: string
): DiscoveryProfile[] {
  const visibleRecords = records.filter((record) =>
    canClassmatesSeeThisProfile(record, viewerUserId)
  );

  return visibleRecords.map((record, profileIndex) => mapVisibleProfile(record, profileIndex));
}
