// Shared frame for the Campus Hub tabs (/activity/study-groups, /activity/clubs).
// Flow: DesignLawPage (fonts, NavBar, title, auth gate) → TabNav → the active tab's page.
// Messages and Connections are NOT here — they have their own NavBar links (/messages, /connections).

// ===== IMPORTS =====

import type { Metadata } from "next";
import type { ReactNode } from "react";

import DesignLawPage from "@/ui/shared/design-law/DesignLawPage";
import TabNav from "@/ui/activity-tabs/nav/TabNav";

// ===== MAIN =====

export const metadata: Metadata = {
  title: "Campus Hub — Devora",
  description: "Study groups and CECS clubs.",
};

/**
 * Campus Hub frame. Switching tabs keeps this mounted, so the tab pill can slide.
 * @param props.children - The page for the active tab
 */
export default function ActivityLayout({ children }: { children: ReactNode }) {
  return (
    <DesignLawPage
      navLabel="Campus Hub"
      eyebrow="CECS · UM-Dearborn"
      title="Campus Hub"
      blurb="Study groups for your courses and the clubs worth knowing. Built for students who commute."
      tabs={<TabNav />}
    >
      {children}
    </DesignLawPage>
  );
}
