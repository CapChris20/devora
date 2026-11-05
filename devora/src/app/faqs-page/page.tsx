// FAQs page — redesigned per DESIGN.md § 5.4.
// Shaded with Kikkō Ajiro rhombille tiling background taking over the whole page.
// Structure: gradient band combining with shader → night section with search + accordion.

"use client";

// ===== IMPORTS =====

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import FAQAccordion from "@/ui/faqs/FAQAccordion";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

// ===== NAMED CONSTANTS =====

const FAQ_NAV_LABEL = "FAQs";

// ===== MAIN COMPONENT =====

/**
 * FAQs page. Shaded background takes over the entire page and combines with header.
 * Section 5.4 of DESIGN.md.
 */
export default function FaqsPage() {
  return (
    <div
      className="min-h-screen relative"
      style={{ color: "#fbf6f8" }}
    >
      <BackgroundPicture variant="faqs" />

      <div className="relative z-10 min-h-screen">
        <NavBar activeItem={FAQ_NAV_LABEL} />

        {/* ── Gradient band combining with shader ── */}
        <section
          aria-label="FAQs header"
          style={{
            background: "linear-gradient(120deg, rgba(255, 154, 61, 0.35) 0%, rgba(255, 92, 168, 0.35) 52%, rgba(255, 43, 214, 0.35) 100%)",
            color: "#ffffff",
            paddingBlock: "clamp(88px, 9vw, 104px)",
            paddingTop: "calc(clamp(88px, 9vw, 104px) + 68px)",
            position: "relative",
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              marginInline: "auto",
              paddingInline: "clamp(20px, 4.5vw, 64px)",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display), 'Arial Black', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(40px, 7.4vw, 112px)",
                lineHeight: 0.9,
                letterSpacing: "-0.035em",
                textTransform: "uppercase",
                textWrap: "balance",
                color: "#ffffff",
                margin: 0,
              }}
            >
              FAQs
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "clamp(18px, 1.5vw, 21px)",
                lineHeight: 1.5,
                maxWidth: "34em",
                marginTop: 24,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Answers about Devora, networking, privacy and how the CECS hub
              works.
            </p>
          </div>
        </section>

        {/* ── Accordion section combining seamlessly with full-page shader ── */}
        <section
          aria-label="FAQ questions"
          style={{
            paddingTop: 48,
            paddingBottom: 96,
          }}
        >
          <div
            style={{
              maxWidth: 980,
              marginInline: "auto",
              paddingInline: "clamp(20px, 4.5vw, 64px)",
            }}
          >
            <FAQAccordion />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
