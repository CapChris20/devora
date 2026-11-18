// Full-document error screen used when the root layout crashes.
// Styled per Coach Connect Neo-Brutalist Design Law.

"use client";

import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import "@/ui/globals.css";

const ERROR_HEADING = "Something went wrong";
const FALLBACK_ERROR_MESSAGE = "An unexpected error occurred.";
const TRY_AGAIN_LABEL = "Try again";
const DOCUMENT_LANGUAGE = "en";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
  const errorMessage = error.message || FALLBACK_ERROR_MESSAGE;

  return (
    <html lang={DOCUMENT_LANGUAGE}>
      <body className="m-0 bg-[#faf8f5] text-[#0a0a0a] font-mono">
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
          <div
            role="alert"
            className="w-full max-w-[500px] p-8 sm:p-10 rounded-[12px] border-[3px] border-[#0a0a0a] bg-white text-center flex flex-col items-center gap-4 shadow-[8px_8px_0px_#0a0a0a]"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] font-mono text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]">
              System Notice
            </span>

            <h2 className="m-0 font-display uppercase font-normal text-3xl sm:text-4xl leading-tight">
              {ERROR_HEADING}
            </h2>

            <p className="font-body text-sm sm:text-[15px] leading-relaxed text-[#575757] max-w-[42ch] m-0">
              {errorMessage}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-[8px] border-[2.5px] border-[#0a0a0a] bg-[#0a0a0a] text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>{TRY_AGAIN_LABEL}</span>
              </button>

              <Link
                href="/home"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-[8px] border-[2.5px] border-[#0a0a0a] bg-white text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <Home size={14} />
                <span>Home</span>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
