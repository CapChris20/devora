// Shown after login when the Firestore profile has isDeactivated: true.
// They can restore Discovery visibility or stay signed in with a hidden profile.
// sign-in-actions redirects here when profile.isDeactivated after a successful Google login.

"use client";

// ===== IMPORTS =====

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires when the user signs in or out
import { onAuthStateChanged, type User } from "firebase/auth";

import {
  auth,
  getAuthErrorMessage,
  getUserProfile,
  reactivateAccount,
} from "@/backend/firebase";
import SignInPageLayout from "../layout/SignInPageLayout";

// ===== NAMED CONSTANTS =====

const LOGIN_PATH = "/auth/login";
const ONBOARDING_PATH = "/onboarding";
const DISCOVERY_PATH = "/find-students";
const PROFILE_LOAD_ERROR_MESSAGE = "Could not load your account. Refresh and try again.";
const DEACTIVATED_HEADING = "Account deactivated";
const DEACTIVATED_BODY =
  "Your profile is hidden from other students. Reactivate to show up for classmates again. Your data is still here until you delete the account in Settings.";
const REACTIVATING_LABEL = "Reactivating…";
const REACTIVATE_LABEL = "Reactivate account";

// ===== HELPER FUNCTIONS =====

async function redirectIfThisScreenDoesNotApply(
  user: User | null,
  router: ReturnType<typeof useRouter>,
  setErrorMessage: (message: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> {
  // Not signed in — send them to login.
  if (!user) {
    // Manipulate here: change LOGIN_PATH if the login route moves
    router.replace(LOGIN_PATH);
    return;
  }

  try {
    // vocab: getUserProfile = load users/{uid} from Firestore
    const profile = await getUserProfile(user.uid);
    // Onboarding not finished — finish that first (deactivated check comes after).
    // vocab: ?. = if profile is null, skip the field
    if (!profile?.onboardingComplete) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    // Already active — they do not belong on this screen.
    // vocab / profile field: isDeactivated = hidden from Discovery until they reactivate
    if (!profile.isDeactivated) {
      // Manipulate here: change DISCOVERY_PATH if Discovery’s route renames
      router.replace(DISCOVERY_PATH);
    }
  } catch {
    setErrorMessage(PROFILE_LOAD_ERROR_MESSAGE);
  } finally {
    // Always hide the spinner once the auth check finishes.
    setIsLoading(false);
  }
}

async function reactivateAccountAndOpenDiscovery(
  router: ReturnType<typeof useRouter>,
  setIsSaving: (isSaving: boolean) => void,
  setErrorMessage: (message: string) => void
): Promise<void> {
  // vocab: auth.currentUser = whoever Firebase says is logged in right now (or null)
  const signedInUser = auth.currentUser;
  if (!signedInUser) {
    router.replace(LOGIN_PATH);
    return;
  }

  setIsSaving(true);
  setErrorMessage("");

  try {
    // vocab: reactivateAccount = clear isDeactivated in Firestore and show on Discovery again
    // vocab: await = wait for the Firestore write before navigating
    await reactivateAccount(signedInUser.uid);
    router.replace(DISCOVERY_PATH);
  } catch (thrownError) {
    // vocab: getAuthErrorMessage = turn Firebase errors into a friendly string
    setErrorMessage(getAuthErrorMessage(thrownError));
    setIsSaving(false);
  }
}

// ===== MAIN COMPONENT =====

/**
 * Gate screen for deactivated accounts. Reactivate, or leave the profile hidden.
 * @returns The deactivated-account card, or a spinner while the profile loads
 */
export default function DeactivatedAccountScreen() {
  // vocab: useRouter = Next.js helper that lets us bounce away if they do not belong here
  const router = useRouter();
  // vocab: useState = store a value and re-render when the setter is called
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If they are signed out, or the account is not deactivated, bounce them.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void redirectIfThisScreenDoesNotApply(user, router, setErrorMessage, setIsLoading);
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  const reactivateAndContinue = () => {
    // Same backend call as Settings → Reactivate; this screen is the post-login path.
    void reactivateAccountAndOpenDiscovery(router, setIsSaving, setErrorMessage);
  };

  if (isLoading) {
    return (
      <SignInPageLayout>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="sign-in-spinner" />
        </div>
      </SignInPageLayout>
    );
  }

  const reactivateButtonLabel = isSaving ? REACTIVATING_LABEL : REACTIVATE_LABEL;

  return (
    <SignInPageLayout>
      <div className="flex flex-col gap-5 text-center">
        <h1 className="font-display headline-grad text-2xl font-bold">{DEACTIVATED_HEADING}</h1>
        <p className="theme-muted text-sm leading-relaxed">{DEACTIVATED_BODY}</p>
        {errorMessage ? <div className="sign-in-error text-left">{errorMessage}</div> : null}
        <button
          type="button"
          className="btn-neon font-display rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#14051c]"
          onClick={reactivateAndContinue}
          disabled={isSaving}
        >
          {reactivateButtonLabel}
        </button>
      </div>
    </SignInPageLayout>
  );
}
