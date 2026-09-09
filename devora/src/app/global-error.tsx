// Last-resort error page when even the root layout crashes — renders its own html/body.
// Flow: root layout failed → this file supplies html/body → show message → reset retries.

"use client";

import "@/ui/globals.css";

// Must include <html> and <body> because the root layout may have failed.
// vocab: GlobalError = Next.js special file that replaces the whole document on crash
export default function GlobalError({
  error,
  reset,
}: {
  // vocab: digest = optional Next.js error id (useful in production logs)
  error: Error & { digest?: string };
  // vocab: reset = try rendering again after a root-layout crash
  reset: () => void;
}) {
  return (
    // Why own <html>/<body>? Root layout is broken — nothing else wraps this file.
    <html lang="en">
      <body className="m-0 bg-[#1a0a2e] text-white">
        {/* Manipulate here: bg-[#1a0a2e] = standalone crash color (no AppWrapper theme) */}
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <div className="surface-panel flex max-w-md flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-center text-sm text-white/60">
              {/* vocab/symbol: || = if error.message is empty, show the fallback text */}
              {error.message || "An unexpected error occurred."}
            </p>
            {/* reset() retries after a root-layout crash */}
            <button
              type="button"
              onClick={reset}
              className="devora-btn-outline"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
