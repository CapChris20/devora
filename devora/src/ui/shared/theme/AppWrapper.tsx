// Wraps the whole app so dark/light mode and cookie consent exist on every page.
// Flow: layout.tsx nests the page tree here → ThemeProvider → CookieConsentBanner.
// Theme logic lives in DarkLightMode.tsx; consent logic lives under shared/consent.

"use client";

// ===== IMPORTS =====

import type { ReactNode } from "react";

import CookieConsentBanner from "@/ui/shared/consent/CookieConsentBanner";
import { ThemeProvider } from "@/ui/shared/theme/DarkLightMode";

// ===== TYPES =====

type AppWrapperProps = {
  children: ReactNode;
};

// ===== MAIN COMPONENT =====

/**
 * Puts ThemeProvider and the cookie banner around the page tree.
 * @param props.children - Whatever layout.tsx nests inside this wrapper
 * @returns Theme + consent chrome around those children
 */
export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <ThemeProvider>
      {/* Hidden global SVG gradient definition for Lucide icons (DISCOVERY_GRID.md § 2.3) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="gradIcon" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0%" stopColor="#ff9a3d" />
            <stop offset="55%" stopColor="#ff5ca8" />
            <stop offset="100%" stopColor="#ff2bd6" />
          </linearGradient>
        </defs>
      </svg>
      {children}
      <CookieConsentBanner />
    </ThemeProvider>
  );
}
