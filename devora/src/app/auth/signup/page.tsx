// Sign-up route. Collects a name and Michigan email before Google account creation.
// Flow: render SignInPageLayout → SignupCard (name, email, Google button).

// ===== IMPORTS =====

import SignInPageLayout from "@/ui/auth/layout/SignInPageLayout";
import SignupCard from "@/ui/auth/signup/SignupCard";

// ===== MAIN COMPONENT =====

/**
 * The /auth/signup page. Google and Firestore work lives in SignupCard.
 */
export default function SignupPage() {
  return (
    <SignInPageLayout>
      <SignupCard />
    </SignInPageLayout>
  );
}
