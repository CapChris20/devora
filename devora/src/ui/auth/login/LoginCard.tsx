// Login card for returning students: one tap on Google, no form fields.
// All the UI lives in GoogleAuthCard; this file only picks the "login" mode.

"use client";

import GoogleAuthCard from "../google/GoogleAuthCard";

/**
 * One-click Google login card.
 */
export default function LoginCard() {
  return <GoogleAuthCard mode="login" />;
}
