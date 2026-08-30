"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { peaksScene } from "@/ui/backgrounds/peaks-scene";

export default function DiscoveryGridPage() {
  return (
    <RetroPageShell
      wide
      scene={peaksScene}
      activeItem="Discovery Grid"
      title="Discovery Grid"
      description="Browse CECS students by major, interests, and skills — coming soon."
    />
  );
}
