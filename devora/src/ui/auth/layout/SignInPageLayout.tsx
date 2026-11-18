// Shared page shell for auth screens (login, signup, onboarding, welcome).
// Uses the neo-brutalist secondary gradient Voronoi shader background, navbar, and centered card.

"use client";

// ===== IMPORTS =====

import type { ReactNode } from "react";
import Link from "next/link";
import NavBar from "@/ui/shared/navbar/NavBar";
import BackgroundPicture from "@/ui/shared/backgrounds/BackgroundPicture";

// ===== NAMED CONSTANTS =====

const HOME_PATH = "/home";
const EMPTY_NAV_ACTIVE_ITEM = "";
const BACK_TO_HOME_LABEL = "Back to home";
const WIDE_CARD_MAX_WIDTH_CLASS = "max-w-2xl";
const DEFAULT_CARD_MAX_WIDTH_CLASS = "max-w-md";
const CARD_SHELL_CLASS_NAME = "sign-in-card w-full p-6 sm:p-8";

// ===== TYPES =====

type SignInPageLayoutProps = {
  children: ReactNode;
  wide?: boolean;
};

// ===== MAIN COMPONENT =====

/**
 * Full-page auth chrome: neo-brutalist shader background, nav, glass card, and a back link.
 */
export default function SignInPageLayout({
  children,
  wide: isWideCard = false,
}: SignInPageLayoutProps) {
  const cardWidthClassName = isWideCard
    ? WIDE_CARD_MAX_WIDTH_CLASS
    : DEFAULT_CARD_MAX_WIDTH_CLASS;

  return (
    <main className="sign-in-page relative flex min-h-screen flex-col overflow-hidden">
      {/* Shane hexagonal Voronoi tunnel in neo-brutalist secondary gradients */}
      <BackgroundPicture variant="account" />

      {/* Empty activeItem so no nav link looks current on auth pages */}
      <NavBar activeItem={EMPTY_NAV_ACTIVE_ITEM} />

      {/* Centered column: card plus a back-to-home link */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-24 sm:px-6">
        <div className={`relative w-full ${cardWidthClassName}`}>
          <div
            className="pointer-events-none absolute -inset-1.5 rounded-[32px] bg-gradient-to-r from-[#ffd76f]/25 via-[#ff9a3d]/20 to-[#ff5ca8]/25 opacity-70 blur-xl transition-opacity duration-500 dark:opacity-45"
            aria-hidden
          />
          <div className={CARD_SHELL_CLASS_NAME}>{children}</div>
        </div>

        <Link href={HOME_PATH} className="sign-in-back-btn mt-7 group">
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>{BACK_TO_HOME_LABEL}</span>
        </Link>
      </div>
    </main>
  );
}
