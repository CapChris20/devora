// Post-onboarding welcome screen — greets the student by name.
// Links them to the Discovery Grid once the profile is confirmed complete.
// OnboardingForm router.push’s here after a successful Finish save.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires when user signs in or out
import { onAuthStateChanged } from "firebase/auth";

import { auth, getUserProfile } from "@/backend/firebase";
import SignInPageLayout from "./SignInPageLayout";

// Congrats screen after Finish onboarding — then CTA to Discovery.
export default function WelcomeScreen() {
  // vocab: useRouter = Next.js helper that lets us redirect if they shouldn't be here
  const router = useRouter();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // name = what we put in “Welcome, {name}!”
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Verify login and onboarding status; redirect if profile isn't complete.
  // Prevents someone from bookmarking /onboarding/welcome before finishing the form.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not signed in — send them to login.
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        // vocab: getUserProfile = load users/{uid} from Firestore
        const profile = await getUserProfile(user.uid);
        // Onboarding not finished yet — send them back to the form.
        // vocab/symbol: ?. = optional chaining — if profile is null, skip the field
        if (!profile?.onboardingComplete) {
          router.replace("/onboarding");
          return;
        }

        // Prefer displayName, then firstName, then a friendly fallback.
        // vocab/symbol: || = OR — use the first truthy name string
        // Manipulate here: change the "there" fallback for the greeting
        setName(profile.displayName || profile.firstName || "there");
      } finally {
        // Always hide the spinner once the auth check finishes.
        setIsLoading(false);
      }
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  // Spinner while we load the profile name.
  if (isLoading) {
    return (
      <SignInPageLayout>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="sign-in-spinner" />
        </div>
      </SignInPageLayout>
    );
  }

  // Welcome message + button into Discovery Grid.
  return (
    <SignInPageLayout>
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display headline-grad text-3xl font-bold">
          Welcome, {name}!
        </h1>
        <p className="theme-muted text-sm leading-relaxed">
          Your profile is live. Head to the Discovery Grid to find collaborators,
          study partners, and project teammates across CECS.
        </p>
        <Link
          href="/find-students"
          className="btn-neon font-display rounded-full px-10 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#14051c]"
        >
          Go to Discovery Grid
        </Link>
      </div>
    </SignInPageLayout>
  );
}
