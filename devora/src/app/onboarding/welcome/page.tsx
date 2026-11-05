// First screen after onboarding finishes. It celebrates setup and points onward.
// Flow: onboarding finishes → /onboarding/welcome → WelcomeScreen shows next steps.

// ===== IMPORTS =====

import WelcomeScreen from "@/ui/account/onboarding/WelcomeScreen";

// ===== MAIN COMPONENT =====

/**
 * The /onboarding/welcome page. The celebration UI lives in WelcomeScreen.
 */
export default function OnboardingWelcomePage() {
  return <WelcomeScreen />;
}
