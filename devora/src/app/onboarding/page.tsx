// Multi-step onboarding form after signup. It saves the profile to Firestore.
// Flow: signed-in student hits /onboarding → wide auth layout → OnboardingForm saves.

// ===== IMPORTS =====

import OnboardingForm from "@/ui/account/onboarding/OnboardingForm";
import SignInPageLayout from "@/ui/auth/layout/SignInPageLayout";

// ===== MAIN COMPONENT =====

/**
 * The /onboarding page. Steps, checks, and the Firestore save live in OnboardingForm.
 */
export default function OnboardingPage() {
  return (
    // vocab: wide = give the multi-step form more horizontal room
    // Manipulate here: drop wide if the form should sit in the narrower auth column
    <SignInPageLayout wide>
      <OnboardingForm />
    </SignInPageLayout>
  );
}
