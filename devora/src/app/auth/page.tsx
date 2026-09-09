// /auth — redirects users straight to the login form at /auth/login.
// Flow: bare /auth has no UI → Next server redirect → /auth/login.

import { redirect } from "next/navigation";

// Server redirect: bare /auth has no UI, so send them to login.
// vocab: redirect = Next.js App Router helper that sends a 307 to another path
// Manipulate here: change "/auth/login" to "/auth/signup" if bare /auth should start signup
export default function AuthPage() {
  redirect("/auth/login");
}
