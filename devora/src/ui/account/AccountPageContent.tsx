// Account page brain — check login, load Firestore profile, toggle view/edit, save changes.
// Sign-out lives here too when the profile is in view mode.
// Child components are “dumb” about Firebase: AccountProfileEditor drafts fields; we write them.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires when user signs in or out
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  getAuthErrorMessage,
  getUserProfile,
  signOutUser,
  updateAccountProfile,
  type AccountProfileUpdate,
  type UserProfile,
} from "@/backend/firebase";
import { uploadProfilePhoto } from "@/backend/firebase/storage-upload";

import AccountProfileEditor from "./AccountProfileEditor";
import AccountProfileView from "./AccountProfileView";

// Owns account state: loading → view ↔ edit → save or sign out.
export default function AccountPageContent() {
  // vocab: useRouter = Next.js helper that lets us navigate (replace) without a full reload
  const router = useRouter();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // vocab: UserProfile | null = loaded Firestore profile, or null until/if it arrives
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // isLoading = true until the auth + profile check finishes (shows spinner)
  const [isLoading, setIsLoading] = useState(true);
  // isEditing = false shows AccountProfileView; true shows AccountProfileEditor
  // Manipulate here: set true by default only for debugging the editor — leave false for users
  const [isEditing, setIsEditing] = useState(false);
  // isSaving = true while photo upload + Firestore write are in flight (editor disables inputs)
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auth gate — redirect if logged out or onboarding incomplete; else show profile.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not signed in — send them to login (account page is private).
      // vocab/symbol: !user means "no user" — Firebase passed null
      if (!user) {
        // vocab: router.replace = navigate without adding a history entry
        // Manipulate here: change "/auth/login" if the login route moves
        router.replace("/auth/login");
        return;
      }

      try {
        // vocab: getUserProfile = load users/{uid} from Firestore
        // vocab: uid = Firebase Auth user id (unique per Google account)
        const nextProfile = await getUserProfile(user.uid);
        // Profile missing or unfinished — finish onboarding before editing account.
        // vocab/symbol: ?. = optional chaining — if nextProfile is null, skip the field
        // vocab / profile field: onboardingComplete = true after Finish on the wizard
        if (!nextProfile?.onboardingComplete) {
          // Manipulate here: change "/onboarding" if that route renames
          router.replace("/onboarding");
          return;
        }
        setProfile(nextProfile);
      } catch {
        setError("Could not load your profile. Refresh and try again.");
      } finally {
        // Always hide the spinner once the auth check finishes.
        // vocab: finally = runs after try/catch either way
        setIsLoading(false);
      }
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  // This handler is the heartbeat of Save on the account page.
  // Editor validates locally, then calls us with the field bag + optional new photo.
  // vocab: AccountProfileUpdate = partial field bag from AccountProfileEditor
  // vocab: File | null = new photo from the editor, or null to keep the existing one
  async function handleSave(update: AccountProfileUpdate, photoFile: File | null) {
    // vocab: auth.currentUser = whoever Firebase says is logged in right now (or null)
    const user = auth.currentUser;
    // Session expired mid-edit — bounce to login instead of writing as nobody.
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // New photo? Upload to Storage FIRST, then include its URL in the Firestore update.
      // Order matters: updateAccountProfile needs the final photoURL string if it changed.
      // vocab: Firebase Storage = file bucket; photoURL = public download link string
      let photoURL = update.photoURL;
      if (photoFile) {
        // vocab: uploadProfilePhoto = put file in Storage under this uid, return download URL
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      }

      // vocab: updateAccountProfile = merge these fields into users/{uid} in Firestore
      // Does NOT flip onboardingComplete — that was already set during onboarding Finish.
      // vocab/symbol: ...update = copy all editor fields; then maybe override photoURL
      // vocab/symbol: ...(photoURL ? { photoURL } : {}) = only include photoURL if we have one
      await updateAccountProfile(user.uid, {
        ...update,
        ...(photoURL ? { photoURL } : {}),
      });

      // Reload the profile so view mode shows the fresh data (not the pre-save snapshot).
      const refreshed = await getUserProfile(user.uid);
      if (refreshed) {
        setProfile(refreshed);
      }

      // Leave edit mode and show a short success banner.
      setIsEditing(false);
      setSuccess("Profile updated.");
    } catch (err) {
      // vocab: getAuthErrorMessage = turn Firebase errors into a friendly string for the banner
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  // Sign out of Firebase Auth and return to the login page.
  // vocab: signOutUser = clear the Firebase session on this device
  async function handleSignOut() {
    await signOutUser();
    // Manipulate here: change "/auth/login" if you want sign-out to land somewhere else
    router.replace("/auth/login");
  }

  // Spinner while profile loads.
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="sign-in-spinner" />
        <p className="theme-muted text-sm">Loading your profile…</p>
      </div>
    );
  }

  // Auth succeeded but Firestore profile never arrived (rare — rules/network failure).
  if (!profile) {
    return (
      <div className="sign-in-error">
        Could not load your profile. Try refreshing or complete onboarding first.
      </div>
    );
  }

  return (
    <div className="account-page-content">
      {/* Status banners from save / load failures */}
      {error ? <div className="sign-in-error">{error}</div> : null}
      {success ? (
        <div className="account-success-banner">{success}</div>
      ) : null}

      {/* View mode vs edit mode — only one mounts at a time */}
      {isEditing ? (
        <AccountProfileEditor
          profile={profile}
          saving={isSaving}
          onCancel={() => {
            // Leave edit mode without writing; clear any leftover error from a failed save
            setIsEditing(false);
            setError("");
          }}
          // Editor calls this after its own local validation passes
          onSave={handleSave}
        />
      ) : (
        // onEdit flips isEditing so the editor mounts with this profile as initial draft
        <AccountProfileView profile={profile} onEdit={() => setIsEditing(true)} />
      )}

      {/* Sign out only in view mode (edit mode has Cancel / Save instead) */}
      {!isEditing ? (
        <div className="account-footer-actions">
          <button type="button" className="page-btn-danger w-full max-w-sm" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
