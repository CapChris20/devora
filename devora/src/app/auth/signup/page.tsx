// Sign-up route — collects name and Michigan email before Google account creation.
// Flow: render SignInPageLayout chrome → SignupCard (name, email, Google button).

import SignInPageLayout from "@/ui/auth/layout/SignInPageLayout";
import SignupCard from "@/ui/auth/signup/SignupCard";

// Thin route: auth chrome + SignupCard (name, email, Google button).
// vocab: page.tsx = Next.js App Router file that owns the /auth/signup URL
// Real Google / Firestore logic lives in SignupCard → sign-in-actions.ts
export default function SignupPage() {
  return (
    <SignInPageLayout>
      <SignupCard />
    </SignInPageLayout>
  );
}
