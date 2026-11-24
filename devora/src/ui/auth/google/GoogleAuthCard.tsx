// One-click Google card shared by /auth/login and /auth/signup, in the homepage's rounded poster style.
// No form fields: the student taps Google, picks their Michigan account, and sign-in-actions does the rest
// (Michigan check, Firestore profile from the Google name, redirect). Styles: auth-poster.css (au- classes).
// Flow: tap Continue with Google → handleGoogleSignIn(mode) → redirect, or show the red banner.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";

import DevoraLogo from "@/ui/shared/logo/DevoraLogo";
import { NB_FONT_CLASS_NAME } from "@/ui/shared/design-law/nb-fonts";
import GoogleButton from "./GoogleButton";
import { handleGoogleSignIn, readThrownErrorMessage, type SignInMode } from "../sign-in-actions";
import "./auth-poster.css";

// ===== NAMED CONSTANTS =====

const LOGIN_PATH = "/auth/login";
const SIGNUP_PATH = "/auth/signup";
const TERMS_PATH = "/terms-page";
const PRIVACY_PATH = "/privacy-page";
const CAMPUS_STICKER_TEXT = "CECS · UM-Dearborn";

// Words for each mode. bandWord sits on the tilted color band.
// Manipulate here: edit headings and lines without touching the layout below
const COPY_FOR_MODE = {
  login: {
    headingStart: "Welcome",
    bandWord: "back.",
    subheading: "One tap with your Michigan Google account and you're in.",
    switchQuestion: "New to Devora?",
    switchLabel: "Create an account",
    switchPath: SIGNUP_PATH,
  },
  signup: {
    headingStart: "Join",
    bandWord: "Devora.",
    subheading: "No forms. Tap Google, pick your Michigan account, and set up your profile next.",
    switchQuestion: "Already have an account?",
    switchLabel: "Log in",
    switchPath: LOGIN_PATH,
  },
} as const;

const TRUST_CHIPS = ["@umich.edu", "@umd.umich.edu", "No passwords"] as const;

// ===== HELPER FUNCTIONS =====

// Pill tab for Log in / Sign up. The current mode is a plain span, the other is a link.
function ModeTab({ label, path, isCurrent }: { label: string; path: string; isCurrent: boolean }) {
  if (isCurrent) {
    return (
      <span className="au-tab au-tab-current" aria-current="page">
        {label}
      </span>
    );
  }
  return (
    <Link href={path} className="au-tab">
      {label}
    </Link>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Google-only login or signup card.
 * @param props.mode - "login" or "signup"; picks the copy and the Firestore behavior
 */
export default function GoogleAuthCard({ mode }: { mode: SignInMode }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const copy = COPY_FOR_MODE[mode];
  const isSignup = mode === "signup";

  const startGoogleSignIn = async () => {
    // 1. Clear any old banner and lock the button
    setErrorMessage("");
    setIsLoading(true);
    try {
      // 2. Google popup → Michigan check → profile → redirect (all inside handleGoogleSignIn)
      await handleGoogleSignIn(router, mode, {});
    } catch (thrownValue) {
      // 3. Show what went wrong (closed popup, Gmail account, etc.)
      setErrorMessage(readThrownErrorMessage(thrownValue));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`au-stage ${NB_FONT_CLASS_NAME}`}>
      <div className="au-backer" aria-hidden="true" />

      <div className="au-card">
        {/* 1. Campus sticker on the top edge */}
        <span className="au-sticker">{CAMPUS_STICKER_TEXT}</span>

        {/* 2. Logo chip + sticker headline */}
        <header className="au-header">
          <span className="au-logo">
            <DevoraLogo size="nav" />
          </span>
          <h1 className="au-headline">
            <span className="au-word">{copy.headingStart}</span>{" "}
            <span className="au-band-word">
              <span className="au-band" aria-hidden="true" />
              <span className="au-word">{copy.bandWord}</span>
            </span>
          </h1>
          <p className="au-sub">{copy.subheading}</p>
        </header>

        {/* 3. Log in / Sign up pill tabs */}
        <nav aria-label="Auth tabs" className="au-tabs">
          <ModeTab label="Log in" path={LOGIN_PATH} isCurrent={!isSignup} />
          <ModeTab label="Sign up" path={SIGNUP_PATH} isCurrent={isSignup} />
        </nav>

        {/* 4. Error banner */}
        {errorMessage ? (
          <div className="au-error" role="alert">
            <AlertCircle size={18} strokeWidth={2.6} />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* 5. The only action: Continue with Google */}
        <GoogleButton
          className="au-google-btn"
          onClick={() => void startGoogleSignIn()}
          isLoading={isLoading}
          isDisabled={isLoading}
        />

        {/* 6. Which accounts work */}
        <ul className="au-chips" aria-label="Accepted accounts">
          {TRUST_CHIPS.map((chipText) => (
            <li key={chipText} className="au-chip">
              {chipText}
            </li>
          ))}
        </ul>

        {/* 7. Terms line (signup only) and the switch link */}
        {isSignup ? (
          <p className="au-terms">
            By continuing you agree to the <Link href={TERMS_PATH}>Terms of Service</Link> and{" "}
            <Link href={PRIVACY_PATH}>Privacy Policy</Link>.
          </p>
        ) : null}
        <p className="au-switch">
          {copy.switchQuestion}{" "}
          <Link href={copy.switchPath} className="au-switch-link">
            {copy.switchLabel}
            <ArrowRight size={15} strokeWidth={3} />
          </Link>
        </p>
      </div>
    </div>
  );
}
