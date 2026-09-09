// Read and write student profiles in Firestore at users/{uid}.
// Flow: getDoc/setDoc on users/{uid} for signup → onboarding → account → settings.
// Used by signup, onboarding, account page, and settings.

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";

import { db } from "./start-firebase";

export type UserLinks = {
  github?: string;
  linkedin?: string;
  instagram?: string;
};

// Who can DM this user (enforced when messaging exists).
export type MessagePolicy = "everyone" | "connections" | "none";

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

// Defaults for every preference toggle so Settings always has a full object.
// Manipulate here: flip any true/false to change the “first visit” Settings defaults
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

// Fill missing preference fields with defaults so the UI always has a full object.
// Older profiles may only have some keys saved — we merge so toggles never read undefined.
// vocab: Partial<T> = same shape as T but every field is optional
export function resolveUserPreferences(
  preferences?: Partial<UserPreferences> | null
): UserPreferences {
  // vocab/symbol: ... spreads defaults first, then overwrites with whatever was saved
  // Why defaults first? Saved values win; missing keys keep the DEFAULT_USER_PREFERENCES value.
  return {
    ...DEFAULT_USER_PREFERENCES,
    ...preferences,
  };
}

export type UserSettingsUpdate = {
  isPublic?: boolean;
  preferences?: UserPreferences;
};

// Shape of one student document in Firestore.
// vocab: Timestamp = Firestore’s date/time type (not a plain JS Date)
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

// Only these profile fields may be sent in a patch update from the account editor.
// vocab: Pick = take only these keys from UserProfile
// vocab: Partial = make those picked keys optional for a partial update
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

// Save isPublic toggle and notification/messaging preferences from Settings page.
// vocab: uid = unique user id from Firebase Auth (document id under users/)
// vocab: setDoc = write/merge fields into a Firestore document
// vocab: serverTimestamp = let Firebase fill “now” on the server
export async function updateUserSettings(
  uid: string,
  data: UserSettingsUpdate
): Promise<void> {
  await setDoc(
    // vocab: doc(db, "users", uid) = pointer to the users/{uid} document
    doc(db, "users", uid),
    {
      // vocab/symbol: ...data = spread whatever Settings sent (isPublic and/or preferences)
      ...data,
      updatedAt: serverTimestamp(),
    },
    // vocab/symbol: merge true — update these keys only, leave other fields alone
    { merge: true }
  );
}

// Patch profile fields from Account page editor (does not reset onboarding flags).
export async function updateAccountProfile(
  uid: string,
  data: AccountProfileUpdate
): Promise<void> {
  // Why merge? Account editor sends a partial patch — never wipe unrelated fields.
  await setDoc(
    doc(db, "users", uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Fetch one user's profile doc by uid. Returns null if doc doesn't exist yet.
// vocab: getDoc = read one Firestore document once
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // vocab: snapshot = result of the read (may or may not contain a document)
  const snapshot = await getDoc(doc(db, "users", uid));

  // No users/{uid} doc yet (brand-new Google account).
  // vocab: snapshot.exists() = false when that document id was never written
  if (!snapshot.exists()) {
    return null;
  }

  // vocab: snapshot.data() = plain object of the document fields
  // vocab: as UserProfile = tell TypeScript “trust this shape” after we know it exists
  return snapshot.data() as UserProfile;
}

// First save after signup — name + email only; onboarding still required.
export async function saveSignupProfile(
  uid: string,
  email: string,
  names: SignupNames
): Promise<void> {
  // vocab/symbol: `...${}` = template string — builds "First Last" for displayName
  const displayName = `${names.firstName} ${names.lastName}`.trim();

  await setDoc(
    doc(db, "users", uid),
    {
      email,
      firstName: names.firstName,
      lastName: names.lastName,
      displayName,
      // Manipulate here: change school string if you rebrand or add another campus
      school: "University of Michigan-Dearborn",
      // Private until onboarding finishes and they opt into Discovery.
      // Manipulate here: isPublic true = show on Discovery before onboarding is done
      isPublic: false,
      // vocab / profile field: onboardingComplete = false until Finish on the wizard
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Save full onboarding answers — marks onboardingComplete and opens profile to Discovery.
export async function saveOnboardingProfile(
  uid: string,
  email: string,
  data: OnboardingPayload
): Promise<void> {
  // Keep first/last name from signup if they already exist.
  const existing = await getUserProfile(uid);
  // vocab/symbol: ?. and ?? — use saved name if present, else empty string
  const firstName = existing?.firstName ?? "";
  const lastName = existing?.lastName ?? "";
  // Prefer saved displayName, else build from names, else fall back to email.
  // vocab/symbol: || = use the next value when the left side is empty/falsy
  const displayName =
    existing?.displayName || `${firstName} ${lastName}`.trim() || email;

  await setDoc(
    doc(db, "users", uid),
    {
      email,
      firstName,
      lastName,
      displayName,
      classRank: data.classRank,
      gender: data.gender,
      age: data.age,
      major: data.major,
      careerNiche: data.careerNiche,
      // vocab/symbol: ?? "" = empty string when optional onboarding fields were skipped
      careerNicheOther: data.careerNicheOther ?? "",
      hasExperience: data.hasExperience,
      experienceDetails: data.experienceDetails ?? "",
      casualInterests: data.casualInterests,
      aboutYou: data.aboutYou,
      religion: data.religion ?? "",
      signupReason: data.signupReason,
      bio: data.bio,
      photoURL: data.photoURL ?? "",
      links: data.links,
      // Manipulate here: school label written on every finished onboarding save
      school: "University of Michigan-Dearborn",
      // Finished onboarding → visible on Discovery by default.
      // Manipulate here: isPublic false = stay hidden until they flip Settings
      isPublic: true,
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
      // Keep original createdAt if present; otherwise stamp "now".
      // Why? Re-running onboarding should not reset their account birthday.
      createdAt: existing?.createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );
}
