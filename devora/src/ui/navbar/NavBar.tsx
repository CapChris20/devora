// Top navigation on every page — links, theme toggle, mobile hamburger menu.
// Flow: mount → listen for scroll (compact shell) → click hamburger → lock body scroll →
// navigate → close menu. Desktop shows the link row; small screens use the overlay panel.
// Manipulate here: edit `navItems` to add/rename/reorder destinations.

"use client";

import Link from "next/link";
// vocab: usePathname = current URL path from Next.js (e.g. "/home") — updates when you navigate
import { usePathname } from "next/navigation";
// vocab: useState = React memory for values that change (menu open, scrolled)
// vocab: useEffect = run side effects after paint (scroll listeners, body class, cleanup)
import { useEffect, useState } from "react";
import DarkLightButton from "@/ui/theme/DarkLightButton";

// Main nav destinations (desktop + mobile share this list).
// Manipulate here: change label (what users see) or href (where Link goes).
const navItems = [
  { label: "Home", href: "/home" },
  { label: "Account", href: "/account-page" },
  { label: "Discovery Grid", href: "/find-students" },
  { label: "Settings", href: "/settings" },
  { label: "FAQs", href: "/faqs-page" },
  { label: "Activity Center", href: "/messages-page" },
];

type NavBarProps = {
  // Optional override so PageLayout can force a highlight even if the path is odd
  // Manipulate here: pass activeItem="Settings" from a page when pathname matching isn't enough
  activeItem?: string;
};

