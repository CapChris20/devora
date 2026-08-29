"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { cityScene } from "@/ui/backgrounds/city-scene";
import ThemeSettings from "@/ui/theme/ThemeSettings";

export default function SettingsPage() {
  return (
    <RetroPageShell
      scene={cityScene}
      activeItem="Settings"
      title="Settings"
      description="Customize your Devora experience."
    >
      <ThemeSettings />
    </RetroPageShell>
  );
}
