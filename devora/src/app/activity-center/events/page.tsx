// Events tab page for the Campus Hub (/activity-center/events).
// Renders the upcoming campus events feed grouped by calendar weeks.

import type { Metadata } from "next";
import EventFeed from "@/ui/activity-center/events/EventFeed";

export const metadata: Metadata = {
  title: "Events — Campus Hub — Devora",
  description: "Upcoming campus events and reviews at UM-Dearborn.",
};

export default function ActivityCenterEventsPage() {
  return <EventFeed />;
}
