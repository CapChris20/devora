// Account page per DESIGN.md § 5.2.
// Shaded with Flopine's torus + sphere SDF raymarching background taking over the whole page.
// NavBar -> AccountPageContent -> Footer.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";
import AccountPageContent from "@/ui/account/AccountPageContent";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

export default function AccountPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <BackgroundPicture variant="account" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar activeItem="Account" />

        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-14">
          <AccountPageContent />
        </main>

        <Footer />
      </div>
    </div>
  );
}
