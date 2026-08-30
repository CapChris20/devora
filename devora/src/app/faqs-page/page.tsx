"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { peaksScene } from "@/ui/backgrounds/peaks-scene";

export default function FaqsPage() {
  return (
    <RetroPageShell
      scene={peaksScene}
      activeItem="FAQs"
      title="FAQs"
      description="Common questions about Devora — coming soon."
    />
  );
}
