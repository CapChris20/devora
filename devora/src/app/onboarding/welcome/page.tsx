// First screen after onboarding completes — celebrates setup and points users onward.
// Flow: onboarding finishes → /onboarding/welcome → WelcomeScreen shows next steps.

import WelcomeScreen from "@/ui/account/onboarding/WelcomeScreen";

// Thin route: welcome UI lives entirely in WelcomeScreen.
// vocab: page.tsx = Next.js App Router file that owns the /onboarding/welcome URL
export default function OnboardingWelcomePage() {
  return <WelcomeScreen />;
}
