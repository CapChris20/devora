"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { cityScene } from "@/ui/backgrounds/city-scene";

export default function SettingsPage() {
  return (
    <RetroPageShell
      wide
      scene={cityScene}
      activeItem="Settings"
      title="Settings"
      description="Profile, privacy, notifications, and account — coming soon."
    />
  );
}
