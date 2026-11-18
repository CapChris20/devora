// FAQs page for Devora — Clean Design Law canvas.
// Wraps FAQAccordion (which owns the bold Archivo header & ramp strip).
// Strictly zero emojis, zero pink borders, zero AI slop.

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
      className={`min-h-screen relative transition-colors duration-200 ${
        isLight ? "bg-[#faf8f5] text-[#0a0a0a]" : "bg-[#0e0918] text-[#ffffff]"
      }`}
    >
      <div className="relative z-10 min-h-screen flex flex-col">
        <NavBar activeItem={FAQ_NAV_LABEL} />

        {/* ── Main FAQ Canvas ── */}
        <main className="flex-1 pt-[calc(clamp(64px,7vw,84px)+48px)] pb-24">
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
            <FAQAccordion />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
