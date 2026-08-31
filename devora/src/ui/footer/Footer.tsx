import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/faqs-page" },
  { label: "Terms", href: "/faqs-page" },
  { label: "FAQs", href: "/faqs-page" },
  { label: "Contact", href: "mailto:devora@umich.edu" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="site-footer-bar relative border-t border-[#ff5ca8]/15 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="logo-gradient font-pixel text-sm tracking-[0.08em]">DEVORA</span>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="site-footer-link font-display text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-footer-copy space-y-2 font-display text-[11px] leading-relaxed sm:text-xs">
          <p>
            <span className="theme-muted">© {year} </span>
            <span className="devora-gradient-text font-bold">Devora</span>
            <span className="theme-faint"> · </span>
            <span className="headline-grad font-bold">Chris Shina</span>
          </p>
          <p className="theme-muted">
            Sponsored by{" "}
            <span className="theme-muted">UM-Dearborn </span>
            <span className="devora-gradient-text font-bold">CECS</span>
            <span className="theme-faint"> · </span>
            Proctored by <span className="headline-grad font-bold">Dr. Bruce Maxim</span>
          </p>
        </div>
      </div>
    </div>
  );
}
