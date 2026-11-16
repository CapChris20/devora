// FAQs page — redesigned per DESIGN.md and neo-brutalist theme law.
// Full theme awareness: 100% visible, high-contrast, crystal-clear typography on both light and dark mode.
// Zero emojis, crisp block shadows, Devora synthwave palette.

"use client";

// ===== IMPORTS =====

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import FAQAccordion from "@/ui/faqs/FAQAccordion";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

// ===== NAMED CONSTANTS =====

const FAQ_NAV_LABEL = "FAQs";

// ===== MAIN COMPONENT =====

/**
 * FAQs page. Shaded background takes over the entire page and combines with header.
 * Fully responsive to light and dark theme with zero low-contrast text.
 */
export default function FaqsPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen relative transition-colors duration-300 ${
        isLight ? "bg-[#faf6f8] text-[#0a0a0a]" : "bg-[#08040f] text-[#fbf6f8]"
      }`}
    >
      <BackgroundPicture variant="faqs" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <NavBar activeItem={FAQ_NAV_LABEL} />

        {/* ── Header with solid high-contrast card ── */}
        <section
          aria-label="FAQs header"
          className="pt-[calc(clamp(72px,8vw,96px)+64px)] pb-6 relative"
        >
          <div className="max-w-[980px] mx-auto px-5 sm:px-8 lg:px-12">
            <div
              className={`relative overflow-hidden rounded-2xl p-7 sm:p-10 transition-all duration-200 ${
                isLight
                  ? "bg-white border-[3px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a]"
                  : "bg-[#0f0918] border-[3px] border-[#ff5ca8] shadow-[6px_6px_0px_#000000]"
              }`}
            >
              {/* Corner Watermark */}
              <span
                aria-hidden="true"
                className={`pointer-events-none select-none absolute top-4 right-5 font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase ${
                  isLight ? "text-[#0a0a0a]/30" : "text-[#ff5ca8]/40"
                }`}
              >
                DEVORA // 08_FAQS
              </span>

              {/* Status pill badge */}
              <div className="inline-flex items-center gap-2 mb-3.5 px-3 py-1 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] font-mono text-[11px] font-black tracking-[0.14em] uppercase shadow-[2px_2px_0px_#000000]">
                <span className="w-2 h-2 rounded-full bg-[#0a0a0a] animate-pulse" />
                <span>SYSTEM // KNOWLEDGE_BASE</span>
              </div>

              <h1
                className={`m-0 font-display font-extrabold text-[clamp(36px,6vw,76px)] leading-[0.95] tracking-[-0.035em] uppercase ${
                  isLight
                    ? "text-[#0a0a0a]"
                    : "bg-gradient-to-r from-[#ffd76f] via-[#ff5ca8] to-[#ff2bd6] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,92,168,0.3)]"
                }`}
              >
                FAQs
              </h1>

              <p
                className={`mt-4 mb-0 font-mono text-base sm:text-lg leading-relaxed max-w-[44em] ${
                  isLight ? "text-[#2a2226]" : "text-[#f4eefc]/90"
                }`}
              >
                Answers about Devora, networking, privacy, and how the CECS hub
                works for students at UM&#8209;Dearborn.
              </p>
            </div>
          </div>
        </section>

        {/* ── Accordion section combining seamlessly with full-page shader ── */}
        <section
          aria-label="FAQ questions"
          className="pt-6 pb-24 flex-1"
        >
          <div className="max-w-[980px] mx-auto px-5 sm:px-8 lg:px-12">
            <FAQAccordion />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
