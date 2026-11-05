// Login route. The shared auth chrome wraps the Google sign-in card.
// Flow: render SignInPageLayout → LoginCard (email field + Google button).

// ===== IMPORTS =====

import SignInPageLayout from "@/ui/auth/layout/SignInPageLayout";
import LoginCard from "@/ui/auth/login/LoginCard";

// ===== MAIN COMPONENT =====

/**
 * The /auth/login page. Google and Firestore work lives in LoginCard.
 */
export default function LoginPage() {
  // vocab: page.tsx = the Next.js file that owns this URL
  return (
    <SignInPageLayout>
      <LoginCard />
    </SignInPageLayout>
  );
}
