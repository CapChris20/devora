// Site-wide footer — DEVORA wordmark, quick links, and copyright / capstone credits.
// Used by PageLayout and JoinNowSection. Privacy/Terms currently route to FAQs.

import Link from "next/link";

// Footer nav — Privacy/Terms currently point at FAQs until dedicated pages exist.
// Manipulate here: change hrefs when real Privacy/Terms routes ship; mailto opens the mail app.
const FOOTER_LINKS = [
  { label: "Privacy", href: "/faqs-page" },
  { label: "Terms", href: "/faqs-page" },
  { label: "FAQs", href: "/faqs-page" },
  { label: "Contact", href: "mailto:devora@umich.edu" },
] as const;
// vocab: as const = treat these link objects as fixed read-only data


export default function Footer() {
  // Fresh year each render so copyright stays current without hardcoding.
  // vocab: getFullYear() = 4-digit year from the computer clock (e.g. 2026)
  const year = new Date().getFullYear();

  return (
    // site-footer-* classes (border, link hover, muted copy) live in globals.css
    <div className="site-footer-bar relative border-t px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        {/* Small pixel wordmark — logo-gradient = brand fill */}
        <span className="logo-gradient font-pixel text-sm tracking-[0.08em]">DEVORA</span>

        {/* Quick links row — wraps on narrow screens */}
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            // vocab: key={link.label} = React identity for each link in the list
            <Link
              key={link.label}
              href={link.href}
              className="site-footer-link font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright + sponsor / proctor credits — calm solid text (wordmark above keeps brand fill). */}
        <div className="site-footer-copy space-y-2 font-display text-[11px] leading-relaxed sm:text-xs">
          <p>
            <span className="theme-muted">© {year} </span>
            <span className="soft-pink font-bold">Devora</span>
            <span className="theme-faint"> · </span>
            <span className="soft-peach font-bold">Chris Shina</span>
          </p>
          <p className="theme-muted">
            Sponsored by{" "}
            <span className="theme-muted">UM-Dearborn </span>
            <span className="soft-violet font-bold">CECS</span>
            <span className="theme-faint"> · </span>
            Proctored by <span className="soft-pink font-bold">Dr. Bruce Maxim</span>
          </p>
        </div>
      </div>
    </div>
  );
}
