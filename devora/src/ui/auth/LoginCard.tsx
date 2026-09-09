// Login card where returning students enter school email and sign in with Google.
// This file owns the email field UI + local validation; the real auth work lives in sign-in-actions.
// Flow: type email → validate UMich → handleGoogleSignIn("login") → redirect (or show error).

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { isUmichEmail } from "@/backend/firebase";
import DevoraLogo from "@/ui/logo/DevoraLogo";
import GoogleButton from "./GoogleButton";
import { handleGoogleSignIn } from "./sign-in-actions";

// Email field + Google button for returning students.
export default function LoginCard() {
  // vocab: useRouter = Next.js helper that lets us navigate after a successful login
  // We pass this into handleGoogleSignIn so redirects happen from the shared helper.
  const router = useRouter();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // schoolEmail = controlled input value (what they typed). Checked before Google opens.
  const [schoolEmail, setSchoolEmail] = useState("");
  // error = red banner text under the header (empty string = banner hidden)
  const [error, setError] = useState("");
  // isLoading = true while Google popup / Firestore / redirect is running (disables inputs)
  const [isLoading, setIsLoading] = useState(false);

  // This handler is the heartbeat of the login card.
  // It validates locally, then hands off to the shared Google pipeline.
  async function onGoogleSignIn() {
    // Clear any leftover banner from a previous attempt.
    setError("");

    // Local gate — same UMich rule as signup / sign-in-actions.
    // Why check here AND in sign-in-actions? Instant feedback without opening the popup.
    // vocab: isUmichEmail = true only for @umich.edu or @umd.umich.edu
    // vocab/symbol: ! means NOT — this runs when the email is NOT Michigan
    // Manipulate here: tweak the error string for the banner; domain rules live in isUmichEmail
    if (!isUmichEmail(schoolEmail)) {
      setError("Enter your @umich.edu or @umd.umich.edu school email.");
      return;
    }

    setIsLoading(true);
    try {
      // vocab: handleGoogleSignIn = shared login+signup helper (popup → Firestore → redirect)
      // mode "login" = don’t require first/last name fields (signup does)
      // vocab: .trim() = strip spaces at the start/end so pasted emails still work
      await handleGoogleSignIn(router, "login", {
        schoolEmail: schoolEmail.trim(),
      });
      // On success we never reach here usefully — the helper already router.push’d away.
    } catch (err) {
      // Show the message thrown by sign-in-actions, or a generic fallback for weird throws.
      // vocab/symbol: instanceof Error = true when err is a real Error object with .message
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      // Always re-enable the button when the flow ends (success redirect OR fail).
      // vocab: finally = runs after try/catch either way — even if we threw
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header + logo — branding for the login card */}
      <header className="text-center">
        <h1 className="font-display logo-gradient text-2xl font-bold sm:text-3xl">
          Welcome to Devora!
        </h1>
        <div className="mx-auto mt-4 flex justify-center">
          <DevoraLogo size="nav" />
        </div>
        <p className="theme-muted mt-4 font-mono text-sm font-semibold">
          Pls Log in Here
        </p>
      </header>

      {/* Red error banner — only when error string is non-empty */}
      {error ? <div className="sign-in-error">{error}</div> : null}

      {/* School email field — controlled input bound to schoolEmail state */}
      {/* Manipulate here: change placeholder / autocomplete if you rename the field UX */}
      <input
        type="email"
        name="schoolEmail"
        placeholder="School email (@umich.edu)"
        className="sign-in-input"
        value={schoolEmail}
        onChange={(event) => setSchoolEmail(event.target.value)}
        autoComplete="email"
        inputMode="email"
        disabled={isLoading}
      />

      <p className="theme-muted text-center text-xs">
        Michigan school email only. Personal Gmail accounts are blocked.
      </p>

      {/* Google CTA — onClick starts onGoogleSignIn (login is NOT wrapped in <form>) */}
      {/* SignupCard uses type="submit" on a form instead; login uses plain onClick */}
      <GoogleButton onClick={onGoogleSignIn} loading={isLoading} disabled={isLoading} />

      {/* Link over to signup for brand-new students */}
      {/* Manipulate here: change href if the signup route moves */}
      <p className="theme-muted text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-[#ff5ca8] hover:text-[#22d3ee]">
          Sign up
        </Link>
      </p>
    </div>
  );
}
