// Landing page for students who turned their account off in Settings.
// Flow: sign-in sees isDeactivated → this route → DeactivatedAccountScreen.

// ===== IMPORTS =====

import DeactivatedAccountScreen from "@/ui/auth/deactivated/DeactivatedAccountScreen";

// ===== MAIN COMPONENT =====

/**
 * The /auth/deactivated page. Reactivate and leave actions live in the screen component.
 */
export default function DeactivatedAccountPage() {
  return <DeactivatedAccountScreen />;
}
