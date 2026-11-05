// Read and write student profiles in Firestore.
// Flow: signup/onboarding/account write owner-only users/{uid} → sync public discoveryProfiles/{uid}.
// Discovery list reads discoveryProfiles only so classmates never download private fields.
// Used by signup, onboarding, account, settings, and Discovery.

// ===== IMPORTS =====

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";

import {
  syncDiscoveryProfileProjection,
} from "./discovery-profile-sync";
import { sanitizeSocialProfileUrl } from "./safe-http-url";
import { db } from "./start-firebase";

// ===== NAMED CONSTANTS =====

const DEFAULT_SCHOOL_NAME = "University of Michigan-Dearborn";
const USERS_COLLECTION = "users";
const DISCOVERY_PROFILES_COLLECTION = "discoveryProfiles";
const PUBLIC_PROFILE_FIELD = "isPublic";
// One page for v1. Pagination is a later pass.
// Manipulate here: raise to show more classmates before a "load more" exists
const PUBLIC_PROFILE_PAGE_SIZE = 40;

// Merge so a partial save never wipes fields the caller did not send.
const MERGE_EXISTING_DOCUMENT_FIELDS = { merge: true } as const;

// ===== TYPES =====

export type UserLinks = {
  github?: string;
  linkedin?: string;
  instagram?: string;
};

// Who can DM this user once messaging exists.
export type MessagePolicy = "everyone" | "connections" | "none";

// Field names match documents already stored in Firestore.
// They stay showSkills / notifyMessages instead of isShowingSkills so old profiles still load.
export type UserPreferences = {
  showSkills: boolean;
  showInterests: boolean;
  showClassYear: boolean;
  notifyMessages: boolean;
  notifyConnectionRequests: boolean;
  notifyProfileViews: boolean;
  notifyEventInvites: boolean;
  notifyWeeklyDigest: boolean;
  allowMessagesFrom: MessagePolicy;
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
};

export type UserSettingsUpdate = {
  isPublic?: boolean;
  preferences?: UserPreferences;
};

// vocab: Timestamp = Firestore's date type, not a plain JavaScript Date
export type UserProfile = {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  classRank?: string;
  gender?: string;
  age?: string;
  major?: string;
  careerNiche?: string[];
  careerNicheOther?: string;
  hasExperience?: boolean;
  experienceDetails?: string;
  casualInterests?: string[];
  aboutYou?: string[];
  religion?: string;
  signupReason?: string[];
  bio?: string;
  photoURL?: string;
  links?: UserLinks;
  school: string;
  isPublic: boolean;
  isDeactivated?: boolean;
  preferences?: UserPreferences;
  onboardingComplete: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deactivatedAt?: Timestamp | null;
};

export type SignupNames = {
  firstName: string;
  lastName: string;
};

export type OnboardingPayload = {
  classRank: string;
  gender: string;
  age: string;
  major: string;
  careerNiche: string[];
  careerNicheOther?: string;
  hasExperience: boolean;
  experienceDetails?: string;
  casualInterests: string[];
  aboutYou: string[];
  religion?: string;
  signupReason: string[];
  bio: string;
  photoURL?: string;
  links: UserLinks;
};

// vocab: Pick = only these keys from UserProfile. Partial = each of those keys is optional.
export type AccountProfileUpdate = Partial<
  Pick<
    UserProfile,
    | "bio"
    | "major"
    | "classRank"
    | "gender"
    | "age"
    | "careerNiche"
    | "careerNicheOther"
    | "hasExperience"
    | "experienceDetails"
    | "casualInterests"
    | "aboutYou"
    | "photoURL"
    | "links"
  >
>;

export type PublicProfileRecord = {
  userId: string;
  profile: UserProfile;
};

type ProfileNameFields = {
  firstName: string;
  lastName: string;
  displayName: string;
};

// ===== HELPER FUNCTIONS =====

function sanitizeUserLinks(links: UserLinks | undefined): UserLinks {
  return {
    github: sanitizeSocialProfileUrl(links?.github, "github"),
    linkedin: sanitizeSocialProfileUrl(links?.linkedin, "linkedin"),
    instagram: sanitizeSocialProfileUrl(links?.instagram, "instagram"),
  };
}

