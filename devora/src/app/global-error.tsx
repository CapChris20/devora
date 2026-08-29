"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="m-0 bg-[#1a0a2e] text-white">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="max-w-md text-center text-sm text-white/60">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/20 px-6 py-2 text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
