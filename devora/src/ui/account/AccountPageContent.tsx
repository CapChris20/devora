// Account page brain — check login, load the Firestore profile, toggle view/edit, save changes.
// Sign-out lives on the left column under Age / Gender when the profile is in view mode.
// Child components stay free of Firebase writes: the editor drafts fields, and this file saves them.

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
  signOutUser,
  updateAccountProfile,
  type AccountProfileUpdate,
  type UserProfile,
} from "@/backend/firebase";
import { uploadProfilePhoto } from "@/backend/firebase/storage-upload";

import AccountProfileEditor from "./editor/AccountProfileEditor";
import AccountProfileView from "./profile/AccountProfileView";

// ===== NAMED CONSTANTS =====

const LOGIN_PATH = "/auth/login";
const ONBOARDING_PATH = "/onboarding";
const PROFILE_LOAD_ERROR_MESSAGE = "Could not load your profile. Refresh and try again.";
const PROFILE_MISSING_MESSAGE =
  "Could not load your profile. Try refreshing or complete onboarding first.";
const LOADING_PROFILE_MESSAGE = "Loading your profile…";
const PROFILE_UPDATED_MESSAGE = "Profile updated.";

// ===== TYPES =====

type AccountSaveInput = {
  update: AccountProfileUpdate;
  photoFile: File | null;
  router: ReturnType<typeof useRouter>;
  setProfile: (profile: UserProfile) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setErrorMessage: (message: string) => void;
  setSuccessMessage: (message: string) => void;
};

// ===== HELPER FUNCTIONS =====

function buildAccountProfileWrite(
  update: AccountProfileUpdate,
  photoUrl: string | undefined
): AccountProfileUpdate {
  // Only attach photoURL when we actually have one. An empty string must stay off the write.
  // vocab: ...update = copy every editor field, then override photoURL when present
  if (!photoUrl) {
    return { ...update };
  }

  return {
    ...update,
    photoURL: photoUrl,
  };
}

async function resolvePhotoUrlForSave(
  userId: string,
  currentPhotoUrl: string | undefined,
  photoFile: File | null
): Promise<string | undefined> {
  if (!photoFile) {
    return currentPhotoUrl;
  }

  // vocab: uploadProfilePhoto = put the file in Storage under this uid and return a download URL
  // vocab: await = wait for Storage before Firestore, so the saved photoURL is the new link
  return uploadProfilePhoto(userId, photoFile);
}

