// Signup form where new students enter a name and school email, then sign in with Google.
// Local checks happen here. Creating the Firestore profile and redirecting live in sign-in-actions.
// Flow: names + email → consent → validate → handleGoogleSignIn("signup") → usually /onboarding.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
const SIGNUP_SUBHEADING = "Please Sign up Here!";
const SCHOOL_EMAIL_PLACEHOLDER = "School email (@umich.edu)";
const MICHIGAN_EMAIL_HINT = "Michigan school email only. Personal Gmail accounts are blocked.";
const LOGIN_PATH = "/auth/login";
const TERMS_PATH = "/terms-page";
const PRIVACY_PATH = "/privacy-page";
const SIGNUP_MODE = "signup" as const;
const CONSENT_REQUIRED_MESSAGE =
  "Please agree to the Terms of Service and Privacy Policy to continue.";
const FIRST_NAME_LABEL = "First name";
const LAST_NAME_LABEL = "Last name";
const SCHOOL_EMAIL_LABEL = "School email";
const CONSENT_CHECKBOX_ID = "signup-terms-consent";
const FIELD_LABEL_CLASS = "sr-only";
const CONSENT_ROW_CLASS = "flex items-start gap-3 text-left";
const CONSENT_CHECKBOX_CLASS = "mt-1 h-4 w-4 shrink-0 accent-[#ff5ca8]";
const CONSENT_TEXT_CLASS = "theme-muted text-xs leading-relaxed sm:text-sm";
const CONSENT_LINK_CLASS = "font-semibold text-[#ff5ca8] hover:text-[#22d3ee]";

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
    <form className="flex flex-col gap-6" onSubmit={submitSignupForm}>
      <header className="text-center">
        <h1 className="font-display logo-gradient text-2xl font-bold sm:text-3xl">
          {SIGNUP_HEADING}
        </h1>
        <div className="mx-auto mt-4 flex justify-center">
          <DevoraLogo size="nav" />
        </div>
        <p className="theme-muted mt-4 font-mono text-sm font-semibold">{SIGNUP_SUBHEADING}</p>
      </header>

      {errorMessage ? <div className="sign-in-error">{errorMessage}</div> : null}

      {/* Manipulate here: add a preferred-name field by adding state and another input */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-first-name" className={FIELD_LABEL_CLASS}>
            {FIRST_NAME_LABEL}
          </label>
          <input
            id="signup-first-name"
            type="text"
            name="firstName"
            placeholder={FIRST_NAME_LABEL}
            className="sign-in-input"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="signup-last-name" className={FIELD_LABEL_CLASS}>
            {LAST_NAME_LABEL}
          </label>
          <input
            id="signup-last-name"
            type="text"
            name="lastName"
            placeholder={LAST_NAME_LABEL}
            className="sign-in-input"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="signup-school-email" className={FIELD_LABEL_CLASS}>
          {SCHOOL_EMAIL_LABEL}
        </label>
        <input
          id="signup-school-email"
          type="email"
          name="schoolEmail"
          placeholder={SCHOOL_EMAIL_PLACEHOLDER}
          className="sign-in-input"
          value={schoolEmail}
          onChange={(event) => setSchoolEmail(event.target.value)}
          autoComplete="email"
          inputMode="email"
          disabled={isLoading}
          required
        />
      </div>

      <p className="theme-muted text-center text-xs">{MICHIGAN_EMAIL_HINT}</p>

      {/* Affirmative consent before Google creates the account. Keyboard: Tab to checkbox, Space to toggle. */}
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

      <GoogleButton type="submit" isLoading={isLoading} isDisabled={isLoading} />

      {/* Manipulate here: change LOGIN_PATH if the login route moves */}
      <p className="theme-muted text-center text-sm">
        Already have an account?{" "}
        <Link href={LOGIN_PATH} className="font-semibold text-[#ff5ca8] hover:text-[#22d3ee]">
          Log in
        </Link>
      </p>
    </form>
  );
}
