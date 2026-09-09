// Settings page shell — privacy, notifications, and theme controls in SettingsPageContent.
// Flow: route mounts → PageLayout chrome → SettingsPageContent holds the panels.

"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import SettingsPageContent from "@/ui/settings/SettingsPageContent";

// Thin route: shared layout + settings panels (toggles, danger zone).
// vocab: "use client" = browser component (toggles / danger zone need client JS)
// vocab: PageLayout = shared app chrome (nav + Voronoi background + title)
export default function SettingsPage() {
  return (
    <PageLayout
      // vocab: wide = give the content more horizontal room than default pages
      wide
      activeItem="Settings"
      title="Settings"
      // Manipulate here: titleClassName / description = page header look + subtitle copy
      titleClassName="devora-gradient-text"
      description="Control how you show up on Devora, what you get notified about, and how the app looks."
    >
      {/* Privacy, notifications, theme, deactivate/delete — logic is in SettingsPageContent */}
      <SettingsPageContent />
    </PageLayout>
  );
}
