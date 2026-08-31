"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import { pyramidsScene } from "@/ui/backgrounds/pyramids";

export default function MessagesPage() {
  return (
    <PageLayout
      wide
      scene={pyramidsScene}
      activeItem="Activity Center"
      title="Activity Center"
      titleClassName="headline-grad"
      description="Messages, connections, events, and activity — coming soon."
    />
  );
}
