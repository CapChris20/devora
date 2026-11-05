// Shared Google sign-in for the login and signup pages.
// Flow: check the Michigan email → Google popup → load or create the Firestore profile → pick a redirect.
// Both cards catch thrown Errors and show them in the red banner.

"use client";

// ===== IMPORTS =====

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { User } from "firebase/auth";

import {
  getAuthErrorMessage,
  getUserProfile,
  isUmichEmail,
  saveSignupProfile,
  signInWithGoogle,
  type UserProfile,
} from "@/backend/firebase";

// ===== NAMED CONSTANTS =====

export const MICHIGAN_EMAIL_REQUIRED_MESSAGE =
  "Enter your @umich.edu or @umd.umich.edu school email.";

export const SIGNUP_NAME_REQUIRED_MESSAGE = "Enter your first and last name.";

export const UNEXPECTED_SIGN_IN_ERROR_MESSAGE = "Something went wrong. Please try again.";

const ONBOARDING_PATH = "/onboarding";
const DEACTIVATED_ACCOUNT_PATH = "/auth/deactivated";
const DISCOVERY_GRID_PATH = "/find-students";
const FALLBACK_FIRST_NAME = "Student";

// ===== TYPES =====

// "login" skips the name save unless the profile is missing. "signup" requires both names.
export type SignInMode = "login" | "signup";

type SignInOptions = {
  firstName?: string;
  lastName?: string;
  schoolEmail: string;
};

// ===== HELPER FUNCTIONS =====

function assertSchoolEmailIsMichigan(schoolEmail: string): void {
  // Why before Google? A Gmail address should fail here instead of opening a wasted popup.
  // Manipulate here: domain rules live in isUmichEmail, not in this message alone
  if (!isUmichEmail(schoolEmail)) {
    throw new Error(MICHIGAN_EMAIL_REQUIRED_MESSAGE);
  }
}

function assertSignupIncludesBothNames(mode: SignInMode, options: SignInOptions): void {
  const isSignup = mode === "signup";
  const hasFirstName = Boolean(options.firstName);
  const hasLastName = Boolean(options.lastName);

  if (isSignup && (!hasFirstName || !hasLastName)) {
    throw new Error(SIGNUP_NAME_REQUIRED_MESSAGE);
  }
}

// Brand-new Google users can fail Firestore rules until the login ticket includes the email.
async function refreshLoginToken(signedInUser: User): Promise<void> {
  // vocab: getIdToken(true) = force a fresh Firebase login ticket. true means do not reuse a cached one.
  await signedInUser.getIdToken(true);
}

async function saveProfileFromSignupForm(
  signedInUser: User,
  googleEmail: string,
  options: SignInOptions
): Promise<void> {
  await saveSignupProfile(signedInUser.uid, googleEmail, {
    firstName: options.firstName ?? "",
    lastName: options.lastName ?? "",
  });
}

// Someone hit Log in before they ever signed up. Invent names from Google's display name.
async function saveProfileFromGoogleDisplayName(
  signedInUser: User,
  googleEmail: string
): Promise<void> {
  // vocab: split(/\s+/) = cut the name on one or more spaces. "Mary Ann Lee" → ["Mary", "Ann", "Lee"]
  const displayName = signedInUser.displayName ?? FALLBACK_FIRST_NAME;
  const nameParts = displayName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? FALLBACK_FIRST_NAME;
  // vocab: slice(1).join(" ") = every word after the first, joined back with spaces
  const lastName = nameParts.slice(1).join(" ");

  await saveSignupProfile(signedInUser.uid, googleEmail, { firstName, lastName });
}

async function ensureProfileExistsAfterGoogleSignIn(
  signedInUser: User,
  googleEmail: string,
  mode: SignInMode,
  options: SignInOptions
): Promise<UserProfile | null> {
  // vocab: uid = Firebase user id. It stays the same for this Google account forever.
  // vocab: getUserProfile = read users/{uid}, or null if this is their first time on Devora
  let userProfile = await getUserProfile(signedInUser.uid);
  const isSignupWithNames = mode === "signup" && Boolean(options.firstName) && Boolean(options.lastName);

  if (isSignupWithNames) {
    // Trust the names typed on our form, not Google's display name.
    // vocab: saveSignupProfile does not set onboardingComplete
    await saveProfileFromSignupForm(signedInUser, googleEmail, options);
    return getUserProfile(signedInUser.uid);
  }

  if (!userProfile) {
    await saveProfileFromGoogleDisplayName(signedInUser, googleEmail);
    userProfile = await getUserProfile(signedInUser.uid);
  }

  return userProfile;
}

function redirectAfterGoogleSignIn(
  router: AppRouterInstance,
  userProfile: UserProfile | null
): void {
  // vocab: ?. = if the profile is null, treat onboarding as not complete
  // vocab: onboardingComplete = true only after Finish on the onboarding form
  // Manipulate here: change ONBOARDING_PATH if you rename that route
  if (!userProfile?.onboardingComplete) {
    router.push(ONBOARDING_PATH);
    return;
  }

  // vocab: isDeactivated = classmates cannot find them on the grid
  // Manipulate here: change DEACTIVATED_ACCOUNT_PATH if you move that screen
  if (userProfile.isDeactivated) {
    router.push(DEACTIVATED_ACCOUNT_PATH);
    return;
  }

  // Manipulate here: change DISCOVERY_GRID_PATH to send them somewhere else after login
  router.push(DISCOVERY_GRID_PATH);
}

/**
 * Read a thrown value into one banner sentence.
 * @param thrownValue - Whatever a catch block received
 * @returns The error message, or a generic fallback
 */
export function readThrownErrorMessage(thrownValue: unknown): string {
  // vocab: instanceof Error = true when the value is a real Error with .message
  if (thrownValue instanceof Error) {
    return thrownValue.message;
  }

  return UNEXPECTED_SIGN_IN_ERROR_MESSAGE;
}

// ===== MAIN FUNCTION =====

/**
 * Run the Google sign-in pipeline for login or signup, then redirect.
 * Callers catch thrown Errors and show them in the red banner.
 * @param router - Next.js router used for the redirect
 * @param mode - "login" or "signup"
 * @param options - School email, plus first and last name on signup
 * @returns Resolves after a redirect has been started
 */
export async function handleGoogleSignIn(
  router: AppRouterInstance,
  mode: SignInMode,
  options: SignInOptions
) {
  // vocab: AppRouterInstance = Next.js router object (has .push / .replace)
  // vocab: .trim() = remove spaces so " alex@umich.edu " still counts
  const schoolEmail = options.schoolEmail.trim();
  assertSchoolEmailIsMichigan(schoolEmail);
  assertSignupIncludesBothNames(mode, options);

  try {
    // vocab: await = pause until the Google popup finishes
    // vocab: signInWithGoogle = Firebase popup. The result includes .user
    const signInResult = await signInWithGoogle(schoolEmail);
    const signedInUser = signInResult.user;
    // vocab: ?? = if email is missing, use an empty string
    const googleEmail = signedInUser.email ?? "";

    await refreshLoginToken(signedInUser);
    const userProfile = await ensureProfileExistsAfterGoogleSignIn(
      signedInUser,
      googleEmail,
      mode,
      options
    );
    redirectAfterGoogleSignIn(router, userProfile);
  } catch (error) {
    // vocab: getAuthErrorMessage = map Firebase codes such as auth/popup-closed to a sentence
    throw new Error(getAuthErrorMessage(error));
  }
}
