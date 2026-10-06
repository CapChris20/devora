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
    // Manipulate here: py / gap = footer height — keep this a slim bar, not a third page
    <div className="site-footer-bar relative border-t px-4 py-2.5 sm:px-6">
      <div className="site-footer-inner mx-auto flex max-w-6xl flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
        {/* Small pixel wordmark — logo-gradient = brand fill */}
        <span className="logo-gradient font-pixel text-[10px] tracking-[0.1em]">DEVORA</span>

        {/* Quick links — one row with the wordmark on desktop */}
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            // vocab: key={link.label} = React identity for each link in the list
            <Link
              key={link.label}
              href={link.href}
              className="site-footer-link font-display text-[10px] font-semibold uppercase tracking-[0.14em]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* One-line credits so the bar stays short */}
        <p className="site-footer-copy font-display text-[10px] leading-none">
          <span className="theme-muted">© {year} </span>
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
}
