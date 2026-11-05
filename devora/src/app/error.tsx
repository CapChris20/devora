// Catches an error inside one page and shows a friendly try-again screen.
// Flow: Next passes the error and a reset function → show the message → reset tries the page again.

"use client";

// ===== NAMED CONSTANTS =====

const ERROR_HEADING = "Something went wrong";
const FALLBACK_ERROR_MESSAGE = "An unexpected error occurred.";
const TRY_AGAIN_LABEL = "Try again";

// Manipulate here: this purple shows when theme CSS may have failed with the page.
const ERROR_SCREEN_CLASS =
  "flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1a0a2e] p-8 text-white";

// ===== TYPES =====

type RouteErrorPageProps = {
  // vocab: digest = optional Next.js error id, useful in production logs
  error: Error & { digest?: string };
  // vocab: reset = Next.js callback that tries rendering the failed route again
  reset: () => void;
};

// ===== MAIN COMPONENT =====

/**
 * Route-level error screen with a button that retries the failed page.
 * @param props.error - The error Next caught in this route
 * @param props.reset - Call this to try rendering the route again
 */
export default function Error({ error, reset }: RouteErrorPageProps) {
  const errorMessage = error.message || FALLBACK_ERROR_MESSAGE;

  return (
    <div className={ERROR_SCREEN_CLASS}>
      <div className="surface-panel flex max-w-md flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">{ERROR_HEADING}</h2>
        <p className="text-center text-sm text-white/60">{errorMessage}</p>
        <button type="button" onClick={reset} className="devora-btn-outline">
          {TRY_AGAIN_LABEL}
        </button>
      </div>
    </div>
  );
}
