// Fake connections so the Connections page has something to lay out before Firestore.
// Every name here is made up. Delete once Connections reads /users/{uid}/connections.

// ===== IMPORTS =====

import type { Connection } from "@/types/activity";

// ===== CONNECTIONS =====
// TODO(firestore): replace with a read of /users/{myUid}/connections

export const PLACEHOLDER_CONNECTIONS: Connection[] = [
  { uid: "u1", displayName: "Jordan Lee", major: "Computer Science", year: "Junior", connectedAt: "2026-10-20T00:00:00Z" },
  { uid: "u4", displayName: "Sam Rivera", major: "Software Engineering", year: "Sophomore", connectedAt: "2026-10-28T00:00:00Z" },
  { uid: "u6", displayName: "Priya Shah", major: "Computer Engineering", year: "Senior", connectedAt: "2026-11-02T00:00:00Z" },
  { uid: "u7", displayName: "Alex Kim", major: "Cybersecurity", year: "Freshman", connectedAt: "2026-11-09T00:00:00Z" },
];
