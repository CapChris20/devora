// Quick reply chips bar for rapid 1-tap messaging.
// Displays pre-canned messages suited for commuter and study coordination.

"use client";

// ===== IMPORTS =====

import { useActivityCenter } from "../ActivityCenterContext";

// ===== QUICK REPLY OPTIONS =====

const QUICK_OPTIONS = [
  "Sounds good!",
  "What time works?",
  "I'm in",
  "Can you share the notes?",
];

// ===== MAIN COMPONENT =====

export default function QuickReplies() {
  const { sendMessage } = useActivityCenter();

  return (
    <div
      aria-label="Quick replies"
      className="flex gap-2 px-3 pt-2.5 pb-0 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {QUICK_OPTIONS.map((phrase) => (
        <button
          key={phrase}
          type="button"
          onClick={() => sendMessage(phrase)}
          className="flex-shrink-0 min-h-[32px] px-3.5 rounded-full border-2 border-nb-ink bg-nb-white font-nb-mono text-[11px] font-bold tracking-[0.08em] uppercase text-nb-ink transition-all duration-120 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-sm active:translate-x-px active:translate-y-px whitespace-nowrap"
        >
          {phrase}
        </button>
      ))}
    </div>
  );
}
