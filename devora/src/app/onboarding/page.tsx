// Multi-step onboarding form after signup — saves profile to Firestore.
// Flow: signed-in student hits /onboarding → wide auth layout → OnboardingForm saves.

import OnboardingForm from "@/ui/auth/OnboardingForm";
import SignInPageLayout from "@/ui/auth/SignInPageLayout";

// Thin route: wide auth layout + OnboardingForm (steps + save).
// vocab: wide = give the multi-step form more horizontal room
// vocab: Firestore = database where the finished profile is written
// Manipulate here: drop `wide` if the form should sit in the narrower auth column
export default function OnboardingPage() {
  return (
    <SignInPageLayout wide>
      {/* Steps, validation, and saveOnboardingProfile live in OnboardingForm */}
      <OnboardingForm />
    </SignInPageLayout>
  );
}
