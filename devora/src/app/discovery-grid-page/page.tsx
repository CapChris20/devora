"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { peaksScene } from "@/ui/backgrounds/peaks-scene";

export default function DiscoveryGridPage() {
  return (
    <RetroPageShell
      scene={peaksScene}
      activeItem="Discovery Grid"
      title="Discovery Grid"
      description="Browse and connect with CECS students — coming soon."
    />
  );
}
