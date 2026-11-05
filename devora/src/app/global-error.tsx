// Last-resort error page when even the root layout crashes. It renders its own html and body.
// Flow: root layout failed → this file supplies html/body → show the message → reset retries.

"use client";

// ===== IMPORTS =====

import "@/ui/globals.css";

// ===== NAMED CONSTANTS =====

const ERROR_HEADING = "Something went wrong";
const FALLBACK_ERROR_MESSAGE = "An unexpected error occurred.";
const TRY_AGAIN_LABEL = "Try again";
const DOCUMENT_LANGUAGE = "en";

// Manipulate here: crash color used when AppWrapper and the theme never load.
const CRASH_BODY_CLASS = "m-0 bg-[#1a0a2e] text-white";

// ===== TYPES =====

type GlobalErrorPageProps = {
  // vocab: digest = optional Next.js error id, useful in production logs
  error: Error & { digest?: string };
  // vocab: reset = try rendering again after a root-layout crash
  reset: () => void;
};

// ===== MAIN COMPONENT =====

/**
 * Full-document error screen used when the root layout itself crashes.
 * It includes html and body because nothing else is wrapping the page.
 * @param props.error - The error Next caught at the root
 * @param props.reset - Call this to try rendering again
 */
export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
  // vocab: GlobalError = Next.js special file that replaces the whole document on a crash
  const errorMessage = error.message || FALLBACK_ERROR_MESSAGE;

  return (
    <html lang={DOCUMENT_LANGUAGE}>
      <body className={CRASH_BODY_CLASS}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <div className="surface-panel flex max-w-md flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">{ERROR_HEADING}</h2>
            <p className="text-center text-sm text-white/60">{errorMessage}</p>
            <button type="button" onClick={reset} className="devora-btn-outline">
              {TRY_AGAIN_LABEL}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
