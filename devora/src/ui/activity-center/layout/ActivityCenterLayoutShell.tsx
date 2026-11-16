// Activity Center shared layout shell.
// Combines App NavBar, Firebase Auth gate (SignedInGate), Hero with Bento WeekTiles,
// infinite EventTicker, sticky TabNav with sliding pill, and tab page content.

"use client";

// ===== IMPORTS =====

import type { ReactNode } from "react";

import { NB_FONT_CLASS_NAME } from "@/ui/shared/design-law/nb-fonts";
import SignedInGate from "@/ui/shared/design-law/SignedInGate";
import NavBar from "@/ui/shared/navbar/NavBar";

import { ActivityCenterProvider, useActivityCenter } from "../ActivityCenterContext";
import Toast from "../shared/Toast";
import EventTicker from "./EventTicker";
import Hero from "./Hero";
import TabNav from "./TabNav";

// ===== INNER LAYOUT WITH CONTEXT ACCESS =====

function ActivityCenterInnerShell({ children }: { children: ReactNode }) {
  const { toastText } = useActivityCenter();

  return (
    <div
      className={`${NB_FONT_CLASS_NAME} relative min-h-screen bg-nb-paper font-nb-body text-nb-ink antialiased selection:bg-nb-pink selection:text-nb-ink`}
    >
      {/* Top application navbar with Activity Center highlighted */}
      <NavBar activeItem="Activity Center" />

      {/* Main content body clearing top navbar */}
      <div className="w-full pt-16 sm:pt-20">
        {/* Top section: Hero title, lede, and Bento WeekTiles */}
        <Hero />

        {/* Infinite scrolling event ticker band */}
        <EventTicker />

        {/* Sticky Tab navigation bar with animated gradient pill */}
        <TabNav />

        {/* Active tab content panel protected by Auth Gate */}
        <main className="panel py-8 pb-20">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <SignedInGate>{children}</SignedInGate>
          </div>
        </main>

        {/* Bottom toast alert */}
        <Toast message={toastText} />
      </div>
    </div>
  );
}

// ===== MAIN EXPORTED SHELL =====

export default function ActivityCenterLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ActivityCenterProvider>
      <ActivityCenterInnerShell>{children}</ActivityCenterInnerShell>
    </ActivityCenterProvider>
  );
}
