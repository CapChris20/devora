// Shown after login when the Firestore profile has isDeactivated: true.
// They can restore Discovery visibility or stay signed in with a hidden profile.
// sign-in-actions redirects here when profile.isDeactivated after a successful Google login.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires when user signs in or out
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  getAuthErrorMessage,
  getUserProfile,
  reactivateAccount,
} from "@/backend/firebase";
import SignInPageLayout from "./SignInPageLayout";

// Gate screen for deactivated accounts — reactivate or leave.
export default function DeactivatedAccountScreen() {
  // vocab: useRouter = Next.js helper that lets us bounce away if they don't belong here
  const router = useRouter();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // If they're signed out or the account isn't deactivated, bounce them.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not signed in — send them to login.
      if (!user) {
        // Manipulate here: change "/auth/login" if the login route moves
        router.replace("/auth/login");
        return;
      }

      try {
        // vocab: getUserProfile = load users/{uid} from Firestore
        const profile = await getUserProfile(user.uid);
        // Onboarding not finished — finish that first (deactivated check comes after).
        // vocab/symbol: ?. = optional chaining — if profile is null, skip the field
        if (!profile?.onboardingComplete) {
          router.replace("/onboarding");
          return;
        }
        // Already active — they don't belong on this screen.
        // vocab / profile field: isDeactivated = hidden from Discovery until they reactivate
        if (!profile.isDeactivated) {
          // Manipulate here: change "/find-students" if Discovery’s route renames
          router.replace("/find-students");
        }
      } catch {
        setError("Could not load your account. Refresh and try again.");
      } finally {
        // Always hide the spinner once the auth check finishes.
        setIsLoading(false);
      }
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  // This handler turns Discovery back on and continues into the app.
  // Same backend call as Settings → Reactivate; this screen is the post-login path.
  // vocab: reactivateAccount = clear isDeactivated in Firestore and show on Discovery again
  async function handleReactivate() {
    // vocab: auth.currentUser = whoever Firebase says is logged in right now (or null)
    const user = auth.currentUser;
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await reactivateAccount(user.uid);
      // After reactivate, Discovery is the happy path (same as a normal login).
      router.replace("/find-students");
    } catch (err) {
      // vocab: getAuthErrorMessage = turn Firebase errors into a friendly string
      setError(getAuthErrorMessage(err));
      setIsSaving(false);
    }
  }

  // Spinner while we confirm this account is actually deactivated.
  if (isLoading) {
    return (
      <SignInPageLayout>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="sign-in-spinner" />
        </div>
      </SignInPageLayout>
    );
  }

  // Explanation + Reactivate CTA.
  return (
    <SignInPageLayout>
      <div className="flex flex-col gap-5 text-center">
        <h1 className="font-display headline-grad text-2xl font-bold">
          Account deactivated
        </h1>
        <p className="theme-muted text-sm leading-relaxed">
          Your profile is hidden from the Discovery Grid. Reactivate to show up
          for classmates again. Your data is still here until you delete the
          account in Settings.
        </p>
        {error ? <div className="sign-in-error text-left">{error}</div> : null}
        <button
          type="button"
          className="btn-neon font-display rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#14051c]"
          onClick={handleReactivate}
          disabled={isSaving}
        >
          {isSaving ? "Reactivating…" : "Reactivate account"}
        </button>
      </div>
    </SignInPageLayout>
  );
}
