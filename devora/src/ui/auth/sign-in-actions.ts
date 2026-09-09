// Shared Google sign-in for login + signup pages.
// This is the “brain” after the student clicks Continue with Google.
// Flow: check UMich email → Google popup → load/create Firestore profile → pick a redirect.
"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import {
  getAuthErrorMessage,
  getUserProfile,
  isUmichEmail,
  saveSignupProfile,
  signInWithGoogle,
} from "@/backend/firebase";

// vocab: SignInMode = which form called us
// "login" skips name save (unless profile is missing); "signup" requires first + last name
type SignInMode = "login" | "signup";

type SignInOptions = {
  firstName?: string;
  lastName?: string;
  schoolEmail: string;
};

// This function is the whole Google auth pipeline for both LoginCard and SignupCard.
// Callers catch thrown Errors and show them in the red banner.
// vocab: AppRouterInstance = Next.js router object (has .push / .replace)
export async function handleGoogleSignIn(
  router: AppRouterInstance,
  mode: SignInMode,
  options: SignInOptions
) {
  // Strip accidental spaces so " alex@umich.edu " still counts as valid.
  // vocab: .trim() = remove whitespace at the start and end of the string
  const schoolEmail = options.schoolEmail.trim();

  // Gate 1 — school email must be Michigan before we open Google.
  // Why before Google? Saves a wasted popup if they typed Gmail by mistake.
  // vocab: isUmichEmail = true only for @umich.edu or @umd.umich.edu
  // vocab/symbol: ! means NOT — this block runs when the email is NOT Michigan
  // Manipulate here: change the allowed domains inside isUmichEmail (backend), not this throw text alone
  if (!isUmichEmail(schoolEmail)) {
    throw new Error("Enter your @umich.edu or @umd.umich.edu school email.");
  }

  // Gate 2 — signup form must have both names (they get written into Firestore).
  // Login can skip this because returning users already have a profile.
  if (mode === "signup" && (!options.firstName || !options.lastName)) {
    throw new Error("Enter your first and last name.");
  }

  try {
    // Step A — open Google’s account picker and wait until they finish (or cancel).
    // vocab: signInWithGoogle = Firebase Auth popup; returns a result with .user
    // vocab: await = pause this function until the popup flow finishes
    const result = await signInWithGoogle(schoolEmail);
    const user = result.user;
    // Google always has an email in normal cases; ?? "" keeps TypeScript/Firestore happy if not.
    // vocab/symbol: ?? means “if left side is null/undefined, use the right side”
    const email = user.email ?? "";

    // Step B — refresh the login ticket so Firestore security rules see the latest email claim.
    // Without this, a brand-new Google user can briefly fail rules that check request.auth.token.email.
    // vocab: getIdToken(true) = force-refresh the Firebase Auth JWT (true = don’t reuse a cached one)
    await user.getIdToken(true);

    // Step C — load users/{uid} from Firestore (null = first time on Devora).
    // vocab: uid = Firebase Auth user id (unique per Google account, stable forever)
    // vocab: getUserProfile = read the users/{uid} document, or null if it doesn’t exist yet
    let profile = await getUserProfile(user.uid);

    // Step D — make sure a starter profile exists (names + email).
    // Signup path — trust the names they typed on our form (not Google’s displayName).
    // vocab: saveSignupProfile = create/merge early profile fields; does NOT set onboardingComplete
    if (mode === "signup" && options.firstName && options.lastName) {
      await saveSignupProfile(user.uid, email, {
        firstName: options.firstName,
        lastName: options.lastName,
      });
      // Re-read so the redirect checks below see the fresh document.
      profile = await getUserProfile(user.uid);
    }
    // Login path with no profile yet — invent names from Google’s displayName string.
    // Happens when someone hits Log in before ever signing up.
    else if (!profile) {
      // Break "Alex Chen" into ["Alex", "Chen"].
      // vocab/symbol: split(/\s+/) = split on one-or-more whitespace characters
      const nameParts = (user.displayName ?? "Student").trim().split(/\s+/);
      await saveSignupProfile(user.uid, email, {
        firstName: nameParts[0] ?? "Student",
        // Last name = every word after the first ("Mary Ann Lee" → "Ann Lee").
        // vocab: slice(1).join(" ") = words from index 1 onward, rejoined with spaces
        lastName: nameParts.slice(1).join(" "),
      });
      profile = await getUserProfile(user.uid);
    }

    // Redirect 1 — onboarding wizard if they never hit Finish.
    // vocab / profile field: onboardingComplete = true only after Finish on the onboarding form
    // vocab/symbol: ?. = optional chaining — if profile is null, treat as “not complete”
    // Manipulate here: change "/onboarding" if you rename the onboarding route
    if (!profile?.onboardingComplete) {
      router.push("/onboarding");
      return;
    }

    // Redirect 2 — Settings deactivate path: account exists but is hidden from Discovery.
    // vocab / profile field: isDeactivated = true means classmates can’t find them on the grid
    // Manipulate here: change "/auth/deactivated" if you move that gate screen
    if (profile.isDeactivated) {
      router.push("/auth/deactivated");
      return;
    }

    // Redirect 3 — happy path: finished + active → Discovery Grid.
    // Manipulate here: change "/find-students" to send them somewhere else after login
    router.push("/find-students");
  } catch (error) {
    // Turn Firebase / Google error codes into a sentence the UI banner can show.
    // vocab: getAuthErrorMessage = map Firebase error codes (auth/popup-closed, etc.) to friendly text
    throw new Error(getAuthErrorMessage(error));
  }
}
