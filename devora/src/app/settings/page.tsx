// Settings page per DESIGN.md.
// Matrix Rain with runes background taking over the whole page.
// Clean transparent ground with NavBar, h1.t-band "Settings",
// SettingsPageContent panels, and Footer.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import SettingsPageContent from "@/ui/settings/page/SettingsPageContent";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

export default function SettingsPage() {
  return (
    <div
      className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <BackgroundPicture variant="settings" />

      <div className="relative z-10 flex flex-col flex-1 h-full min-h-screen lg:min-h-0 lg:max-h-screen lg:overflow-hidden">
        <NavBar activeItem="Settings" />

        {/* ── Page Header with solid overlay card ── */}
        <section className="settings-header-band">
          <div className="settings-header-inner">
            <div className="settings-hero-card">
              <h1 className="t-band settings-hero-title">Settings</h1>
              <p className="lead settings-hero-lead">
                Control how you show up on Devora, what you get notified about, and how the app looks.
              </p>
            </div>
          </div>
        </section>

        {/* ── Main Settings Panels ── */}
        <main className="settings-main-wrap flex-1 flex flex-col overflow-y-auto lg:overflow-hidden">
          <SettingsPageContent />
        </main>
      </div>

      <style jsx>{`
        .settings-hero-card {
          background: #0d0a11;
          border: 2.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          padding: 14px 22px;
          box-shadow: 6px 6px 0px #000000;
        }

        :global(html[data-theme="light"]) .settings-hero-card {
          background: #ffffff;
          border: 2.5px solid #0a0a0a;
          box-shadow: 6px 6px 0px #0a0a0a;
        }

        .settings-hero-title {
          margin: 0;
          color: #ffffff;
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          font-size: clamp(24px, 2.4vw, 30px);
          line-height: 1.1;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
        }

        :global(html[data-theme="light"]) .settings-hero-title {
          color: #0a0a0a;
          text-shadow: none;
        }

        .settings-hero-lead {
          color: rgba(255, 255, 255, 0.85);
          font-family: var(--font-body), system-ui, sans-serif;
          font-size: 13.5px;
          margin-top: 4px;
          margin-bottom: 0;
        }

        :global(html[data-theme="light"]) .settings-hero-lead {
          color: #4b5563;
        }

        .settings-header-band {
          padding-top: 96px;
          padding-bottom: 14px;
        }

        .settings-header-inner {
          max-width: 1140px;
          margin-inline: auto;
          padding-inline: clamp(16px, 3vw, 32px);
        }

        .settings-main-wrap {
          max-width: 1140px;
          margin-inline: auto;
          padding-inline: clamp(16px, 3vw, 32px);
          padding-bottom: 56px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
