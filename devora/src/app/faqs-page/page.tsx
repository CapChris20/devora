"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import { mountainsScene } from "@/ui/backgrounds/mountains";

export default function FaqsPage() {
  return (
    <PageLayout
      scene={mountainsScene}
      activeItem="FAQs"
      title="FAQs"
      titleClassName="pink-grad"
      description="Common questions about Devora — coming soon."
    />
  );
}
