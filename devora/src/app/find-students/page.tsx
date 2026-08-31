"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import { mountainsScene } from "@/ui/backgrounds/mountains";

export default function DiscoveryGridPage() {
  return (
    <PageLayout
      wide
      scene={mountainsScene}
      activeItem="Discovery Grid"
      title="Discovery Grid"
      titleClassName="logo-gradient"
      description="Browse CECS students by major, interests, and skills — coming soon."
    />
  );
}
