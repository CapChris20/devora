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
  { label: "Messages", href: "/messages-page" },
];

type SiteNavBarProps = {
  activeItem?: string;
};

export default function SiteNavBar({ activeItem }: SiteNavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string, label: string) => {
    if (activeItem) return activeItem === label;
    return pathname === href;
  };

  const linkClass = (active: boolean) =>
    `group relative rounded-full px-5 py-2.5 font-display text-[15px] font-semibold tracking-[0.04em] transition-all duration-300 lg:text-base lg:tracking-[0.05em] ${
      active ? "nav-link-active" : "nav-link-default"
    }`;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[100] px-4 pt-2 md:px-8 md:pt-2">
        <div
          className={`navbar-shell relative mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center rounded-full px-3 py-2 transition-all duration-500 md:px-5 md:py-2.5 ${
            scrolled ? "navbar-shell-scrolled" : ""
          }`}
        >
          <div className="hidden lg:block" aria-hidden="true" />

          <nav className="hidden items-center lg:flex">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass(active)}>
                      <span className={active ? "devora-gradient-text" : ""}>
                        {item.label}
                      </span>
                      {active && (
                        <span className="nav-link-active-indicator absolute bottom-1 left-1/2 h-px w-5 -translate-x-1/2" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,92,168,0.45)] bg-[rgba(10,4,20,0.85)] transition-colors hover:border-[rgba(255,92,168,0.65)] hover:bg-[rgba(18,6,31,0.95)] lg:hidden"
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
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0414]/70 backdrop-blur-sm theme-mobile-backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <nav className="navbar-mobile-panel absolute left-4 right-4 top-[76px] rounded-3xl p-3">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href, item.label);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`group block rounded-2xl px-4 py-3.5 font-display text-base font-semibold tracking-[0.04em] transition-all duration-300 ${
                        active ? "nav-link-active" : "nav-link-default"
                      }`}
                    >
                      <span className={active ? "devora-gradient-text" : ""}>
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
