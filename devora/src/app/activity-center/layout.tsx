// Shared layout for /activity-center routes.
// Wraps child tab routes (events, study-groups) in the Activity Center shell.
// Maintains persistent hero, ticker, and tab bar state during navigation.

// ===== IMPORTS =====

import type { Metadata } from "next";
import type { ReactNode } from "react";

import ActivityCenterLayoutShell from "@/ui/activity-center/layout/ActivityCenterLayoutShell";

// ===== METADATA =====

export const metadata: Metadata = {
  title: "Activity Center — Devora",
  description:
    "Events and study groups for CECS students at UM-Dearborn.",
};

// ===== MAIN LAYOUT =====

export default function ActivityCenterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ActivityCenterLayoutShell>{children}</ActivityCenterLayoutShell>;
}
