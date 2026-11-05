// Login card where returning students enter a school email and sign in with Google.
// This file owns the email field and the local check. The real auth work lives in sign-in-actions.
// Flow: type email → check Michigan → handleGoogleSignIn("login") → redirect, or show the banner.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { isUmichEmail } from "@/backend/firebase";
import DevoraLogo from "@/ui/shared/logo/DevoraLogo";
import GoogleButton from "../google/GoogleButton";
import {
  handleGoogleSignIn,
  MICHIGAN_EMAIL_REQUIRED_MESSAGE,
  readThrownErrorMessage,
} from "../sign-in-actions";

// ===== NAMED CONSTANTS =====

const LOGIN_HEADING = "Welcome to Devora!";
const LOGIN_SUBHEADING = "Please Log in Here!";
const SCHOOL_EMAIL_PLACEHOLDER = "School email (@umich.edu)";
const MICHIGAN_EMAIL_HINT = "Michigan school email only. Personal Gmail accounts are blocked.";
const SIGNUP_PATH = "/auth/signup";
const LOGIN_MODE = "login" as const;

// ===== HELPER FUNCTIONS =====

type LoginSignInInput = {
  router: ReturnType<typeof useRouter>;
  schoolEmail: string;
  setErrorMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
};

async function signInReturningStudentWithGoogle(input: LoginSignInInput): Promise<void> {
  input.setErrorMessage("");

  // Checked here and again in sign-in-actions so a bad email fails before the popup opens.
  // vocab: isUmichEmail = true only for @umich.edu or @umd.umich.edu
  if (!isUmichEmail(input.schoolEmail)) {
    input.setErrorMessage(MICHIGAN_EMAIL_REQUIRED_MESSAGE);
    return;
  }

  input.setIsLoading(true);
  try {
    // vocab: handleGoogleSignIn = popup → Firestore → redirect
    // "login" does not require first and last name fields
    await handleGoogleSignIn(input.router, LOGIN_MODE, {
      schoolEmail: input.schoolEmail.trim(),
    });
  } catch (thrownValue) {
    input.setErrorMessage(readThrownErrorMessage(thrownValue));
  } finally {
    // vocab: finally = runs after try/catch either way, including a successful redirect
    input.setIsLoading(false);
  }
}

// ===== MAIN COMPONENT =====

/**
 * Email field and Google button for a student who already has an account.
 */
export default function LoginCard() {
  // vocab: useRouter = Next.js helper that navigates after a successful login
  const router = useRouter();
  // vocab: useState = store a value and re-render when the setter is called
  const [schoolEmail, setSchoolEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startGoogleSignIn = () => {
    void signInReturningStudentWithGoogle({
      router,
      schoolEmail,
      setErrorMessage,
      setIsLoading,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display logo-gradient text-2xl font-bold sm:text-3xl">
          {LOGIN_HEADING}
        </h1>
        <div className="mx-auto mt-4 flex justify-center">
          <DevoraLogo size="nav" />
        </div>
        <p className="theme-muted mt-4 font-mono text-sm font-semibold">{LOGIN_SUBHEADING}</p>
      </header>

      {errorMessage ? <div className="sign-in-error">{errorMessage}</div> : null}

      {/* Manipulate here: change the placeholder if the email field wording changes */}
      <input
        type="email"
        name="schoolEmail"
        placeholder={SCHOOL_EMAIL_PLACEHOLDER}
        className="sign-in-input"
        value={schoolEmail}
        onChange={(event) => setSchoolEmail(event.target.value)}
        autoComplete="email"
        inputMode="email"
        disabled={isLoading}
      />

      <p className="theme-muted text-center text-xs">{MICHIGAN_EMAIL_HINT}</p>

      {/* Login uses onClick. Signup uses a form submit instead. */}
      <GoogleButton onClick={startGoogleSignIn} isLoading={isLoading} isDisabled={isLoading} />

      {/* Manipulate here: change SIGNUP_PATH if the signup route moves */}
      <p className="theme-muted text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href={SIGNUP_PATH} className="font-semibold text-[#ff5ca8] hover:text-[#22d3ee]">
          Sign up
        </Link>
      </p>
    </div>
  );
}
