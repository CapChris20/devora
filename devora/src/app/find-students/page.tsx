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
            <div className="discovery-hero-card">
              <h1 className="discovery-hero-title">
                Discovery Grid
              </h1>
              <p className="discovery-hero-lead">
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

      <style jsx>{`
        .discovery-hero-card {
          background: #0d0a11;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          padding: clamp(28px, 4vw, 42px);
          box-shadow: 8px 8px 0px #000000;
        }

        :global(html[data-theme="light"]) .discovery-hero-card {
          background: #ffffff;
          border: 2.5px solid #0a0a0a;
          box-shadow: 6px 6px 0px #0a0a0a;
        }

        .discovery-hero-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: clamp(36px, 6.5vw, 84px);
          line-height: 0.95;
          letter-spacing: -0.035em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.7);
        }

        :global(html[data-theme="light"]) .discovery-hero-title {
          color: #0a0a0a;
          text-shadow: none;
        }

        .discovery-hero-lead {
          font-family: var(--font-mono), monospace;
          font-size: clamp(16px, 1.4vw, 19px);
          line-height: 1.55;
          max-width: 46em;
          margin-top: 16px;
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.92);
        }

        :global(html[data-theme="light"]) .discovery-hero-lead {
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}