// Re-running onboarding must keep the name from signup. Email is the last fallback.
function buildNameFieldsForOnboardingSave(
  existingProfile: UserProfile | null,
  emailAddress: string
): ProfileNameFields {
  // vocab: ?. and ?? = use the saved name when it exists, otherwise an empty string
  const firstName = existingProfile?.firstName ?? "";
  const lastName = existingProfile?.lastName ?? "";
  // vocab: || = use the next value when the left side is empty
  const displayName =
    existingProfile?.displayName || `${firstName} ${lastName}`.trim() || emailAddress;

  return { firstName, lastName, displayName };
}

function buildOnboardingDocument(
  emailAddress: string,
  onboardingAnswers: OnboardingPayload,
  nameFields: ProfileNameFields,
  existingProfile: UserProfile | null
) {
  return {
    email: emailAddress,
    firstName: nameFields.firstName,
    lastName: nameFields.lastName,
    displayName: nameFields.displayName,
    classRank: onboardingAnswers.classRank,
    gender: onboardingAnswers.gender,
    age: onboardingAnswers.age,
    major: onboardingAnswers.major,
    careerNiche: onboardingAnswers.careerNiche,
    // vocab: ?? "" = empty string when an optional onboarding field was skipped
    careerNicheOther: onboardingAnswers.careerNicheOther ?? "",
    hasExperience: onboardingAnswers.hasExperience,
    experienceDetails: onboardingAnswers.experienceDetails ?? "",
    casualInterests: onboardingAnswers.casualInterests,
    aboutYou: onboardingAnswers.aboutYou,
    religion: onboardingAnswers.religion ?? "",
    signupReason: onboardingAnswers.signupReason,
    bio: onboardingAnswers.bio,
    photoURL: onboardingAnswers.photoURL ?? "",
    links: sanitizeUserLinks(onboardingAnswers.links),
    school: DEFAULT_SCHOOL_NAME,
    // Finished onboarding means visible on Discovery unless they later hide in Settings.
    // Manipulate here: isPublic false = stay hidden until they flip the Settings toggle
    isPublic: true,
    isDeactivated: false,
    onboardingComplete: true,
    ...(existingProfile?.preferences ? { preferences: existingProfile.preferences } : {}),
  };
}

function readUserProfileFromDiscoveryDoc(
  userId: string,
  discoveryData: Record<string, unknown>
): PublicProfileRecord {
  // Discovery docs never store private fields. Empty strings keep the UserProfile shape.
  const profile = {
    ...(discoveryData as UserProfile),
    email: "",
    religion: "",
    signupReason: [],
    gender: "",
    age: "",
  };

  return { userId, profile };
}

async function writeOwnerProfileAndSyncDiscovery(
  userId: string,
  profileFields: Record<string, unknown>
): Promise<UserProfile> {
  await setDoc(doc(db, USERS_COLLECTION, userId), profileFields, MERGE_EXISTING_DOCUMENT_FIELDS);

  // Re-read so sync uses the merged document (partial writes included).
  const savedProfile = await getUserProfileWithoutDiscoverySync(userId);
  if (!savedProfile) {
    throw new Error("Profile was missing after save.");
  }

  await syncDiscoveryProfileProjection(userId, savedProfile);
  return savedProfile;
}

/**
 * Internal read of users/{uid} without refreshing the Discovery projection.
 * Used by write paths that sync themselves afterward.
 */
async function getUserProfileWithoutDiscoverySync(
  userId: string
): Promise<UserProfile | null> {
  const profileSnapshot = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!profileSnapshot.exists()) {
    return null;
  }
  return profileSnapshot.data() as UserProfile;
}

// ===== MAIN FUNCTIONS =====

// Defaults so Settings always has a full object on the first visit.
// Manipulate here: flip any true/false to change the first-visit Settings defaults.
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
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

/**
 * Fill missing preference fields with defaults.
 * Older profiles may only have some keys saved. Saved values win; missing keys keep the default.
 * @param savedPreferences - Partial preferences from Firestore, or nothing
 * @returns A full preferences object the Settings toggles can read
 */
export function resolveUserPreferences(
  savedPreferences?: Partial<UserPreferences> | null
): UserPreferences {
  // vocab: Partial<T> = same shape as T, but every field is optional
  // vocab: ...spread = copy defaults first, then overwrite with whatever was saved
  return {
    ...DEFAULT_USER_PREFERENCES,
    ...savedPreferences,
  };
}

/**
 * Save the public toggle and notification preferences from the Settings page.
 * @param userId - Firebase Auth user id (document id under users/)
 * @param settingsUpdate - isPublic and/or preferences
 * @returns Resolves when Firestore has merged the update and Discovery is synced
 */
