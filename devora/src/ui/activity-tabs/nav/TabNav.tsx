// Tab bar for the Campus Hub (/activity/*). Lives in src/app/activity/layout.tsx.
// Flow: read the current URL → mark the matching tab active → a gradient pill slides under it.
// On phones the row scrolls sideways instead of wrapping.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { usePathname } from "next/navigation";
// vocab: motion.span + layoutId = framer-motion animates the pill from the old tab to the new one
// vocab: MotionConfig reducedMotion="user" = skip that slide when the OS asks for reduced motion
import { MotionConfig, motion } from "framer-motion";

import { NB_FOCUS } from "@/ui/shared/design-law/nb-parts";

// ===== NAMED CONSTANTS =====

// Manipulate here: rename a tab or add a new one (also add its page folder under src/app/activity)
export const ACTIVITY_TABS = [
  { label: "Study Groups", href: "/activity/study-groups" },
  { label: "Clubs", href: "/activity/clubs" },
];

// Manipulate here: lower stiffness = lazier slide; higher damping = less bounce
const PILL_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

// ===== MAIN COMPONENT =====

/**
 * Pill tabs. The active tab gets the gradient pill (with border + hard shadow) sliding beneath it.
 */
export default function TabNav() {
  // vocab: usePathname = Next.js hook that returns the URL path, e.g. "/activity/clubs"
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Campus Hub sections" className="motion-safe:animate-nb-rise [animation-delay:80ms]">
        {/* vocab: overflow-x-auto = scroll sideways when the pills don't fit (phones).
            Padding right/bottom keeps the hard shadow from being clipped by the scroll box.
            [scrollbar-width:none] + the webkit rule hide the scrollbar. */}
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pr-6 pt-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {ACTIVITY_TABS.map((tab) => {
            // startsWith so nested routes (e.g. /activity/clubs/acm later) keep the tab lit
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <li key={tab.href} className="relative shrink-0">
                {isActive ? (
                  <motion.span
                    layoutId="activity-tab-pill"
                    transition={PILL_SPRING}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-nb border-nb-ink bg-nb-brand shadow-nb"
                  />
                ) : null}
                <Link
                  href={tab.href}
                  // vocab: aria-current="page" = tells screen readers this is the open tab
                  aria-current={isActive ? "page" : undefined}
                  className={`relative inline-flex min-h-[48px] items-center rounded-full border-nb px-6 text-[15px] font-bold transition-[box-shadow,transform] duration-150 ${NB_FOCUS} ${
                    isActive
                      ? "border-transparent text-nb-ink"
                      : "border-nb-ink bg-nb-white text-nb-ink hover:-translate-y-px hover:shadow-nb-sm"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </MotionConfig>
  );
}
