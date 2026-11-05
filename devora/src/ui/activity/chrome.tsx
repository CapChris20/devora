// Devora app chrome copied from NavBar.tsx, PageLayout.tsx and Footer.tsx (same classes).
// Links are inert in the mockup except Activity Center.

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";

import { ACTIVITY_CENTER_NAME } from "./config";

const NAV_ITEMS = ["Home", "Account", "Discovery Grid", "Settings", "FAQs", ACTIVITY_CENTER_NAME];

const linkClass = (active: boolean) =>
  `nav-link group relative z-10 inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-full px-4 py-3.5 font-display text-[14px] font-semibold tracking-[0.04em] transition-colors duration-200 touch-manipulation lg:px-4 lg:text-[15px] ${
    active ? "nav-link-active" : "nav-link-default"
  }`;

export const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="act-navbar pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-end px-3 pt-2 sm:px-4 md:px-8 md:pt-2">
        <div
          className={`navbar-shell pointer-events-auto flex w-auto max-w-[calc(100vw-1.5rem)] touch-manipulation items-center gap-1.5 rounded-full px-2 py-2 sm:max-w-[calc(100vw-2rem)] md:gap-2 md:px-3 md:py-2.5 lg:px-4 ${
            scrolled ? "navbar-shell-scrolled" : ""
          }`}
        >
          <nav className="navbar-desktop-nav hidden min-w-0 md:block" aria-label="Main navigation">
            <ul className="flex flex-nowrap items-center gap-1 md:gap-1.5 xl:gap-2">
              {NAV_ITEMS.map((label) => {
                const active = label === ACTIVITY_CENTER_NAME;
                return (
                  <li key={label} className="shrink-0">
                    <a
                      href={active ? "#top" : undefined}
                      aria-current={active ? "page" : undefined}
                      className={linkClass(active)}
                      role={active ? undefined : "link"}
                      aria-disabled={active ? undefined : "true"}
                      tabIndex={active ? undefined : -1}
                    >
                      <span className={`nav-link-text ${active ? "soft-pink" : ""}`}>{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex shrink-0 items-center gap-2 pl-0.5 md:pl-1">
            <span className="theme-toggle" aria-hidden="true">
              <Sun className="h-4 w-4" />
            </span>
            <button
              type="button"
              className="nav-icon-btn relative touch-manipulation md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`nav-hamburger-line absolute h-0.5 w-4 bg-current transition-all duration-300 ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-[210] md:hidden">
          <div className="absolute inset-0 backdrop-blur-sm theme-mobile-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav className="navbar-mobile-panel pointer-events-auto absolute right-3 top-[4.75rem] w-[min(100%,20rem)] rounded-3xl p-3 sm:right-4" aria-label="Mobile navigation">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((label) => {
                const active = label === ACTIVITY_CENTER_NAME;
                return (
                  <li key={label}>
                    <a
                      href="#top"
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`nav-link group relative z-10 flex min-h-[56px] w-full touch-manipulation items-center rounded-2xl px-4 py-4 font-display text-base font-semibold tracking-[0.04em] transition-colors duration-200 ${
                        active ? "nav-link-active" : "nav-link-default"
                      }`}
                    >
                      <span className={`nav-link-text ${active ? "soft-pink" : ""}`}>{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
};

export const PageHeader = ({ title }: { title: string }) => (
  <header className="page-header act-rise" style={{ ["--i" as string]: 0 }}>
    <div className="page-header-glow" aria-hidden="true" />
    <div className="page-header-glass">
      <h1 className="page-title-stack font-display">
        <span className="page-title-depth" aria-hidden="true">
          {title}
        </span>
        <span className="page-title-fill page-title-grad">{title}</span>
      </h1>
    </div>
  </header>
);

export const Footer = () => (
  <div className="site-footer-bar relative border-t px-4 py-2.5 sm:px-6">
    <div className="site-footer-inner mx-auto flex max-w-6xl flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
      <span className="logo-gradient font-pixel text-[10px] tracking-[0.1em]">DEVORA</span>
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {["Privacy", "Terms", "FAQs", "Contact"].map((label) => (
          <span key={label} className="site-footer-link font-display text-[10px] font-semibold uppercase tracking-[0.14em]">
            {label}
          </span>
        ))}
      </nav>
      <p className="site-footer-copy font-display text-[10px] leading-none">
        <span className="theme-muted">© 2026 </span>
        <span className="soft-pink font-bold">Devora</span>
        <span className="theme-faint"> · </span>
        <span className="soft-peach font-bold">Chris Shina</span>
        <span className="theme-faint"> · </span>
        <span className="theme-muted">UM-Dearborn </span>
        <span className="theme-heading font-bold">CECS</span>
      </p>
    </div>
  </div>
);
