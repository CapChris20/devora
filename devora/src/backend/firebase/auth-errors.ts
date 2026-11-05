// Turn Firebase and app errors into short sentences for form banners.
// Flow: keep our Michigan message → map Firebase error codes → fall back to Error.message.
// Used by login, signup, onboarding, account, and settings.

// ===== IMPORTS =====

import { FirebaseError } from "firebase/app";

import { UMICH_ONLY_ERROR } from "./auth";

// ===== NAMED CONSTANTS =====

const UNEXPECTED_ERROR_MESSAGE = "Something went wrong. Please try again.";

const FIRESTORE_NOT_READY_MESSAGE =
  "Firestore isn't ready yet. Create the database in Firebase Console → Firestore → Create database, then try again.";

const FIRESTORE_SETUP_MESSAGE =
  "Firestore isn't set up yet. In Firebase Console, open Firestore and click Create database.";

// One friendly sentence per Firebase code the forms actually hit.
// Manipulate here: add a key when a new code shows up in the console during testing.
const FIREBASE_ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  "permission-denied":
    "Couldn't save your profile. Use your @umich.edu or @umd.umich.edu Google account, then try again.",
  unavailable: FIRESTORE_NOT_READY_MESSAGE,
  "failed-precondition": FIRESTORE_NOT_READY_MESSAGE,
  "auth/operation-not-allowed":
    "Google sign-in isn't enabled. Turn it on in Firebase Console → Authentication → Sign-in method.",
  "auth/unauthorized-domain":
    "This site isn't authorized for sign-in. Add localhost under Firebase Authentication → Settings → Authorized domains.",
  "auth/popup-blocked": "Pop-up was blocked. Allow pop-ups for localhost and try again.",
  "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "No account found with that email.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/requires-recent-login": "Confirm with Google again, then retry.",
  "auth/user-mismatch": "Pick the same Google account that's signed in.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
};

// ===== HELPER FUNCTIONS =====

function isUmichOnlyError(error: unknown): boolean {
  return error instanceof Error && error.message === UMICH_ONLY_ERROR;
}

// Unknown Firebase codes still mention Firestore sometimes. Prefer that hint over the raw code.
function getFallbackFirebaseErrorMessage(firebaseError: FirebaseError): string {
  const errorMessage = firebaseError.message.toLowerCase();
  const mentionsFirestore = errorMessage.includes("firestore");

  if (mentionsFirestore) {
    return FIRESTORE_SETUP_MESSAGE;
  }

  // vocab: template string = inserts firebaseError.code into the sentence
  return `Sign-in failed (${firebaseError.code}). Check Firebase setup and try again.`;
}

function getMessageForFirebaseError(firebaseError: FirebaseError): string {
  const knownMessage = FIREBASE_ERROR_MESSAGE_BY_CODE[firebaseError.code];
  if (knownMessage) {
    return knownMessage;
  }

  return getFallbackFirebaseErrorMessage(firebaseError);
}

// ===== MAIN FUNCTION =====

/**
 * Translate a thrown error into one sentence a form banner can show.
 * Our own Michigan-only message is returned unchanged so it is not rewritten.
 * @param error - Whatever a catch block received (Firebase error, Error, or something else)
 * @returns A short message safe to render in the UI
 */
export function getAuthErrorMessage(error: unknown): string {
  // vocab: unknown = TypeScript's "could be anything" type, which is what catch gives us
  // vocab: instanceof = "is this object a kind of Error / FirebaseError?"
  if (isUmichOnlyError(error)) {
    return (error as Error).message;
  }

  // vocab: FirebaseError = Firebase's error object with .code and .message
  if (error instanceof FirebaseError) {
    return getMessageForFirebaseError(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return UNEXPECTED_ERROR_MESSAGE;
}
