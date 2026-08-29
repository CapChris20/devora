"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { pyramidsScene } from "@/ui/backgrounds/pyramids-scene";

export default function MessagesPage() {
  return (
    <RetroPageShell
      scene={pyramidsScene}
      activeItem="Messages"
      title="Messages"
      description="Direct messages — coming soon."
    />
  );
}
