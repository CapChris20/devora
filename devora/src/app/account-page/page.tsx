"use client";

import RetroPageShell from "@/ui/backgrounds/RetroPageShell";
import { pyramidsScene } from "@/ui/backgrounds/pyramids-scene";

export default function AccountPage() {
  return (
    <RetroPageShell
      scene={pyramidsScene}
      activeItem="Account"
      title="Account"
      description="Profile and account settings coming soon."
    />
  );
}
