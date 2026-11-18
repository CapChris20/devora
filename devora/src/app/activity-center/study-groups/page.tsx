// Study groups tab page for the Campus Hub (/activity-center/study-groups).
// Renders active course study groups with filter chips and create group dialog.

import type { Metadata } from "next";
import GroupFeed from "@/ui/activity-center/study-groups/GroupFeed";

export const metadata: Metadata = {
  title: "Study Groups — Campus Hub — Devora",
  description: "Course study groups and student study partners at UM-Dearborn.",
};

export default function ActivityCenterStudyGroupsPage() {
  return <GroupFeed />;
}
