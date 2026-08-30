"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/ui/theme/ThemeToggle";

const navItems = [
  { label: "Home", href: "/hero-page" },
  { label: "Account", href: "/account-page" },
  { label: "Discovery Grid", href: "/discovery-grid-page" },
  { label: "Settings", href: "/settings-page" },
  { label: "FAQs", href: "/faqs-page" },
  { label: "Activity Center", href: "/messages-page" },
];

type SiteNavBarProps = {
  activeItem?: string;
};

export default function SiteNavBar({ activeItem }: SiteNavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled((window.__lenis?.scroll ?? window.scrollY) > 12);
    };

    onScroll();

    let unsubscribe: (() => void) | undefined;
    const bindLenis = () => {
      if (window.__lenis && !unsubscribe) {
        unsubscribe = window.__lenis.on("scroll", onScroll);
        onScroll();
      }
    };

    bindLenis();
    const timer = window.setTimeout(bindLenis, 0);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (open) {
      window.__lenis?.stop();
      document.body.classList.add("nav-menu-open");
    } else {
      window.__lenis?.start();
      document.body.classList.remove("nav-menu-open");
    }

    return () => {
      window.__lenis?.start();
      document.body.classList.remove("nav-menu-open");
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string, label: string) => {
    if (activeItem) return activeItem === label;
    return pathname === href;
  };

  const linkClass = (active: boolean) =>
    `nav-link group relative inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full px-5 py-2.5 font-display text-[15px] font-semibold tracking-[0.04em] transition-all duration-300 touch-manipulation lg:text-base lg:tracking-[0.05em] ${
      active ? "nav-link-active" : "nav-link-default"
    }`;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-end px-3 pt-2 sm:px-4 md:px-8 md:pt-2">
        <div
          className={`navbar-shell pointer-events-auto flex w-auto max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full px-2 py-2 sm:max-w-[calc(100vw-2rem)] md:gap-2 md:px-3 md:py-2.5 lg:px-4 ${
            scrolled ? "navbar-shell-scrolled" : ""
          }`}
        >
          <nav
            className="navbar-desktop-nav hidden lg:block"
            aria-label="Main navigation"
          >
            <ul className="flex items-center gap-0.5 overflow-x-auto pb-0.5 xl:gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  <li key={item.label} className="shrink-0">
                    <Link href={item.href} className={linkClass(active)} prefetch>
                      <span className={active ? "devora-gradient-text" : ""}>{item.label}</span>
                      {active && (
                        <span className="nav-link-active-indicator absolute bottom-1 left-1/2 h-px w-5 -translate-x-1/2" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 pl-0.5 lg:pl-1">
            <ThemeToggle />
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,92,168,0.45)] bg-[rgba(10,4,20,0.85)] transition-colors hover:border-[rgba(255,92,168,0.65)] hover:bg-[rgba(18,6,31,0.95)] lg:hidden"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-white transition-all duration-300 ${open ? "rotate-45" : "-translate-y-1"}`}
              />
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`nav-hamburger-line absolute h-0.5 w-4 bg-white transition-all duration-300 ${open ? "-rotate-45" : "translate-y-1"}`}
              />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[190] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0414]/70 backdrop-blur-sm theme-mobile-backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
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
                      onClick={() => setOpen(false)}
                      prefetch
                      className={`nav-link group flex min-h-[48px] items-center rounded-2xl px-4 py-3.5 font-display text-base font-semibold tracking-[0.04em] transition-all duration-300 touch-manipulation ${
                        active ? "nav-link-active" : "nav-link-default"
                      }`}
                    >
                      <span className={active ? "devora-gradient-text" : ""}>{item.label}</span>
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
