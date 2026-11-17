// /activity-center/clubs — Fifth tab of the Activity Center: CECS Student Organizations.
// Shows all verified CECS clubs with one-click follow, category filters, and feeds.

import type { Metadata } from "next";
import ClubsFeed from "@/ui/activity-center/clubs/ClubsFeed";

export const metadata: Metadata = {
  title: "Clubs — Activity Center — Devora",
  description: "CECS student organizations, meeting times, and updates at UM-Dearborn.",
};

export default function ActivityCenterClubsPage() {
  return <ClubsFeed />;
}

