// Campus Hub page: weekly hours, connect/messages, study groups, campus events.
// Flow: route mounts (/messages-page) → ActivityCenterContent.

"use client";

// ===== IMPORTS =====

import ActivityCenterContent from "@/ui/activity/ActivityCenterContent";

// ===== MAIN COMPONENT =====

/**
 * The Campus Hub page. Weekly hours, messages, study groups, campus events.
 */
export default function MessagesPage() {
  return <ActivityCenterContent />;
}