export async function updateUserSettings(
  userId: string,
  settingsUpdate: UserSettingsUpdate
): Promise<void> {
  await writeOwnerProfileAndSyncDiscovery(userId, {
    ...settingsUpdate,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Patch profile fields from the account editor. Does not reset onboarding flags.
 * @param userId - Firebase Auth user id
 * @param profileUpdate - Only the fields the editor changed
 * @returns Resolves when Firestore has merged the patch and Discovery is synced
 */
export async function updateAccountProfile(
  userId: string,
  profileUpdate: AccountProfileUpdate
): Promise<void> {
  const sanitizedProfileUpdate: AccountProfileUpdate = {
    ...profileUpdate,
    ...(profileUpdate.links ? { links: sanitizeUserLinks(profileUpdate.links) } : {}),
  };

  await writeOwnerProfileAndSyncDiscovery(userId, {
    ...sanitizedProfileUpdate,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Load one page of public Discovery projections (not full users/{uid} docs).
 * Classmates never receive email, religion, signupReason, gender, or age from this query.
 * @returns Public profile projections, each with its Firebase user id
 */
export async function listPublicProfiles(): Promise<PublicProfileRecord[]> {
  // Query shape must match firestore.rules on discoveryProfiles.
  // vocab: query + where = ask Firestore for documents that match, not the whole collection
  const publicProfilesQuery = query(
    collection(db, DISCOVERY_PROFILES_COLLECTION),
    where(PUBLIC_PROFILE_FIELD, "==", true),
    where("onboardingComplete", "==", true),
    limit(PUBLIC_PROFILE_PAGE_SIZE)
  );
  // vocab: getDocs = run that query once and return the matching documents
  const snapshot = await getDocs(publicProfilesQuery);

  return snapshot.docs.map((profileDocument) =>
    readUserProfileFromDiscoveryDoc(
      profileDocument.id,
      profileDocument.data() as Record<string, unknown>
    )
  );
}

/**
 * Read one student profile (owner document). Also refreshes their Discovery projection
 * so older accounts get a public-safe card after the security split.
 * @param userId - Firebase Auth user id
 * @returns The profile, or null if users/{userId} was never written
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profile = await getUserProfileWithoutDiscoverySync(userId);
  if (!profile) {
    return null;
  }

  // Best-effort projection sync. A failure here must not block Account / Settings.
  try {
    await syncDiscoveryProfileProjection(userId, profile);
  } catch {
    // Rules deploy lag or offline — owner UI still works from users/{uid}.
  }

  return profile;
}

/**
 * First save after signup. Stores name and email on the owner doc. Onboarding is still required.
 * @param userId - Firebase Auth user id
 * @param emailAddress - Michigan email from Google
 * @param signupNames - First and last name from the signup form or from Google's display name
 * @returns Resolves when the starter profile is merged
 */
export async function saveSignupProfile(
  userId: string,
  emailAddress: string,
  signupNames: SignupNames
): Promise<void> {
  const displayName = `${signupNames.firstName} ${signupNames.lastName}`.trim();

  await writeOwnerProfileAndSyncDiscovery(userId, {
    email: emailAddress,
    firstName: signupNames.firstName,
    lastName: signupNames.lastName,
    displayName,
    // Manipulate here: change DEFAULT_SCHOOL_NAME if you rebrand or add another campus
    school: DEFAULT_SCHOOL_NAME,
    // Private until onboarding finishes and they opt into Discovery.
    // Manipulate here: isPublic true = show on Discovery before onboarding is done
    isPublic: false,
    isDeactivated: false,
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Save the full onboarding answers, mark onboarding complete, and open the profile on Discovery.
 * @param userId - Firebase Auth user id
 * @param emailAddress - Michigan email from the signed-in user
 * @param onboardingAnswers - Every field collected by the onboarding form
 * @returns Resolves when the finished profile is merged and Discovery is synced
 */
export async function saveOnboardingProfile(
  userId: string,
  emailAddress: string,
  onboardingAnswers: OnboardingPayload
): Promise<void> {
  const existingProfile = await getUserProfileWithoutDiscoverySync(userId);
  const nameFields = buildNameFieldsForOnboardingSave(existingProfile, emailAddress);
  const onboardingDocument = buildOnboardingDocument(
    emailAddress,
    onboardingAnswers,
    nameFields,
    existingProfile
  );

  await writeOwnerProfileAndSyncDiscovery(userId, {
    ...onboardingDocument,
    // Keep the original createdAt. Re-running onboarding should not reset their join date.
    createdAt: existingProfile?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
