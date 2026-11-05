// Discovery Grid page per DESIGN.md § 5.3.
// Halftone Dots animated background in Devora brand gradient taking over the whole page.
// Clean opaque hero card, toolbar, and the live student grid.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import DiscoveryGridContent from "@/ui/discovery/DiscoveryGridContent";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

export default function DiscoveryGridPage() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <BackgroundPicture variant="discovery" />

      <div className="relative z-10 min-h-screen">
        <NavBar activeItem="Discovery Grid" />

        {/* ── Hero band with solid opaque overlay card ── */}
        <section
          aria-label="Discovery Grid hero"
          style={{
            paddingTop: "calc(clamp(72px, 8vw, 96px) + 52px)",
            paddingBottom: 16,
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
            <div
              style={{
                background: "#0d0a11",
                border: "2px solid rgba(255, 92, 168, 0.35)",
                borderRadius: 24,
                padding: "clamp(28px, 4vw, 42px)",
                boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.75), 0 0 24px -8px rgba(255, 92, 168, 0.2)",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display), 'Arial Black', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(36px, 6.5vw, 84px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.035em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  margin: 0,
                  textShadow: "0 2px 14px rgba(0,0,0,0.7)",
                }}
              >
                Discovery Grid
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(16px, 1.4vw, 19px)",
                  lineHeight: 1.55,
                  maxWidth: "46em",
                  marginTop: 16,
                  marginBottom: 0,
                  color: "rgba(255, 255, 255, 0.92)",
                }}
              >
                Find friends, colleagues and people in your career niche across CECS.
              </p>
            </div>
          </div>
        </section>

        {/* ── Main Grid Container ── */}
        <main
          style={{
            maxWidth: 1240,
            marginInline: "auto",
            paddingInline: "clamp(20px, 4.5vw, 64px)",
            paddingBottom: 96,
            paddingTop: 16,
          }}
        >
          <DiscoveryGridContent />
        </main>

        <Footer />
      </div>
    </div>
  );
}
