// Login landing for students who deactivated their account in Settings.
// Flow: route mounts → DeactivatedAccountScreen (reactivate / leave UI).

import DeactivatedAccountScreen from "@/ui/auth/DeactivatedAccountScreen";

// Thin route: reactivate / leave UI lives in DeactivatedAccountScreen.
// vocab: page.tsx = Next.js App Router file that owns the /auth/deactivated URL
// Sign-in flow sends isDeactivated profiles here (see sign-in-actions.ts)
export default function DeactivatedAccountPage() {
  return <DeactivatedAccountScreen />;
}
