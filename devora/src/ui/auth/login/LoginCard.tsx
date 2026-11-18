// Login card where returning students enter a school email and sign in with Google.
// This file owns the email field and the local check. The real auth work lives in sign-in-actions.
// Flow: type email → check Michigan → handleGoogleSignIn("login") → redirect, or show the banner.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, ShieldCheck } from "lucide-react";

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
const LOGIN_SUBHEADING = "Sign in to connect with Michigan students";
const SCHOOL_EMAIL_LABEL = "School Email";
const SCHOOL_EMAIL_PLACEHOLDER = "uniqname@umich.edu";
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
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Brand Header */}
      <header className="flex flex-col items-center text-center">
        <div className="relative mb-2 flex items-center justify-center">
          <div
            className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#ff5ca8]/35 via-[#22d3ee]/25 to-[#a855f7]/30 blur-md opacity-70"
            aria-hidden
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-2 shadow-inner backdrop-blur-md dark:border-white/15 dark:bg-black/35">
            <DevoraLogo size="nav" />
          </div>
        </div>

        <h1 className="font-display logo-gradient text-2xl font-extrabold tracking-tight sm:text-3xl">
          {LOGIN_HEADING}
        </h1>
        <p className="sign-in-subheading mt-1.5">
          {LOGIN_SUBHEADING}
        </p>
      </header>

      {/* Segmented Mode Switcher */}
      <nav aria-label="Auth tabs" className="sign-in-tab-nav grid grid-cols-2 gap-1">
        <span className="sign-in-tab-btn active cursor-default" aria-current="page">
          Log In
        </span>
        <Link href={SIGNUP_PATH} className="sign-in-tab-btn">
          Sign Up
        </Link>
      </nav>

      {/* Error Banner */}
      {errorMessage ? (
        <div className="sign-in-error" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
          <span className="flex-1 font-medium">{errorMessage}</span>
        </div>
      ) : null}

      {/* School Email Field */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="login-school-email"
          className="sign-in-field-label"
        >
          {SCHOOL_EMAIL_LABEL}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="login-school-email"
            type="email"
            name="schoolEmail"
            placeholder={SCHOOL_EMAIL_PLACEHOLDER}
            className="sign-in-input pl-10"
            value={schoolEmail}
            onChange={(event) => setSchoolEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      {/* Michigan Email Notice Callout */}
      <div className="sign-in-hint-badge">
        <ShieldCheck className="h-4 w-4 shrink-0 text-sky-600 dark:text-cyan-400" />
        <span className="leading-snug">
          <strong>@umich.edu</strong> only • Personal Gmail accounts are blocked
        </span>
      </div>

      {/* Google Action Button */}
      <GoogleButton onClick={startGoogleSignIn} isLoading={isLoading} isDisabled={isLoading} />

      {/* Bottom Switch Link */}
      <p className="sign-in-footer-text text-center">
        Don&apos;t have an account?{" "}
        <Link
          href={SIGNUP_PATH}
          className="font-semibold text-[#ff5ca8] transition-colors hover:text-[#22d3ee] underline underline-offset-2"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
