// Keeps a page private: same rule as the Account and Discovery Grid pages.
// Flow: wait for Firebase Auth → signed out? go to login → onboarding unfinished? go to onboarding → show page.
// Used by DesignLawPage, so Activity Center, Messages and Connections are all signed-in only.

"use client";

// ===== IMPORTS =====

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires once on load and again on sign in/out
import { onAuthStateChanged } from "firebase/auth";

import { auth, getUserProfile } from "@/backend/firebase";

// ===== NAMED CONSTANTS =====

// Manipulate here: match these if the login or onboarding routes are renamed
const LOGIN_PATH = "/auth/login";
const ONBOARDING_PATH = "/onboarding";

// ===== MAIN COMPONENT =====

/**
 * Renders children only for a signed-in student who finished onboarding.
 * @param props.children - The page content
 */
export default function SignedInGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // vocab: isCancelled = set in cleanup so a late Firestore reply can't update an unmounted page
    let isCancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not signed in — these pages are private.
      if (!user) {
        // vocab: router.replace = navigate without leaving this page in the back history
        router.replace(LOGIN_PATH);
        return;
      }

      try {
        // vocab: getUserProfile = load users/{uid} from Firestore
        const profile = await getUserProfile(user.uid);
        if (isCancelled) return;
        // Finish the onboarding wizard first (major, year, interests…) — these pages depend on it.
        if (!profile?.onboardingComplete) {
          router.replace(ONBOARDING_PATH);
          return;
        }
        setIsAllowed(true);
      } catch {
        // Profile read failed (offline, rules). Send to login rather than show a broken page.
        if (!isCancelled) router.replace(LOGIN_PATH);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [router]);

  // Skeleton blocks while auth resolves — same shape as content, so nothing jumps when it arrives.
  if (!isAllowed) {
    return (
      <div role="status" aria-label="Checking your sign-in" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-48 rounded-nb border-nb border-nb-ink/20 bg-nb-white motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  }

  return <>{children}</>;
}
