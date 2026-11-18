// FAQs page — Redesigned with modern, spacious Neo-Brutalist layout.
// Clean canvas with zero busy shader noise, crystal-clear typography,
// and full theme awareness across both light and dark mode.
// Strictly ZERO emojis.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import FAQAccordion from "@/ui/faqs/FAQAccordion";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

const FAQ_NAV_LABEL = "FAQs";

export default function FaqsPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen relative transition-colors duration-300 ${
        isLight ? "bg-[#faf8f5] text-[#0a0a0a]" : "bg-[#0c0814] text-[#fbf6f8]"
      }`}
    >
      <div className="relative z-10 min-h-screen flex flex-col">
        <NavBar activeItem={FAQ_NAV_LABEL} />

        {/* ── Spacious Neo-Brutalist Header Card ── */}
        <section
          aria-label="FAQs header"
          className="pt-[calc(clamp(72px,8vw,96px)+64px)] pb-6 relative"
        >
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`relative overflow-hidden rounded-2xl p-8 sm:p-12 transition-all duration-200 ${
                isLight
                  ? "bg-white border-[3px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a]"
                  : "bg-[#140e22] border-[2px] border-white/20 shadow-[6px_6px_0px_#000000]"
              }`}
            >
              {/* Corner Watermark */}
              <span
                aria-hidden="true"
                className={`pointer-events-none select-none absolute top-4 right-5 font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase ${
                  isLight ? "text-[#0a0a0a]/30" : "text-white/20"
                }`}
              >
                DEVORA // 08_FAQS
              </span>

              {/* Status pill badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] font-mono text-[11px] font-black tracking-[0.14em] uppercase shadow-[2px_2px_0px_#000000]">
                <span className="w-2 h-2 rounded-full bg-[#0a0a0a] animate-pulse" />
                <span>CECS KNOWLEDGE BASE · UM-DEARBORN</span>
              </div>

              <h1
                className={`m-0 font-display font-black text-[clamp(36px,5.5vw,72px)] leading-[0.96] tracking-[-0.03em] uppercase ${
                  isLight ? "text-[#0a0a0a]" : "bg-gradient-to-r from-white via-[#ffd76f] to-[#ff9a3d] bg-clip-text text-transparent"
                }`}
              >
                Frequently Asked Questions
              </h1>

              <p
                className={`mt-4 mb-0 font-mono text-base sm:text-lg leading-relaxed max-w-[48em] ${
                  isLight ? "text-[#374151]" : "text-neutral-300"
                }`}
              >
                Clear answers about networking on Devora, verified Michigan
                identities, finding clubs and study groups, and granular privacy controls.
              </p>
            </div>
          </div>
        </section>

        {/* ── Spacious 2-Column FAQ Module ── */}
        <section aria-label="FAQ questions" className="pt-4 pb-24 flex-1">
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
            <FAQAccordion />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
