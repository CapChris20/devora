// Account page per DESIGN.md § 5.2.
// Shaded with Shane's hexagonal Voronoi kaleidoscope tunnel in neo-brutalist secondary gradients.
// NavBar -> AccountPageContent -> Footer.

"use client";

import NavBar from "@/ui/shared/navbar/NavBar";
import AccountPageContent from "@/ui/account/AccountPageContent";
import VoronoiKaleidoscopeShaderBackgroundClient from "@/ui/shared/backgrounds/VoronoiKaleidoscopeShaderBackgroundClient";

export default function AccountPage() {
  return (
    <div
      className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col relative"
      style={{
        color: "var(--text, #fbf6f8)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <VoronoiKaleidoscopeShaderBackgroundClient fixed className="z-0" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 h-full min-h-screen lg:min-h-0 lg:max-h-screen lg:overflow-hidden">
        <NavBar activeItem="Account" />

        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-[96px] sm:pt-[104px] pb-4 flex flex-col justify-start overflow-y-auto lg:overflow-hidden">
          <AccountPageContent />
        </main>
      </div>
    </div>
  );
}
