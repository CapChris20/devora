// Shared page shell for auth screens (login, signup, onboarding, welcome).
// Pyramid shader background, navbar, and centered glass card wrapping child content.
// Pass wide for the multi-step onboarding form; leave default for login/signup cards.

"use client";

// ===== IMPORTS =====

import type { ReactNode } from "react";
import Link from "next/link";
import NavBar from "@/ui/shared/navbar/NavBar";
import PyramidShaderBackgroundClient from "@/ui/shared/backgrounds/PyramidShaderBackgroundClient";

// ===== NAMED CONSTANTS =====

const HOME_PATH = "/home";
const EMPTY_NAV_ACTIVE_ITEM = "";
const BACK_TO_HOME_LABEL = "← Back to home";
const WIDE_CARD_MAX_WIDTH_CLASS = "max-w-2xl";
const DEFAULT_CARD_MAX_WIDTH_CLASS = "max-w-md";
const CARD_SHELL_CLASS_NAME = "sign-in-card glass-card w-full rounded-2xl p-6 sm:p-8";

// ===== TYPES =====

type SignInPageLayoutProps = {
  // vocab: ReactNode = anything React can render (the login, signup, or onboarding form)
  children: ReactNode;
  // vocab: wide? = optional; true = wider card for the multi-step onboarding form
  // Manipulate here: change the max-width constants if the card widths feel wrong
  wide?: boolean;
};

// ===== MAIN COMPONENT =====

/**
 * Full-page auth chrome: background, nav, glass card, and a back link.
 * @param props - The form to center, and whether the card should be wide
 * @param props.children - Login, signup, onboarding, or welcome content
 * @param props.wide - True for the multi-step onboarding form
 * @returns The auth page shell
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
      {/* Animated pyramid background behind everything (client wrapper loads the WebGL canvas) */}
      <PyramidShaderBackgroundClient className="z-0" />

      {/* Empty activeItem so no nav link looks current on auth pages */}
      <NavBar activeItem={EMPTY_NAV_ACTIVE_ITEM} />

      {/* Centered column: glass card (children) plus a back-to-home link */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-28 sm:px-6">
        <div className={`${CARD_SHELL_CLASS_NAME} ${cardWidthClassName}`}>{children}</div>

        {/* Manipulate here: change HOME_PATH if the marketing homepage route moves */}
        <Link href={HOME_PATH} className="app-secondary-btn mt-8">
          {BACK_TO_HOME_LABEL}
        </Link>
      </div>
    </main>
  );
}
