// Turn Firebase and app errors into short messages for the UI.
// Flow: check our UMich message → map FirebaseError.code → fall back to Error.message.
// Used by login, signup, onboarding, account, and settings forms.

import { FirebaseError } from "firebase/app";

import { UMICH_ONLY_ERROR } from "./auth";

// This function is the translator between Firebase jargon and what the form shows.
// Call it inside catch blocks so the UI never dumps raw auth/popup-blocked text.
// vocab: unknown = TypeScript type for “could be anything” (safe catch bags)
export function getAuthErrorMessage(error: unknown): string {
  // Our own UMich-only check already has a clear message — pass it through.
  // Why first? Prevents remapping our intentional throw into a generic Firebase line.
  // vocab: instanceof = “is this object a kind of Error?”
  if (error instanceof Error && error.message === UMICH_ONLY_ERROR) {
    return error.message;
  }

  // Firebase errors come with a code like "auth/popup-blocked".
  // vocab: FirebaseError = Firebase’s typed error with .code and .message
  if (error instanceof FirebaseError) {
    // vocab: switch = pick a branch by matching error.code exactly
    // Manipulate here: add a case when you see a new code in the console during testing
    switch (error.code) {
      // Firestore rules blocked the write (wrong account / not signed in).
      // vocab: Firestore = our database; rules = server-side permission checks
      case "permission-denied":
        return "Couldn't save your profile. Use your @umich.edu or @umd.umich.edu Google account, then try again.";

      // Database missing or not ready in the Firebase project.
      case "unavailable":
      case "failed-precondition":
        return "Firestore isn't ready yet. Create the database in Firebase Console → Firestore → Create database, then try again.";

      // Google provider not turned on in Firebase Console.
      case "auth/operation-not-allowed":
        return "Google sign-in isn't enabled. Turn it on in Firebase Console → Authentication → Sign-in method.";

      // localhost (or deploy URL) not listed under Authorized domains.
      case "auth/unauthorized-domain":
        return "This site isn't authorized for sign-in. Add localhost under Firebase Authentication → Settings → Authorized domains.";

      // Browser blocked the Google popup window.
      case "auth/popup-blocked":
        return "Pop-up was blocked. Allow pop-ups for localhost and try again.";

      case "auth/email-already-in-use":
        return "That email is already registered. Try logging in instead.";

      case "auth/invalid-email":
        return "Enter a valid email address.";

      case "auth/weak-password":
        return "Password must be at least 6 characters.";

      // Wrong password or expired credential.
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";

      case "auth/user-not-found":
        return "No account found with that email.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";

      // User closed the Google window before finishing.
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";

      // Sensitive action needs a fresh Google login first (delete account, etc.).
      case "auth/requires-recent-login":
        return "Confirm with Google again, then retry.";

      case "auth/user-mismatch":
        return "Pick the same Google account that's signed in.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method.";

      // Unknown Firebase code — guess from the message, else show the code.
      default:
        if (error.message.includes("Firestore") || error.message.includes("firestore")) {
          return "Firestore isn't set up yet. In Firebase Console, open Firestore and click Create database.";
        }
        // vocab/symbol: `...${}` = template string — inserts error.code into the text
        return `Sign-in failed (${error.code}). Check Firebase setup and try again.`;
    }
  }

  // Plain Error from our own throw new Error("...") — keep the original wording.
  if (error instanceof Error) {
    return error.message;
  }

  // Anything else (string, null, weird object) — never show “[object Object]”.
  return "Something went wrong. Please try again.";
}
