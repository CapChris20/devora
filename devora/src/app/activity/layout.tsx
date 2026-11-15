// Shared frame for the Activity Center tabs (/activity/study-groups, /activity/clubs).
// Flow: DesignLawPage (fonts, NavBar, title, auth gate) → TabNav → the active tab's page.
// Messages and Connections are NOT here — they have their own NavBar links (/messages, /connections).

// ===== IMPORTS =====

import type { Metadata } from "next";
import type { ReactNode } from "react";

import DesignLawPage from "@/ui/shared/design-law/DesignLawPage";
import TabNav from "@/ui/activity-tabs/nav/TabNav";

// ===== MAIN =====

export const metadata: Metadata = {
  title: "Activity Center — Devora",
  description: "Study groups and CECS clubs.",
};

/**
 * Activity Center frame. Switching tabs keeps this mounted, so the tab pill can slide.
 * @param props.children - The page for the active tab
 */
export default function ActivityLayout({ children }: { children: ReactNode }) {
  return (
    <DesignLawPage
      navLabel="Activity Center"
      eyebrow="CECS · UM-Dearborn"
      title="Activity Center"
      blurb="Study groups for your courses and the clubs worth knowing. Built for students who commute."
      tabs={<TabNav />}
    >
      {children}
    </DesignLawPage>
  );
}
