"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { pyramidsScene } from "@/ui/backgrounds/pyramids-scene";

export default function MessagesPage() {
  return (
    <RetroPageShell
      wide
      scene={pyramidsScene}
      activeItem="Activity Center"
      title="Activity Center"
      description="Messages, connections, events, and activity — coming soon."
    />
  );
}
