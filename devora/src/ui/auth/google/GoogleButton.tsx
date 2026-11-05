// Reusable "Continue with Google" button on login and signup pages.
// Shows the Google logo, or a spinner while loading.
// LoginCard passes onClick; SignupCard uses type="submit" inside a form.

"use client";

// ===== NAMED CONSTANTS =====

const DEFAULT_BUTTON_TYPE = "button";
const CONTINUE_WITH_GOOGLE_LABEL = "Continue with Google";
const GOOGLE_BUTTON_CLASS_NAME = "sign-in-google-btn";
const GOOGLE_ICON_CLASS_NAME = "h-5 w-5 shrink-0";
const SPINNER_CLASS_NAME = "sign-in-spinner";
const GOOGLE_BLUE = "#4285F4";
const GOOGLE_GREEN = "#34A853";
const GOOGLE_YELLOW = "#FBBC05";
const GOOGLE_RED = "#EA4335";

// ===== TYPES =====

type GoogleButtonProps = {
  // Optional click handler. Login uses onClick. Signup uses form submit instead.
  onClick?: () => void;
  // vocab: type = "button" (default) or "submit" (triggers the parent form)
  // Manipulate here: signup must stay "submit"; login should stay "button" plus onClick
  type?: "button" | "submit";
  isDisabled?: boolean;
  // True while the Google popup or redirect is in progress
  isLoading?: boolean;
};

// ===== HELPER FUNCTIONS =====

function GoogleIcon() {
  return (
    <svg className={GOOGLE_ICON_CLASS_NAME} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={GOOGLE_BLUE}
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={GOOGLE_GREEN}
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill={GOOGLE_YELLOW}
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill={GOOGLE_RED}
      />
    </svg>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Shared Google call-to-action. Shows a spinner while auth is running.
 * @param props - Click behavior, button type, and loading flags
 * @param props.onClick - Login click handler. Omit it when the parent form submits
 * @param props.type - "button" for login, "submit" for signup
 * @param props.isDisabled - True when the button should ignore clicks
 * @param props.isLoading - True while the Google popup or redirect is in progress
 * @returns The Google button
 */
export default function GoogleButton({
  onClick,
  type = DEFAULT_BUTTON_TYPE,
  isDisabled = false,
  isLoading = false,
}: GoogleButtonProps) {
  const shouldBlockClicks = isDisabled || isLoading;

  return (
    <button
      type={type}
      className={GOOGLE_BUTTON_CLASS_NAME}
      onClick={onClick}
      // Block a second click while the popup is already open
      disabled={shouldBlockClicks}
    >
      {isLoading ? <span className={SPINNER_CLASS_NAME} aria-hidden /> : <GoogleIcon />}
      {CONTINUE_WITH_GOOGLE_LABEL}
    </button>
  );
}
