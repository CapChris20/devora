// Shared site footer per DESIGN.md § 5.5.
// A single row on night with a 1px top border at 10% white and 28px vertical padding.
// Left: "DEVORA" (Unbounded 800 18px)
// Middle: FAQs, Privacy, Terms, Contact links (Space Mono uppercase)
// Right: "© 2026 Devora, Chris Shina, UM‑Dearborn CECS"

"use client";

import Link from "next/link";
import { BUSINESS_CONTACT_EMAIL } from "@/ui/legal/legal-document-copy";

const FOOTER_LINKS = [
  { label: "FAQs", href: "/faqs-page" },
  { label: "Privacy", href: "/privacy-page" },
  { label: "Terms", href: "/terms-page" },
  { label: "Contact", href: `mailto:${BUSINESS_CONTACT_EMAIL}` },
];

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: "var(--night, #0d0b0e)",
        borderTop: "1px solid rgb(255 255 255 / .10)",
        paddingBlock: 28,
        color: "var(--text-muted, rgb(251 246 248 / .70))",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          marginInline: "auto",
          paddingInline: "clamp(20px, 4.5vw, 64px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Left: DEVORA */}
        <span
          style={{
            fontFamily: "var(--font-display), 'Arial Black', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: "0.02em",
            color: "var(--text, #fbf6f8)",
            textTransform: "uppercase",
          }}
        >
          DEVORA
        </span>

        {/* Center: Links */}
        <nav
          aria-label="Footer links"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="footer-nav-link"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-muted, rgb(251 246 248 / .70))",
                transition: "color 180ms ease",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Copyright */}
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            letterSpacing: "0.04em",
            color: "var(--text-muted, rgb(251 246 248 / .70))",
          }}
        >
          &copy; 2026 Devora, Chris Shina, UM&#8209;Dearborn CECS
        </span>
      </div>

      <style jsx>{`
        :global(.footer-nav-link:hover) {
          color: var(--text, #fbf6f8) !important;
        }
      `}</style>
    </footer>
  );
}
