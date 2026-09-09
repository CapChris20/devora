// Login route — Google sign-in card inside the shared auth layout.
// Flow: render SignInPageLayout chrome → LoginCard (email hint + Google button).

import SignInPageLayout from "@/ui/auth/SignInPageLayout";
import LoginCard from "@/ui/auth/LoginCard";

// Thin route: auth chrome + LoginCard (email hint + Google button).
// vocab: page.tsx = Next.js App Router file that owns the /auth/login URL
// Real Google / Firestore logic lives in LoginCard → sign-in-actions.ts
export default function LoginPage() {
  return (
    <SignInPageLayout>
      <LoginCard />
    </SignInPageLayout>
  );
}
