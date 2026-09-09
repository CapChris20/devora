// Catches errors inside a page route and shows a friendly "try again" screen.
// Flow: Next.js passes error + reset → show message → reset() re-renders the segment.

"use client";

// Route-level error UI: message + button that re-runs the failed segment.
// vocab: "use client" = this file runs in the browser (needed for onClick / reset)
// vocab: reset = Next.js callback that tries rendering the failed route again
export default function Error({
  error,
  reset,
}: {
  // vocab: digest = optional Next.js error id (useful in production logs)
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // Manipulate here: bg-[#1a0a2e] = fallback purple when theme CSS may have failed
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1a0a2e] p-8 text-white">
      <div className="surface-panel flex max-w-md flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-center text-sm text-white/60">
          {/* vocab/symbol: || = if error.message is empty, show the fallback text */}
          {error.message || "An unexpected error occurred."}
        </p>
        {/* reset() tells Next.js to try rendering the page again without a full reload */}
        <button
          type="button"
          onClick={reset}
          className="devora-btn-outline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
