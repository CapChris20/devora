// Signup form where new students enter name + school email, then sign in with Google.
// Local validation happens here; Firestore profile create + redirects live in sign-in-actions.
// Flow: names + email → validate → handleGoogleSignIn("signup") → usually /onboarding.

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { isUmichEmail } from "@/backend/firebase";
import DevoraLogo from "@/ui/logo/DevoraLogo";
import GoogleButton from "./GoogleButton";
import { handleGoogleSignIn } from "./sign-in-actions";

// Name + email fields, then Google signup for brand-new students.
export default function SignupCard() {
  // vocab: useRouter = Next.js helper that lets us navigate after a successful signup
  // Passed into handleGoogleSignIn so the shared helper can redirect.
  const router = useRouter();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // firstName / lastName are saved onto users/{uid} during the signup Google path
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // schoolEmail = what they typed (must be UMich before Google opens)
  const [schoolEmail, setSchoolEmail] = useState("");
  // error = red banner text (empty string = hidden)
  const [error, setError] = useState("");
  // isLoading = true while Google popup / profile create is running
  const [isLoading, setIsLoading] = useState(false);

  // This handler is the heartbeat of the signup form.
  // It validates names + email, then runs the shared Google pipeline in "signup" mode.
  // vocab: FormEvent = browser form submit event (Enter key or Google submit button)
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    // vocab/symbol: preventDefault — stop the browser from doing a full page reload on submit
    event.preventDefault();
    setError("");

    // Gate 1 — signup requires both names (they become profile.firstName / lastName).
    // vocab/symbol: || = OR — fail if either name is blank after trim
    // Manipulate here: drop this check only if you also stop requiring names in sign-in-actions
    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter your first and last name.");
      return;
    }

    // Gate 2 — same UMich rule as login (instant banner, no wasted Google popup).
    // vocab: isUmichEmail = true only for @umich.edu or @umd.umich.edu
    // vocab/symbol: ! means NOT — this runs when the email is NOT Michigan
    if (!isUmichEmail(schoolEmail)) {
      setError("Enter your @umich.edu or @umd.umich.edu school email.");
      return;
    }

    setIsLoading(true);
    try {
      // vocab: handleGoogleSignIn = shared login+signup helper (popup → Firestore → redirect)
      // mode "signup" tells the helper to save firstName/lastName onto users/{uid}
      // New accounts almost always land on /onboarding next (onboardingComplete is still false)
      await handleGoogleSignIn(router, "signup", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        schoolEmail: schoolEmail.trim(),
      });
    } catch (err) {
      // Show the message thrown by sign-in-actions, or a generic fallback.
      // vocab/symbol: instanceof Error = true when err is a real Error object with .message
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      // Always re-enable the form when the flow ends (success redirect OR fail).
      // vocab: finally = runs after try/catch either way
      setIsLoading(false);
    }
  }

  return (
    // vocab: onSubmit = runs onSubmit when the Google button (type="submit") is clicked or Enter
    // LoginCard uses onClick instead; signup uses a real <form> so Enter works in name fields
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {/* Welcome header + logo */}
      <header className="text-center">
        <h1 className="font-display logo-gradient text-2xl font-bold sm:text-3xl">
          Welcome to Devora!
        </h1>
        <div className="mx-auto mt-4 flex justify-center">
          <DevoraLogo size="nav" />
        </div>
        <p className="theme-muted mt-4 font-mono text-sm font-semibold">
          Pls Sign up Here
        </p>
      </header>

      {/* Red error banner — only when error string is non-empty */}
      {error ? <div className="sign-in-error">{error}</div> : null}

      {/* First + last name side by side on wider screens */}
      {/* Manipulate here: add middle name / preferred name by adding state + another input */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          className="sign-in-input"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          autoComplete="given-name"
          disabled={isLoading}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          className="sign-in-input"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          autoComplete="family-name"
          disabled={isLoading}
        />
      </div>

      {/* School email field — controlled input bound to schoolEmail state */}
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

      {/* type="submit" so the form onSubmit runs (includes Google popup) */}
      <GoogleButton type="submit" loading={isLoading} disabled={isLoading} />

      {/* Link over to login for returning students */}
      {/* Manipulate here: change href if the login route moves */}
      <p className="theme-muted text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[#ff5ca8] hover:text-[#22d3ee]">
          Log in
        </Link>
      </p>
    </form>
  );
}
