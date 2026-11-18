// 404 page missing screen styled per Coach Connect Neo-Brutalist Design Law.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const MISSING_PAGE_CODE = "404";
const MISSING_PAGE_TITLE = "Page not found";
const MISSING_PAGE_MESSAGE =
  "The page you are looking for does not exist or may have been relocated.";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#faf8f5] dark:bg-[#0e0817] text-[#0a0a0a] dark:text-white transition-colors">
      <div
        role="alert"
        className="w-full max-w-[500px] p-8 sm:p-10 rounded-[12px] border-[3px] border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120c1c] text-center flex flex-col items-center gap-4 shadow-[8px_8px_0px_#0a0a0a] dark:shadow-[8px_8px_0px_#000000]"
      >
        <span className="inline-flex items-center px-3.5 py-1 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] font-mono text-[11px] font-bold uppercase tracking-wider text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]">
          {MISSING_PAGE_CODE} ERROR
        </span>

        <h2 className="m-0 font-display uppercase font-normal text-3xl sm:text-4xl leading-tight">
          {MISSING_PAGE_TITLE}
        </h2>

        <p className="font-body text-sm sm:text-[15px] leading-relaxed text-[#575757] dark:text-neutral-300 max-w-[42ch] m-0">
          {MISSING_PAGE_MESSAGE}
        </p>

        <Link
          href="/home"
          className="mt-4 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-[8px] border-[2.5px] border-[#0a0a0a] dark:border-white bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] dark:shadow-[3px_3px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
