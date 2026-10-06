// Shared page shell for auth screens (login, signup, onboarding, welcome).
// Pyramid shader background, navbar, and centered glass card wrapping child content.
// Pass wide for the multi-step onboarding form; leave default for login/signup cards.

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import NavBar from "@/ui/shared/navbar/NavBar";
import PyramidShaderBackgroundClient from "@/ui/shared/backgrounds/PyramidShaderBackgroundClient";

type SignInPageLayoutProps = {
  // vocab: ReactNode = anything React can render (the login/signup/onboarding form, etc.)
  children: ReactNode;
  // vocab: wide? = optional; true = wider card for the multi-step onboarding form
  // Manipulate here: change max-w-2xl / max-w-md below if card widths feel wrong
  wide?: boolean;
};

// Full-page auth chrome — background + nav + glass card + back link.
export default function SignInPageLayout({ children, wide = false }: SignInPageLayoutProps) {
  return (
    <main className="sign-in-page relative flex min-h-screen flex-col overflow-hidden">
      {/* Animated pyramid background behind everything (client wrapper loads the WebGL canvas) */}
      <PyramidShaderBackgroundClient className="z-0" />

      {/* Empty activeItem so no nav link looks "current" on auth pages */}
      <NavBar activeItem="" />

      {/* Centered column: glass card (children) + back-to-home link */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-28 sm:px-6">
        {/* wide = onboarding form; default = login/signup card width */}
        <div
          className={`sign-in-card glass-card w-full rounded-2xl p-6 sm:p-8 ${
            wide ? "max-w-2xl" : "max-w-md"
          }`}
        >
          {children}
        </div>

        {/* Manipulate here: change href if the marketing homepage route moves */}
        <Link href="/home" className="app-secondary-btn mt-8">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
