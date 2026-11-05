// Bare /auth has no screen of its own, so it sends people to the login form.
// Flow: browser hits /auth → Next server redirect → /auth/login.

// ===== IMPORTS =====

import { redirect } from "next/navigation";

// ===== NAMED CONSTANTS =====

// Manipulate here: change this to "/auth/signup" if bare /auth should start signup.
const LOGIN_PATH = "/auth/login";

// ===== MAIN COMPONENT =====

/**
 * Server redirect from /auth to the login form.
 * @returns Never renders. Next sends the browser to /auth/login.
 */
export default function AuthPage() {
  // vocab: redirect = Next.js helper that sends the browser to another path
  redirect(LOGIN_PATH);
}
