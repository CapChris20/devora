// Sticky navigation tab bar for Activity Center sections.
// Displays the primary tabs: Events and Study Groups.
// (Connections and Messages live in their own dedicated top-level nav links: /connections and /messages).
// Sliding neo-brutalist gradient pill animates with GSAP back.out ease to track route changes.

"use client";

// ===== IMPORTS =====

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ===== TAB DEFINITIONS =====

type TabDefinition = {
  key: string;
  label: string;
  href: string;
};

const TABS: TabDefinition[] = [
  { key: "events", label: "Events", href: "/activity-center/events" },
  {
    key: "study-groups",
    label: "Study Groups",
    href: "/activity-center/study-groups",
  },
];

// ===== MAIN COMPONENT =====

export default function TabNav() {
  const pathname = usePathname();
  const navContainerRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Determine active tab key from URL pathname
  const activeTabKey =
    TABS.find((t) => pathname.startsWith(t.href))?.key || "events";

  const movePill = useCallback(
    (instant: boolean = false) => {
      const activeEl = tabButtonRefs.current[activeTabKey];
      const pill = pillRef.current;
      if (!activeEl || !pill) return;

      const targetX = activeEl.offsetLeft;
      const targetWidth = activeEl.offsetWidth;

      const isReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (instant || isReducedMotion) {
        gsap.set(pill, { x: targetX, width: targetWidth });
      } else {
        gsap.to(pill, {
          x: targetX,
          width: targetWidth,
          duration: 0.55,
          ease: "back.out(1.7)",
        });
      }

      // Auto-scroll the tab bar on mobile if tab is partially out of view
      const scrollContainer = scrollContainerRef.current;
      if (
        scrollContainer &&
        scrollContainer.scrollWidth > scrollContainer.clientWidth
      ) {
        scrollContainer.scrollTo({
          left: Math.max(0, targetX - 24),
          behavior: isReducedMotion ? "auto" : "smooth",
        });
      }
    },
    [activeTabKey]
  );

  // Animate pill whenever the active tab route changes
  useGSAP(
    () => {
      movePill(false);
    },
    { dependencies: [movePill], scope: navContainerRef }
  );

  // Resize handler for responsive recalculations
  useEffect(() => {
    const onResize = () => movePill(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [movePill]);

  return (
    <nav
      ref={navContainerRef}
      aria-label="Activity Center sections"
      className="tabbar sticky top-0 z-40 bg-nb-paper border-b-nb border-nb-ink"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          role="tablist"
          className="tabs relative flex gap-2.5 overflow-x-auto py-3.5 sm:py-4 pr-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Animated sliding background pill */}
          <span
            ref={pillRef}
            aria-hidden="true"
            className="pill absolute top-3.5 sm:top-4 left-0 h-[50px] w-0 rounded-full border-nb border-nb-ink bg-nb-brand shadow-nb pointer-events-none z-0 will-change-transform"
          />

          {TABS.map((tab) => {
            const isActive = activeTabKey === tab.key;

            return (
              <Link
                key={tab.key}
                ref={(el) => {
                  tabButtonRefs.current[tab.key] = el;
                }}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={`tab relative z-10 flex-shrink-0 inline-flex items-center gap-2 h-[50px] px-5 sm:px-5.5 rounded-full border-nb border-nb-ink font-bold text-[15px] whitespace-nowrap transition-transform duration-150 hover:-translate-y-0.5 ${
                  isActive
                    ? "!bg-transparent !border-transparent text-nb-ink"
                    : "bg-nb-white text-nb-ink"
                }`}
              >
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
