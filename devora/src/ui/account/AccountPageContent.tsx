// Account page brain — check login, load the Firestore profile, toggle view/edit, save changes.
// Sign-out lives on the left column under Age / Gender when the profile is in view mode.
// Child components stay free of Firebase writes: the editor drafts fields, and this file saves them.

"use client";

// ===== IMPORTS =====

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
const LOADING_PROFILE_MESSAGE = "Loading your profile…";
const PROFILE_UPDATED_MESSAGE = "Profile updated.";

// Fallback preview profile so account page and its neo-brutalist shaders render instantly
// without aggressively kicking unauthenticated visitors to login
const DEMO_ACCOUNT_PROFILE: UserProfile = {
  email: "cshina@umich.edu",
  firstName: "Christian",
  lastName: "Shina",
  displayName: "Christian Shina",
  classRank: "Senior",
  gender: "Male",
  age: "21",
  major: "Computer & Information Science",
  careerNiche: ["Full-Stack Development", "Computer Graphics & Shaders", "AI / ML"],
  hasExperience: true,
  experienceDetails: "Building high-performance web applications, GLSL visualizers, and campus networking platforms.",
  casualInterests: ["Shadertoy", "Hackathons", "Campus Leadership", "Gaming"],
  aboutYou: ["CECS Student", "Undergrad Researcher", "Dean's List"],
  religion: "Chaldean Catholic",
  signupReason: ["Network with CECS peers", "Find study groups", "Build tech projects"],
  bio: "Senior Computer Science student at University of Michigan-Dearborn CECS. Passionate about creative computing, modern web architecture, and neo-brutalist digital experiences.",
  photoURL: "",
  links: {
    github: "https://github.com/CapChris20",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },
  school: "University of Michigan - Dearborn",
  isPublic: true,
  onboardingComplete: true,
};

// ===== TYPES =====

type AccountSaveInput = {
  update: AccountProfileUpdate;
  photoFile: File | null;
  router: ReturnType<typeof useRouter>;
  profile: UserProfile | null;
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

  return uploadProfilePhoto(userId, photoFile);
}

async function loadProfileOrPreview(
  user: User | null,
  router: ReturnType<typeof useRouter>,
  setProfile: (profile: UserProfile) => void,
  setErrorMessage: (message: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> {
  // If not signed in on this client, render the preview profile so the account UI
  // and Shane's shader are immediately viewable without an instant bounce
  if (!user) {
    setProfile(DEMO_ACCOUNT_PROFILE);
    setIsLoading(false);
    return;
  }

  try {
    const nextProfile = await getUserProfile(user.uid);
    if (!nextProfile?.onboardingComplete) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    setProfile(nextProfile);
  } catch {
    setErrorMessage(PROFILE_LOAD_ERROR_MESSAGE);
    setProfile(DEMO_ACCOUNT_PROFILE);
  } finally {
    setIsLoading(false);
  }
}

async function saveEditedAccountProfile(input: AccountSaveInput): Promise<void> {
  const signedInUser = auth.currentUser;

  // If in demo preview mode, simulate save locally
  if (!signedInUser) {
    input.setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (input.profile) {
      input.setProfile({
        ...input.profile,
        ...input.update,
      });
    }
    input.setIsSaving(false);
    input.setIsEditing(false);
    input.setSuccessMessage("Profile updated (Preview mode · Sign in to sync changes).");
    return;
  }

  input.setIsSaving(true);
  input.setErrorMessage("");
  input.setSuccessMessage("");

  try {
    const photoUrl = await resolvePhotoUrlForSave(
      signedInUser.uid,
      input.update.photoURL,
      input.photoFile
    );
    await updateAccountProfile(
      signedInUser.uid,
      buildAccountProfileWrite(input.update, photoUrl)
    );

    const refreshedProfile = await getUserProfile(signedInUser.uid);
    if (refreshedProfile) {
      input.setProfile(refreshedProfile);
    }

    input.setIsEditing(false);
    input.setSuccessMessage(PROFILE_UPDATED_MESSAGE);
  } catch (thrownError) {
    input.setErrorMessage(getAuthErrorMessage(thrownError));
  } finally {
    input.setIsSaving(false);
  }
}

async function signOutAndReturnToLogin(router: ReturnType<typeof useRouter>): Promise<void> {
  if (auth.currentUser) {
    await signOutUser();
  }
  router.push(LOGIN_PATH);
}

// ===== MAIN COMPONENT =====

/**
 * Owns account state: loading, then view or edit, then save or sign out.
 * @returns The account page, a spinner, or a load-error banner
 */
export default function AccountPageContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(Boolean(user));
      void loadProfileOrPreview(
        user,
        router,
        setProfile,
        setErrorMessage,
        setIsLoading
      );
    });

    return unsubscribe;
  }, [router]);

  const saveProfileChanges = (update: AccountProfileUpdate, photoFile: File | null) => {
    return saveEditedAccountProfile({
      update,
      photoFile,
      router,
      profile,
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

  if (!profile) {
    return <div className="sign-in-error">Could not load account profile.</div>;
  }

  return (
    <div className="account-page-content">
      {!isSignedIn ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-[2.5px] border-[#0a0a0a] dark:border-white/20 bg-white dark:bg-[#120a1f] px-4 py-3 shadow-[4px_4px_0px_#0a0a0a] dark:shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-neutral-200">
              Account Profile Preview · Shane Voronoi Kaleidoscope Tunnel Shader Active
            </span>
          </div>
          <Link
            href={LOGIN_PATH}
            className="inline-flex items-center gap-1.5 rounded-[6px] border-[2px] border-[#0a0a0a] dark:border-white bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] transition-transform hover:-translate-y-0.5"
          >
            Sign In with UMich →
          </Link>
        </div>
      ) : null}

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
            setIsEditing(false);
            setErrorMessage("");
          }}
          onSave={saveProfileChanges}
        />
      ) : null}
    </div>
  );
}
