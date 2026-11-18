// Top navigation on every page — links, theme toggle, mobile hamburger menu.
// Flow: mount → listen for scroll (compact shell) → click hamburger → lock body scroll →
// navigate → close menu. Desktop shows the link row with stretching sliding pill; small screens use overlay panel.
// Manipulate here: edit `navItems` to add/rename/reorder destinations.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import DarkLightButton from "@/ui/shared/theme/DarkLightButton";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

// Main nav destinations (desktop + mobile share this list).
const navItems = [
  { label: "Home", href: "/home" },
  { label: "Account", href: "/account-page" },
  { label: "Discovery Grid", href: "/find-students" },
  { label: "Settings", href: "/settings" },
  { label: "FAQs", href: "/faqs-page" },
  // Campus Hub = Events, Study Groups, Clubs
  { label: "Campus Hub", href: "/activity-center" },
  { label: "Messages", href: "/messages" },
  { label: "Connections", href: "/connections" },
];

type NavBarProps = {
  // Optional override so PageLayout can force a highlight even if the path is odd
  activeItem?: string;
};

export default function NavBar({ activeItem }: NavBarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const navContainerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Highlight nav link when pathname or activeItem prop matches
  const isActive = useCallback(
    (href: string, label: string) => {
      if (activeItem) return activeItem === label;
      if (href === "/home" && pathname === "/") return true;
      if (
        (href === "/activity-center" || href === "/campus-hub") &&
        (pathname.startsWith("/activity-center") || pathname.startsWith("/campus-hub"))
      ) {
        return true;
      }
      if (href === "/connections" && pathname.startsWith("/connections")) return true;
      if (href === "/messages" && pathname.startsWith("/messages")) return true;
      if (href === "/faqs-page" && (pathname === "/faqs" || pathname.startsWith("/faqs-page"))) return true;
      return pathname === href;
    },
    [activeItem, pathname]
  );

  // Animate stretching / sliding gradient pill to active nav link
  const movePill = useCallback(
    (instant: boolean = false) => {
      const activeEntry = navItems.find((item) => isActive(item.href, item.label));
      const pill = pillRef.current;
      if (!pill) return;

      if (!activeEntry) {
        gsap.to(pill, { autoAlpha: 0, duration: 0.2 });
        return;
      }

      const activeEl = linkRefs.current[activeEntry.label];
      if (!activeEl) return;

      const targetX = activeEl.offsetLeft;
      const targetWidth = activeEl.offsetWidth;
      const targetHeight = activeEl.offsetHeight;
      const targetTop = activeEl.offsetTop;

      const isReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (instant || isReducedMotion) {
        gsap.set(pill, {
          x: targetX,
          y: targetTop,
          width: targetWidth,
          height: targetHeight,
          autoAlpha: 1,
        });
      } else {
        gsap.to(pill, {
          x: targetX,
          y: targetTop,
          width: targetWidth,
          height: targetHeight,
          autoAlpha: 1,
          duration: 0.52,
          ease: "back.out(1.7)",
        });
      }
    },
    [isActive]
  );

  // Trigger pill animation on route or activeItem change
  useGSAP(
    () => {
      movePill(false);
    },
    { dependencies: [movePill], scope: navContainerRef }
  );

  // Resize listener to keep pill aligned
  useEffect(() => {
    const onResize = () => movePill(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [movePill]);

  // Track scroll
  useEffect(() => {
    const onScroll = () => {
      setHasScrolled((window.smoothScroller?.scroll ?? window.scrollY) > 12);
    };

    onScroll();

    let unsubscribe: (() => void) | undefined;
    const bindSmoothScroller = () => {
      if (window.smoothScroller && !unsubscribe) {
        unsubscribe = window.smoothScroller.on("scroll", onScroll);
        onScroll();
      }
    };

    bindSmoothScroller();
    const timer = window.setTimeout(bindSmoothScroller, 0);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      unsubscribe?.();
    };
  }, []);

  // Mobile menu open — pause scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      window.smoothScroller?.stop();
      document.body.classList.add("nav-menu-open");
    } else {
      window.smoothScroller?.start();
      document.body.classList.remove("nav-menu-open");
    }

    return () => {
      window.smoothScroller?.start();
      document.body.classList.remove("nav-menu-open");
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Fixed top bar */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-end px-3 pt-2 sm:px-4 md:px-8 md:pt-2">
        <div
          className={`navbar-shell pointer-events-auto flex w-auto max-w-[calc(100vw-1.5rem)] touch-manipulation items-center gap-1.5 rounded-[8px] px-2 py-2 sm:max-w-[calc(100vw-2rem)] md:gap-2 md:px-3 md:py-2.5 lg:px-4 ${
            hasScrolled ? "navbar-shell-scrolled" : ""
          }`}
        >
          {/* Desktop link row — with stretching/sliding pill */}
          <nav
            ref={navContainerRef}
            className="navbar-desktop-nav hidden min-w-0 lg:block relative"
            aria-label="Main navigation"
          >
            <ul className="relative flex flex-nowrap items-center gap-1 md:gap-1.5 xl:gap-2 py-0.5">
              {/* Stretching & sliding neo-brutalist gradient pill */}
              <span
                ref={pillRef}
                aria-hidden="true"
                className="absolute left-0 top-0 rounded-full border-2 border-[#0A0A0A] bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] shadow-[3px_3px_0px_#0A0A0A] pointer-events-none z-0 will-change-transform opacity-0"
              />

              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  <li key={item.label} className="shrink-0">
                    <Link
                      ref={(el) => {
                        linkRefs.current[item.label] = el;
                      }}
                      href={item.href}
                      className={`nav-link group relative z-10 inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full px-3.5 py-2 font-display text-[13.5px] font-semibold tracking-[0.03em] transition-transform duration-150 hover:-translate-y-0.5 touch-manipulation lg:px-4 lg:text-[14px] ${
                        active
                          ? "!text-[#0A0A0A] font-black"
                          : isLight
                          ? "text-[#0A0A0A] font-bold"
                          : "text-white font-bold"
                      }`}
                      prefetch
                    >
                      <span
                        className={`nav-link-text transition-colors duration-150 ${
                          active
                            ? "!text-[#0A0A0A] font-black drop-shadow-none"
                            : isLight
                            ? "!text-[#0A0A0A] font-bold"
                            : "!text-white font-bold hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme toggle always visible; hamburger only on small screens */}
          <div className="flex shrink-0 items-center gap-2 pl-0.5 md:pl-1">
            <DarkLightButton />
            <button
              type="button"
              className="nav-icon-btn relative touch-manipulation lg:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45" : "-translate-y-1"
                }`}
              />
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45" : "translate-y-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[210] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 backdrop-blur-sm theme-mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <nav
            className="navbar-mobile-panel pointer-events-auto absolute right-3 top-[4.75rem] w-[min(100%,20rem)] rounded-3xl p-3 sm:right-4"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch
                      className={`nav-link group relative z-10 flex min-h-[50px] w-full touch-manipulation items-center rounded-2xl px-4 py-3 font-display text-base tracking-[0.04em] transition-all duration-200 ${
                        active
                          ? "border-2 border-[#0A0A0A] bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] !text-[#0A0A0A] font-black shadow-[3px_3px_0px_#0A0A0A]"
                          : isLight
                          ? "text-[#0A0A0A] font-semibold hover:bg-[#0A0A0A]/5"
                          : "text-white font-semibold hover:bg-white/5"
                      }`}
                    >
                      <span className={`nav-link-text ${active ? "!text-[#0A0A0A] font-black" : ""}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
