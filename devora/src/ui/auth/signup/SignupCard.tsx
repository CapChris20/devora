// Signup card for new students: one tap on Google, no form fields.
// Names come from the Google profile (sign-in-actions); onboarding lets them edit everything next.
// All the UI lives in GoogleAuthCard; this file only picks the "signup" mode.

"use client";

import GoogleAuthCard from "../google/GoogleAuthCard";

/**
 * One-click Google signup card.
 */
export default function SignupCard() {
  return <GoogleAuthCard mode="signup" />;
}