async function redirectIfAccountPageIsUnavailable(
  user: User | null,
  router: ReturnType<typeof useRouter>,
  setProfile: (profile: UserProfile) => void,
  setErrorMessage: (message: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> {
  // Not signed in — the account page is private.
  if (!user) {
    // vocab: router.replace = navigate without adding a history entry
    // Manipulate here: change LOGIN_PATH if the login route moves
    router.replace(LOGIN_PATH);
    return;
  }

  try {
    // vocab: getUserProfile = load users/{uid} from Firestore
    // vocab: uid = Firebase Auth user id (unique per Google account)
    const nextProfile = await getUserProfile(user.uid);
    // Profile missing or unfinished — finish onboarding before editing the account.
    // vocab: ?. = if nextProfile is null, skip the field
    // vocab / profile field: onboardingComplete = true after Finish on the wizard
    if (!nextProfile?.onboardingComplete) {
      // Manipulate here: change ONBOARDING_PATH if that route renames
      router.replace(ONBOARDING_PATH);
      return;
    }

    setProfile(nextProfile);
  } catch {
    setErrorMessage(PROFILE_LOAD_ERROR_MESSAGE);
  } finally {
    // Always hide the spinner once the auth check finishes.
    // vocab: finally = runs after try/catch either way
    setIsLoading(false);
  }
}

async function saveEditedAccountProfile(input: AccountSaveInput): Promise<void> {
  // vocab: auth.currentUser = whoever Firebase says is logged in right now (or null)
  const signedInUser = auth.currentUser;
  // Session expired mid-edit — bounce to login instead of writing as nobody.
  if (!signedInUser) {
    input.router.replace(LOGIN_PATH);
    return;
  }

  input.setIsSaving(true);
  input.setErrorMessage("");
  input.setSuccessMessage("");

  try {
    // Upload first so updateAccountProfile can store the final photoURL string.
    const photoUrl = await resolvePhotoUrlForSave(
      signedInUser.uid,
      input.update.photoURL,
      input.photoFile
    );
    // vocab: updateAccountProfile = merge these fields into users/{uid}
    // Does not flip onboardingComplete — Finish already did that.
    await updateAccountProfile(
      signedInUser.uid,
      buildAccountProfileWrite(input.update, photoUrl)
    );

    // Reload so view mode shows the fresh document, not the pre-save snapshot.
    const refreshedProfile = await getUserProfile(signedInUser.uid);
    if (refreshedProfile) {
      input.setProfile(refreshedProfile);
    }

    input.setIsEditing(false);
    input.setSuccessMessage(PROFILE_UPDATED_MESSAGE);
  } catch (thrownError) {
    // vocab: getAuthErrorMessage = turn Firebase errors into a friendly banner string
    input.setErrorMessage(getAuthErrorMessage(thrownError));
  } finally {
    input.setIsSaving(false);
  }
}

async function signOutAndReturnToLogin(router: ReturnType<typeof useRouter>): Promise<void> {
  // vocab: signOutUser = clear the Firebase session on this device
  // vocab: await = wait until the session is gone before we leave the page
  await signOutUser();
  // Manipulate here: change LOGIN_PATH if sign-out should land somewhere else
  router.replace(LOGIN_PATH);
}

// ===== MAIN COMPONENT =====

/**
 * Owns account state: loading, then view or edit, then save or sign out.
 * @returns The account page, a spinner, or a load-error banner
 */
export default function AccountPageContent() {
  // vocab: useRouter = Next.js helper that navigates without a full reload
  const router = useRouter();
  // vocab: useState = store a value and re-render when the setter is called
  // vocab: UserProfile | null = loaded Firestore profile, or null until it arrives
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Manipulate here: set true by default only while debugging the editor
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Auth gate — redirect if logged out or onboarding is incomplete.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void redirectIfAccountPageIsUnavailable(
        user,
        router,
        setProfile,
        setErrorMessage,
        setIsLoading
      );
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  const saveProfileChanges = (update: AccountProfileUpdate, photoFile: File | null) => {
    // Return the promise so the editor can wait until Storage and Firestore finish.
    return saveEditedAccountProfile({
      update,
      photoFile,
      router,
      setProfile,
      setIsEditing,
      setIsSaving,
      setErrorMessage,
      setSuccessMessage,
    });
  };

  const signOutFromAccount = () => {
    void signOutAndReturnToLogin(router);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="sign-in-spinner" />
        <p className="theme-muted text-sm">{LOADING_PROFILE_MESSAGE}</p>
      </div>
    );
  }

  // Auth succeeded but Firestore never returned a profile (rules or network).
  if (!profile) {
    return <div className="sign-in-error">{PROFILE_MISSING_MESSAGE}</div>;
  }

  return (
    <div className="account-page-content">
      {errorMessage ? <div className="sign-in-error">{errorMessage}</div> : null}
      {successMessage ? <div className="account-success-banner">{successMessage}</div> : null}

      {/* Profile stays under the editor popup; Edit opens the dialog instead of swapping pages. */}
      <AccountProfileView
        profile={profile}
        onEdit={() => setIsEditing(true)}
        onSignOut={signOutFromAccount}
      />
      {isEditing ? (
        <AccountProfileEditor
          profile={profile}
          saving={isSaving}
          onCancel={() => {
            // Leave edit mode without writing, and clear a leftover error from a failed save.
            setIsEditing(false);
            setErrorMessage("");
          }}
          onSave={saveProfileChanges}
        />
      ) : null}
    </div>
  );
}
