// Keep discoveryProfiles/{uid} in sync with the owner-only users/{uid} document.
// Flow: after a profile/settings save → build a public-safe projection → write or delete it.
// Discovery reads ONLY this collection so classmates never download email/religion/signupReason.
// WHY: Firestore cannot strip fields on read; a separate public doc is the real fix.

// ===== IMPORTS =====

import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { sanitizeSocialProfileUrl } from "./safe-http-url";
import { db } from "./start-firebase";
import type { UserLinks, UserPreferences, UserProfile } from "./user-profile";

// ===== NAMED CONSTANTS =====

const DISCOVERY_PROFILES_COLLECTION = "discoveryProfiles";
const MERGE_EXISTING_DOCUMENT_FIELDS = { merge: true } as const;

// Local copy so this file does not import runtime values from user-profile (avoids a cycle).
const DEFAULT_DISCOVERY_PREFERENCES: UserPreferences = {
  showSkills: true,
  showInterests: true,
  showClassYear: true,
  notifyMessages: true,
  notifyConnectionRequests: true,
  notifyProfileViews: false,
  notifyEventInvites: true,
  notifyWeeklyDigest: true,
  allowMessagesFrom: "everyone",
  showOnlineStatus: true,
  showReadReceipts: true,
};

// ===== TYPES =====

// Only fields classmates are allowed to download for Discovery cards / peek.
export type DiscoveryProfileDocument = {
  firstName: string;
  lastName: string;
  displayName: string;
  major: string;
  classRank: string;
  careerNiche: string[];
  casualInterests: string[];
  aboutYou: string[];
  bio: string;
  photoURL: string;
  links: UserLinks;
  school: string;
  preferences: UserPreferences;
  isPublic: boolean;
  isDeactivated: boolean;
  onboardingComplete: boolean;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

// ===== HELPER FUNCTIONS =====

function sanitizeUserLinks(links: UserLinks | undefined): UserLinks {
  return {
    github: sanitizeSocialProfileUrl(links?.github, "github"),
    linkedin: sanitizeSocialProfileUrl(links?.linkedin, "linkedin"),
    instagram: sanitizeSocialProfileUrl(links?.instagram, "instagram"),
  };
}

function resolvePreferencesForDiscovery(
  savedPreferences?: Partial<UserPreferences> | null
): UserPreferences {
  return {
    ...DEFAULT_DISCOVERY_PREFERENCES,
    ...savedPreferences,
  };
}

function shouldPublishOnDiscovery(profile: UserProfile): boolean {
  return (
    profile.isPublic === true &&
    profile.onboardingComplete === true &&
    profile.isDeactivated !== true
  );
}

function buildDiscoveryProfileDocument(profile: UserProfile): DiscoveryProfileDocument {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    displayName: profile.displayName ?? "",
    major: profile.major ?? "",
    classRank: profile.classRank ?? "",
    careerNiche: profile.careerNiche ?? [],
    casualInterests: profile.casualInterests ?? [],
    aboutYou: profile.aboutYou ?? [],
    bio: profile.bio ?? "",
    photoURL: profile.photoURL ?? "",
    links: sanitizeUserLinks(profile.links),
    school: profile.school ?? "",
    preferences: resolvePreferencesForDiscovery(profile.preferences),
    isPublic: profile.isPublic === true,
    isDeactivated: profile.isDeactivated === true,
    onboardingComplete: profile.onboardingComplete === true,
    updatedAt: serverTimestamp(),
  };
}

function readDiscoveryProfileRef(userId: string) {
  return doc(db, DISCOVERY_PROFILES_COLLECTION, userId);
}

// ===== MAIN FUNCTIONS =====

/**
 * Write or remove the public Discovery projection for one student.
 * Call after any save that changes visibility or public card fields.
 * @param userId - Firebase Auth user id
 * @param profile - Latest full owner profile (may include private fields in memory)
 * @returns Resolves when the projection is synced
 */
export async function syncDiscoveryProfileProjection(
  userId: string,
  profile: UserProfile
): Promise<void> {
  const discoveryProfileRef = readDiscoveryProfileRef(userId);

  if (!shouldPublishOnDiscovery(profile)) {
    // vocab: deleteDoc = remove the public card so classmates stop seeing this student
    try {
      await deleteDoc(discoveryProfileRef);
    } catch {
      // Missing projection is fine — nothing to remove.
    }
    return;
  }

  await setDoc(
    discoveryProfileRef,
    buildDiscoveryProfileDocument(profile),
    MERGE_EXISTING_DOCUMENT_FIELDS
  );
}

/**
 * Delete the Discovery projection during account wipe.
 * @param userId - Firebase Auth user id
 * @returns Resolves when the public doc is gone (or was already missing)
 */
export async function deleteDiscoveryProfileProjection(userId: string): Promise<void> {
  try {
    await deleteDoc(readDiscoveryProfileRef(userId));
  } catch {
    // Already gone.
  }
}
