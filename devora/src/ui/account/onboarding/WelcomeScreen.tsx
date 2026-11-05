// Post-onboarding welcome screen — greets the student by name.
// Links them to the Discovery Grid once the profile is confirmed complete.
// OnboardingForm router.push’s here after a successful Finish save.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { LayoutGrid } from "lucide-react";

import { auth, getUserProfile, type UserProfile } from "@/backend/firebase";
import SignInPageLayout from "@/ui/auth/layout/SignInPageLayout";

// ===== NAMED CONSTANTS =====

const LOGIN_PATH = "/auth/login";
const ONBOARDING_PATH = "/onboarding";
const DISCOVERY_PATH = "/find-students";
const WELCOME_NAME_FALLBACK = "there";
const WELCOME_HEADING_PREFIX = "Welcome, ";
const WELCOME_BODY =
  "Your profile is live. Head to the Discovery Grid to find friends, colleagues, and people in your career niche across CECS.";
const DISCOVERY_BUTTON_LABEL = "Go find your people";

// ===== HELPER FUNCTIONS =====

function readWelcomeName(profile: UserProfile): string {
  // Prefer displayName, then firstName, then a friendly fallback.
  // vocab: || = use the first truthy name string
  // Manipulate here: change WELCOME_NAME_FALLBACK if the greeting should say something else
  return profile.displayName || profile.firstName || WELCOME_NAME_FALLBACK;
}

async function loadWelcomeNameForSignedInStudent(
  user: User | null,
  router: ReturnType<typeof useRouter>,
  setWelcomeName: (welcomeName: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> {
  // Not signed in — send them to login.
  if (!user) {
    router.replace(LOGIN_PATH);
    return;
  }

  try {
    // vocab: getUserProfile = load users/{uid} from Firestore
    const profile = await getUserProfile(user.uid);
    // Bookmarking this page before Finish should bounce back to the form.
    // vocab: ?. = if profile is null, skip the field
    // vocab / profile field: onboardingComplete = true after Finish on the wizard
    if (!profile?.onboardingComplete) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    setWelcomeName(readWelcomeName(profile));
  } finally {
    // Always hide the spinner once the auth check finishes.
    // vocab: finally = runs after try/catch either way
    setIsLoading(false);
  }
}

// ===== MAIN COMPONENT =====

/**
 * Congrats screen after Finish onboarding, then a link into Discovery.
 * @returns The welcome card, or a spinner while the profile name loads
 */
export default function WelcomeScreen() {
  // vocab: useRouter = Next.js helper that lets us redirect if they should not be here
  const router = useRouter();
  // vocab: useState = store a value and re-render when the setter is called
  const [welcomeName, setWelcomeName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Verify login and onboarding status; redirect if the profile is not complete.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // vocab: async = this check waits on Firestore before we paint the name
      void loadWelcomeNameForSignedInStudent(user, router, setWelcomeName, setIsLoading);
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  if (isLoading) {
    return (
      <SignInPageLayout>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="sign-in-spinner" />
        </div>
      </SignInPageLayout>
    );
  }

  return (
    <SignInPageLayout>
      <div className="flex flex-col items-center gap-6 text-center py-4">
        <h1 className="welcome-heading">
          {`${WELCOME_HEADING_PREFIX}${welcomeName}!`}
        </h1>
        <p className="welcome-body">{WELCOME_BODY}</p>
        <Link
          href={DISCOVERY_PATH}
          className="btn-primary welcome-cta"
        >
          <LayoutGrid size={20} />
          <span>{DISCOVERY_BUTTON_LABEL}</span>
        </Link>
      </div>

      <style jsx>{`
        .welcome-heading {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.1;
          text-transform: uppercase;
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .welcome-body {
          font-size: 16.5px;
          line-height: 1.55;
          color: var(--text-body, #e8dde2);
          max-width: 44ch;
          margin: 0;
        }

        :global(.welcome-cta) {
          min-height: 54px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding-inline: 32px;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: 700;
          margin-top: 8px;
        }
      `}</style>
    </SignInPageLayout>
  );
}
