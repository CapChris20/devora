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

        {/* ── Header with solid opaque overlay card ── */}
        <section
          aria-label="FAQs header"
          style={{
            paddingTop: "calc(clamp(72px, 8vw, 96px) + 60px)",
            paddingBottom: 24,
            position: "relative",
          }}
        >
          <div
            style={{
              maxWidth: 980,
              marginInline: "auto",
              paddingInline: "clamp(20px, 4.5vw, 64px)",
            }}
          >
            <div
              style={{
                background: "#0c0a0e",
                border: "2px solid rgba(255, 92, 168, 0.35)",
                borderRadius: 24,
                padding: "clamp(28px, 4vw, 44px)",
                boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.75), 0 0 24px -8px rgba(255, 92, 168, 0.25)",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display), 'Arial Black', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(38px, 6.5vw, 88px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.035em",
                  textTransform: "uppercase",
                  textWrap: "balance",
                  color: "#ffffff",
                  margin: 0,
                  textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                }}
              >
                FAQs
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(16px, 1.4vw, 19px)",
                  lineHeight: 1.55,
                  maxWidth: "42em",
                  marginTop: 18,
                  marginBottom: 0,
                  color: "rgba(255, 255, 255, 0.92)",
                }}
              >
                Answers about Devora, networking, privacy and how the CECS hub
                works.
              </p>
            </div>
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
