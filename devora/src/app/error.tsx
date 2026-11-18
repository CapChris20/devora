// Route-level error screen styled per Coach Connect Neo-Brutalist Design Law.
// Clean canvas, 3px ink borders, 8px hard offset shadow, high-contrast typography.
// Strictly zero pink glows, zero emojis.

"use client";

import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

const ERROR_HEADING = "Something went wrong";
const FALLBACK_ERROR_MESSAGE = "An unexpected error occurred while loading this page.";
const TRY_AGAIN_LABEL = "Try again";

type RouteErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: RouteErrorPageProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const errorMessage = error.message || FALLBACK_ERROR_MESSAGE;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors ${
        isLight ? "bg-[#faf8f5] text-[#0a0a0a]" : "bg-[#0e0817] text-white"
      }`}
    >
      <div
        role="alert"
        aria-live="assertive"
        className={`w-full max-w-[500px] p-7 sm:p-10 rounded-[12px] border-[3px] text-center flex flex-col items-center gap-4 transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a]"
            : "bg-[#120c1c] border-2 border-white/30 shadow-[8px_8px_0px_#000000]"
        }`}
      >
        {/* Status sticker */}
        <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] font-mono text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]">
          Page Notice
        </span>

        {/* Heading */}
        <h2 className="m-0 font-display uppercase font-normal text-2xl sm:text-3xl lg:text-4xl leading-tight">
          {ERROR_HEADING}
        </h2>

        {/* Error message */}
        <p className={`font-body text-sm sm:text-[15px] leading-relaxed max-w-[42ch] m-0 ${
          isLight ? "text-[#575757]" : "text-neutral-300"
        }`}>
          {errorMessage}
        </p>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={reset}
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-[8px] border-[2.5px] font-bold text-xs uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
              isLight
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                : "bg-white text-[#0a0a0a] border-white shadow-[3px_3px_0px_#000000]"
            }`}
          >
            <RefreshCw size={14} />
            <span>{TRY_AGAIN_LABEL}</span>
          </button>

          <Link
            href="/home"
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-[8px] border-[2.5px] border-[#0a0a0a] dark:border-white/30 font-bold text-xs uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
              isLight
                ? "bg-white text-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:bg-[#f2f2f0]"
                : "bg-[#181124] text-white shadow-[3px_3px_0px_#000000]"
            }`}
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
