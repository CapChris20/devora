"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import { cityScene } from "@/ui/backgrounds/city";

export default function SettingsPage() {
  return (
    <PageLayout
      wide
      scene={cityScene}
      activeItem="Settings"
      title="Settings"
      titleClassName="devora-gradient-text"
      description="Profile, privacy, notifications, and account — coming soon."
    />
  );
}
