// Settings page per DESIGN.md.
// Matrix Rain with runes background taking over the whole page.
// Clean transparent ground with NavBar, h1.t-band "Settings",
// SettingsPageContent panels, and Footer.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import SettingsPageContent from "@/ui/settings/page/SettingsPageContent";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

export default function SettingsPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <BackgroundPicture variant="settings" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar activeItem="Settings" />

        {/* ── Page Header with solid overlay card ── */}
        <section className="settings-header-band">
          <div className="settings-header-inner">
            <div
              style={{
                background: "#0d0a11",
                border: "2px solid rgba(255, 92, 168, 0.35)",
                borderRadius: 24,
                padding: "clamp(28px, 4vw, 40px)",
                boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.75), 0 0 24px -8px rgba(255, 92, 168, 0.2)",
              }}
            >
              <h1 className="t-band text-white" style={{ margin: 0, textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>Settings</h1>
              <p className="lead mt-3 mb-0" style={{ color: "rgba(255, 255, 255, 0.92)", fontSize: "clamp(16px, 1.4vw, 19px)" }}>
                Control how you show up on Devora, what you get notified about, and how the app looks.
              </p>
            </div>
          </div>
        </section>

        {/* ── Main Settings Panels ── */}
        <main className="settings-main-wrap flex-1">
          <SettingsPageContent />
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .settings-header-band {
          padding-top: clamp(100px, 11vw, 136px);
          padding-bottom: 28px;
        }

        .settings-header-inner {
          max-width: 1080px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4.5vw, 64px);
        }

        .settings-main-wrap {
          max-width: 1080px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4.5vw, 64px);
          padding-bottom: 80px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
