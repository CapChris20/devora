// Re-exports every Firebase helper so the rest of the app can import from one file.

// ===== MAIN EXPORTS =====

export { app, auth, db, storage } from "./start-firebase";
export { getFirebaseAnalytics } from "./usage-tracking";
export { firebaseConfig } from "./env-keys";
export { getAuthErrorMessage } from "./auth-errors";
export {
  ALLOWED_EMAIL_DOMAIN,
  UMICH_ONLY_ERROR,
  isUmichEmail,
  signInWithGoogle,
  signOutUser,
  reauthenticateWithGoogle,
} from "./auth";
export {
  deactivateAccount,
  deleteOwnAccount,
  reactivateAccount,
} from "./account-lifecycle";
export { uploadProfilePhoto } from "./storage-upload";
export {
  getUserProfile,
  listPublicProfiles,
  saveOnboardingProfile,
  saveSignupProfile,
  updateAccountProfile,
  updateUserSettings,
  type AccountProfileUpdate,
  type MessagePolicy,
  type OnboardingPayload,
  type PublicProfileRecord,
  type SignupNames,
  type UserPreferences,
  type UserProfile,
  type UserSettingsUpdate,
  DEFAULT_USER_PREFERENCES,
  resolveUserPreferences,
} from "./user-profile";

export {
  sanitizeSafeHttpsUrl,
  sanitizeSocialProfileUrl,
  type SocialLinkKind,
} from "./safe-http-url";
