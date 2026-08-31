"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import { pyramidsScene } from "@/ui/backgrounds/pyramids";

export default function AccountPage() {
  return (
    <PageLayout
      scene={pyramidsScene}
      activeItem="Account"
      title="Account"
      description="Profile and account settings coming soon."
    />
  );
}