export default function NavBar({ activeItem }: NavBarProps) {
  // Current route — used to close the mobile menu on navigation + highlight links
  const pathname = usePathname();
  // vocab/symbol: [value, setValue] = current state + function to update it
  // true while the small-screen overlay menu is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // true after the user scrolls past a small threshold → CSS adds navbar-shell-scrolled
  const [hasScrolled, setHasScrolled] = useState(false);

  // Track scroll — navbar gets compact style after user scrolls down a bit.
  // Homepage may use Lenis (window.smoothScroller); other pages use normal window.scrollY.
  // vocab: Lenis / smoothScroller = custom smooth-scroll engine hooked up on the homepage
  useEffect(() => {
    const onScroll = () => {
      // Prefer Lenis scroll position when present; else fall back to the browser's.
      // vocab/symbol: ?. = optional chain (skip if missing); ?? = fallback if null/undefined
      // Manipulate here: change `12` — lower = shrink sooner; higher = stay tall longer
      setHasScrolled((window.smoothScroller?.scroll ?? window.scrollY) > 12);
    };

    // Run once immediately so a refreshed mid-page load still gets the compact shell
    onScroll();

    // Lenis exposes .on("scroll", fn) and returns an unsubscribe function
    let unsubscribe: (() => void) | undefined;

    // Lenis may mount a tick later than the navbar — try now and once more on the next macrotask.
    // vocab: setTimeout(..., 0) = “run after the current call stack” so Lenis can finish mounting
    const bindSmoothScroller = () => {
      // Only bind once — if unsubscribe already exists we already subscribed
      if (window.smoothScroller && !unsubscribe) {
        unsubscribe = window.smoothScroller.on("scroll", onScroll);
        onScroll();
      }
    };

    bindSmoothScroller();
    const timer = window.setTimeout(bindSmoothScroller, 0);

    // Also listen to native scroll (pages without Lenis).
    // vocab: { passive: true } = tell the browser we won't call preventDefault → smoother scrolling
    window.addEventListener("scroll", onScroll, { passive: true });

    // Cleanup: drop timer + listeners when navbar unmounts so we don't leak handlers.
    // vocab: cleanup return = React runs this when the component leaves the page / deps change
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      // vocab/symbol: ?.() = call unsubscribe only if it was set
      unsubscribe?.();
    };
  }, []);
  // vocab/symbol: [] = empty dependency list → this effect runs once on mount, cleans up on unmount

  // Mobile menu open — pause Lenis and lock body so the page behind the overlay doesn't scroll.
  // CSS class `nav-menu-open` on <body> is what actually freezes overflow (see globals.css).
  useEffect(() => {
    if (isMobileMenuOpen) {
      // vocab: .stop() = pause Lenis so its wheel/touch handlers don't fight the overlay
      window.smoothScroller?.stop();
      document.body.classList.add("nav-menu-open");
    } else {
      // vocab: .start() = resume Lenis after the menu closes
      window.smoothScroller?.start();
      document.body.classList.remove("nav-menu-open");
    }

    // Always restore scroll if this effect re-runs or unmounts mid-open
    // (prevents a stuck “frozen page” if React remounts the navbar)
    return () => {
      window.smoothScroller?.start();
      document.body.classList.remove("nav-menu-open");
    };
  }, [isMobileMenuOpen]);
  // vocab/symbol: [isMobileMenuOpen] = re-run whenever the menu open/closed state flips

  // Close mobile menu when the route changes (user tapped a Link inside the panel).
  // Without this, the overlay would still be open on the new page.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Highlight nav link when pathname or activeItem prop matches.
  // Prefer activeItem when a page passes it (PageLayout); else exact path match.
  const isActive = (href: string, label: string) => {
    if (activeItem) return activeItem === label;
    return pathname === href;
  };

  // Shared desktop link classes — active gets gradient text styling via CSS helpers.
  // Manipulate here: tweak Tailwind sizes/padding if the pill feels too tall/short.
  // vocab: touch-manipulation = disable double-tap-to-zoom delay on mobile taps
  const linkClass = (active: boolean) =>
    `nav-link group relative z-10 inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-full px-4 py-3.5 font-display text-[14px] font-semibold tracking-[0.04em] transition-colors duration-200 touch-manipulation lg:px-4 lg:text-[15px] ${
      active ? "nav-link-active" : "nav-link-default"
    }`;

  return (
    <>
      {/* Fixed top bar.
          pointer-events-none on the shell so empty space doesn't steal clicks from page content;
          pointer-events-auto on the pill restores clicks only on the actual navbar UI.
          vocab: z-[200] = sit above most page content (mobile overlay uses 210) */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-end px-3 pt-2 sm:px-4 md:px-8 md:pt-2">
        <div
          className={`navbar-shell pointer-events-auto flex w-auto max-w-[calc(100vw-1.5rem)] touch-manipulation items-center gap-1.5 rounded-full px-2 py-2 sm:max-w-[calc(100vw-2rem)] md:gap-2 md:px-3 md:py-2.5 lg:px-4 ${
            // Manipulate here: navbar-shell-scrolled styles live in globals.css (shrink/blur)
            hasScrolled ? "navbar-shell-scrolled" : ""
          }`}
        >
          {/* Desktop link row — hidden below the md breakpoint (hamburger takes over) */}
          <nav
            className="navbar-desktop-nav hidden min-w-0 md:block"
            aria-label="Main navigation"
          >
            <ul className="flex flex-nowrap items-center gap-1 md:gap-1.5 xl:gap-2">
              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  // vocab: key={item.label} = React identity so the list can reconcile updates
                  <li key={item.label} className="shrink-0">
                    {/* vocab: prefetch = Next.js preloads the route in the background for faster nav */}
                    <Link href={item.href} className={linkClass(active)} prefetch>
                      {/* Active links use soft pink — brand color without neon overload */}
                      <span className={`nav-link-text ${active ? "soft-pink" : ""}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme toggle always visible; hamburger only on small screens (md:hidden) */}
          <div className="flex shrink-0 items-center gap-2 pl-0.5 md:pl-1">
            <DarkLightButton />
            <button
              type="button"
              className="nav-icon-btn relative touch-manipulation md:hidden"
              // Flip open ↔ closed from the previous value (safe if clicks fire fast).
              // vocab/symbol: !prev = boolean NOT — true becomes false, false becomes true
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              // vocab: aria-expanded = tells assistive tech whether the menu is open
              aria-expanded={isMobileMenuOpen}
            >
              {/* Three lines that morph into an X when open (CSS rotate / opacity).
                  Manipulate here: change rotate / translate classes to restyle the morph. */}
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${isMobileMenuOpen ? "rotate-45" : "-translate-y-1"}`}
              />
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45" : "translate-y-1"}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu — full-screen layer; backdrop click closes it.
          Only mounted while open so it can't trap focus when closed.
          vocab/symbol: && = only render the overlay JSX when the menu is open */}
      {isMobileMenuOpen && (
        // vocab: z-[210] = above the fixed header (200) so the panel covers it
        <div className="fixed inset-0 z-[210] md:hidden">
          {/* Invisible full-screen hit target + blur — clicking outside the panel closes */}
          <button
            type="button"
            className="absolute inset-0 backdrop-blur-sm theme-mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          {/* Floating panel anchored under the navbar pill */}
          <nav
            className="navbar-mobile-panel pointer-events-auto absolute right-3 top-[4.75rem] w-[min(100%,20rem)] rounded-3xl p-3 sm:right-4"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      // Close immediately on tap so the overlay doesn't linger during navigation
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch
                      className={`nav-link group relative z-10 flex min-h-[56px] w-full touch-manipulation items-center rounded-2xl px-4 py-4 font-display text-base font-semibold tracking-[0.04em] transition-colors duration-200 ${
                        active ? "nav-link-active" : "nav-link-default"
                      }`}
                    >
                      <span className={`nav-link-text ${active ? "soft-pink" : ""}`}>
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
