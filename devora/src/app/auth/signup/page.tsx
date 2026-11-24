// Sign-up route. One click on Google creates the account; names come from the Google profile.
// Flow: render SignInPageLayout (bare) → SignupCard (one-click Google poster card).

// ===== IMPORTS =====

import SignInPageLayout from "@/ui/auth/layout/SignInPageLayout";
import SignupCard from "@/ui/auth/signup/SignupCard";

// ===== MAIN COMPONENT =====

/**
 * The /auth/signup page. Google and Firestore work lives in SignupCard.
 */
export default function SignupPage() {
  return (
    <SignInPageLayout bare>
      <SignupCard />
    </SignInPageLayout>
  );
}
