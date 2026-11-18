// Discovery Grid page per DESIGN.md § 5.3.
// Halftone Dots animated background in Devora brand gradient taking over the whole page.
// Clean opaque hero card, toolbar, and the live student grid.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import DiscoveryGridContent from "@/ui/discovery/DiscoveryGridContent";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

export default function DiscoveryGridPage() {
  return (
    <div
      className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <BackgroundPicture variant="discovery" />

      <div className="relative z-10 flex flex-col flex-1 h-full min-h-screen lg:min-h-0 lg:max-h-screen lg:overflow-hidden">
        <NavBar activeItem="Discovery Grid" />

        {/* ── Hero band with solid opaque overlay card ── */}
        <section
          aria-label="Discovery Grid hero"
          style={{
            paddingTop: "70px",
            paddingBottom: "6px",
            position: "relative",
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              marginInline: "auto",
              paddingInline: "clamp(16px, 3vw, 32px)",
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
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            maxWidth: 1240,
            width: "100%",
            marginInline: "auto",
            paddingInline: "clamp(16px, 3vw, 32px)",
            paddingBottom: 10,
            paddingTop: 4,
          }}
        >
          <DiscoveryGridContent />
        </main>
      </div>

      <style jsx>{`
        .discovery-hero-card {
          background: #0d0a11;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          padding: 8px 16px;
          box-shadow: 4px 4px 0px #000000;
        }

        :global(html[data-theme="light"]) .discovery-hero-card {
          background: #ffffff;
          border: 2px solid #0a0a0a;
          box-shadow: 4px 4px 0px #0a0a0a;
        }

        .discovery-hero-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: clamp(18px, 1.8vw, 22px);
          line-height: 1.1;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
        }

        :global(html[data-theme="light"]) .discovery-hero-title {
          color: #0a0a0a;
          text-shadow: none;
        }

        .discovery-hero-lead {
          font-family: var(--font-body), system-ui, sans-serif;
          font-size: 11.5px;
          line-height: 1.4;
          margin-top: 2px;
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.85);
        }

        :global(html[data-theme="light"]) .discovery-hero-lead {
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}
