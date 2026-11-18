// Signup form where new students enter a name and school email, then sign in with Google.
// Local checks happen here. Creating the Firestore profile and redirecting live in sign-in-actions.
// Flow: names + email → consent → validate → handleGoogleSignIn("signup") → usually /onboarding.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, ShieldCheck, User } from "lucide-react";

import { isUmichEmail } from "@/backend/firebase";
import DevoraLogo from "@/ui/shared/logo/DevoraLogo";
import GoogleButton from "../google/GoogleButton";
import {
  handleGoogleSignIn,
  MICHIGAN_EMAIL_REQUIRED_MESSAGE,
  readThrownErrorMessage,
  SIGNUP_NAME_REQUIRED_MESSAGE,
} from "../sign-in-actions";

// ===== NAMED CONSTANTS =====

const SIGNUP_HEADING = "Welcome to Devora!";
const SIGNUP_SUBHEADING = "Join the Michigan student developer network";
const SCHOOL_EMAIL_PLACEHOLDER = "uniqname@umich.edu";
const LOGIN_PATH = "/auth/login";
const TERMS_PATH = "/terms-page";
const PRIVACY_PATH = "/privacy-page";
const SIGNUP_MODE = "signup" as const;
const CONSENT_REQUIRED_MESSAGE =
  "Please agree to the Terms of Service and Privacy Policy to continue.";
const FIRST_NAME_LABEL = "First Name";
const LAST_NAME_LABEL = "Last Name";
const SCHOOL_EMAIL_LABEL = "School Email";
const CONSENT_CHECKBOX_ID = "signup-terms-consent";
const CONSENT_ROW_CLASS = "flex items-start gap-3 text-left";
const CONSENT_CHECKBOX_CLASS =
  "mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-white focus:ring-white dark:border-white/40 dark:bg-black/60 accent-[#0a0a0a] dark:accent-white cursor-pointer";
const CONSENT_TEXT_CLASS = "sign-in-consent-text select-none cursor-pointer";
const CONSENT_LINK_CLASS =
  "font-semibold text-white underline underline-offset-2 hover:opacity-80 transition-opacity";

// ===== HELPER FUNCTIONS =====

type SignupSignInInput = {
  router: ReturnType<typeof useRouter>;
  firstName: string;
  lastName: string;
  schoolEmail: string;
  hasAcceptedTerms: boolean;
  setErrorMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
};

function readSignupValidationError(
  firstName: string,
  lastName: string,
  schoolEmail: string,
  hasAcceptedTerms: boolean
): string {
  const hasBothNames = Boolean(firstName.trim()) && Boolean(lastName.trim());
  if (!hasBothNames) {
    return SIGNUP_NAME_REQUIRED_MESSAGE;
  }

  // vocab: isUmichEmail = true only for @umich.edu or @umd.umich.edu
  if (!isUmichEmail(schoolEmail)) {
    return MICHIGAN_EMAIL_REQUIRED_MESSAGE;
  }

  if (!hasAcceptedTerms) {
    return CONSENT_REQUIRED_MESSAGE;
  }

  return "";
}

async function signUpNewStudentWithGoogle(input: SignupSignInInput): Promise<void> {
  input.setErrorMessage("");

  const validationError = readSignupValidationError(
    input.firstName,
    input.lastName,
    input.schoolEmail,
    input.hasAcceptedTerms
  );
  if (validationError) {
    input.setErrorMessage(validationError);
    return;
  }

  input.setIsLoading(true);
  try {
    // "signup" tells the helper to save the typed names onto users/{uid}
    await handleGoogleSignIn(input.router, SIGNUP_MODE, {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      schoolEmail: input.schoolEmail.trim(),
    });
  } catch (thrownValue) {
    input.setErrorMessage(readThrownErrorMessage(thrownValue));
  } finally {
    // vocab: finally = runs after try/catch either way
    input.setIsLoading(false);
  }
}

// ===== MAIN COMPONENT =====

/**
 * Name and email fields, consent checkbox, then Google signup for a new student.
 */
export default function SignupCard() {
  // vocab: useRouter = Next.js helper that navigates after a successful signup
  const router = useRouter();
  // vocab: useState = store a value and re-render when the setter is called
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // vocab: FormEvent = the browser event from pressing Enter or the submit button
  const submitSignupForm = (event: FormEvent<HTMLFormElement>) => {
    // vocab: preventDefault = stop the browser from reloading the whole page
    event.preventDefault();
    void signUpNewStudentWithGoogle({
      router,
      firstName,
      lastName,
      schoolEmail,
      hasAcceptedTerms,
      setErrorMessage,
      setIsLoading,
    });
  };

  return (
    // Signup uses a real form so Enter works in the name fields. Login uses onClick instead.
    <form className="flex flex-col gap-5 sm:gap-6" onSubmit={submitSignupForm}>
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
          {SIGNUP_HEADING}
        </h1>
        <p className="sign-in-subheading mt-1.5">
          {SIGNUP_SUBHEADING}
        </p>
      </header>

      {/* Segmented Mode Switcher */}
      <nav aria-label="Auth tabs" className="sign-in-tab-nav grid grid-cols-2 gap-1">
        <Link href={LOGIN_PATH} className="sign-in-tab-btn">
          Log In
        </Link>
        <span className="sign-in-tab-btn active cursor-default" aria-current="page">
          Sign Up
        </span>
      </nav>

      {/* Error Banner */}
      {errorMessage ? (
        <div className="sign-in-error" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
          <span className="flex-1 font-medium">{errorMessage}</span>
        </div>
      ) : null}

      {/* Name Fields Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-left">
        <div className="space-y-1.5">
          <label
            htmlFor="signup-first-name"
            className="sign-in-field-label"
          >
            {FIRST_NAME_LABEL}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              id="signup-first-name"
              type="text"
              name="firstName"
              placeholder="First name"
              className="sign-in-input pl-10"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-last-name"
            className="sign-in-field-label"
          >
            {LAST_NAME_LABEL}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              id="signup-last-name"
              type="text"
              name="lastName"
              placeholder="Last name"
              className="sign-in-input pl-10"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              disabled={isLoading}
              required
            />
          </div>
        </div>
      </div>

      {/* School Email Field */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="signup-school-email"
          className="sign-in-field-label"
        >
          {SCHOOL_EMAIL_LABEL}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="signup-school-email"
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

      {/* Affirmative consent before Google creates the account */}
      <div className={CONSENT_ROW_CLASS}>
        <input
          id={CONSENT_CHECKBOX_ID}
          type="checkbox"
          className={CONSENT_CHECKBOX_CLASS}
          checked={hasAcceptedTerms}
          onChange={(event) => setHasAcceptedTerms(event.target.checked)}
          disabled={isLoading}
          required
        />
        <label htmlFor={CONSENT_CHECKBOX_ID} className={CONSENT_TEXT_CLASS}>
          I agree to the{" "}
          <Link href={TERMS_PATH} className={CONSENT_LINK_CLASS}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href={PRIVACY_PATH} className={CONSENT_LINK_CLASS}>
            Privacy Policy
          </Link>
          . Devora only uses my Michigan email and the profile details I choose to share.
        </label>
      </div>

      {/* Google Action Button */}
      <GoogleButton type="submit" isLoading={isLoading} isDisabled={isLoading} />

      {/* Bottom Switch Link */}
      <p className="sign-in-footer-text text-center">
        Already have an account?{" "}
        <Link
          href={LOGIN_PATH}
          className="font-semibold text-[#ff5ca8] transition-colors hover:text-[#22d3ee] underline underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
