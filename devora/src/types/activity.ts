// Shared shapes for the Campus Hub tabs (/activity/*).
// Each type mirrors the Firestore document it will eventually be read from.
// The tabs use placeholder data with these shapes today, so swapping in real
// Firestore reads later should not change any component props.

// ===== STUDY GROUPS =====

// One study group a student can create or join, tied to a course.
// TODO(firestore): stored at /studyGroups/{groupId}
export type StudyGroup = {
  id: string;
  name: string;
  // vocab: courseCode = the catalog tag shown on the card, e.g. "CIS 310"
  courseCode: string;
  description: string;
  // uids of the students in the group (look up names via /users/{uid})
  memberIds: string[];
  // Manipulate here: raise maxMembers default in the create form if groups run big
  maxMembers: number;
  // Free-text for now ("Tue & Thu 4–5pm, Mardigian Library"). Could become structured later.
  meetingSchedule: string;
  // "in-person" | "online" | "hybrid" — commuter students care a lot about this one
  meetingMode: "in-person" | "online" | "hybrid";
  createdBy: string;
  // ISO date string; becomes a Firestore Timestamp once wired up
  createdAt: string;
};

// ===== MESSAGING =====

// One 1:1 DM thread between two students.
// TODO(firestore): stored at /conversations/{conversationId}
export type Conversation = {
  id: string;
  // Exactly two uids for a 1:1 DM
  participantIds: [string, string];
  // Denormalized so the conversation list can render without extra reads
  otherParticipantName: string;
  otherParticipantMajor: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
};

// One chat bubble inside a conversation.
// TODO(firestore): stored at /conversations/{conversationId}/messages/{messageId}
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
};

// ===== CONNECTIONS =====

// A student the signed-in user is connected with.
// TODO(firestore): stored at /users/{uid}/connections/{otherUid}
export type Connection = {
  // The other student's uid (also the doc id under /users/{uid}/connections)
  uid: string;
  displayName: string;
  major: string;
  // e.g. "Junior" — matches the year values from onboarding
  year: string;
  connectedAt: string;
};

// ===== CLUBS =====

// One CECS-related student org in the static Clubs Directory.
// Static data for now (src/ui/activity-tabs/clubs/clubs-list.ts), no Firestore.
export type Club = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  // Placeholder text until confirmed with the club
  meetingInfo: string;
  // null until a real, verified URL is added — never guess one
  link: string | null;
  // Where to find the club (e.g. "check the student org directory") until a verified contact exists
  contactNote: string;
  // false = meeting info / link still need checking with the club
  verified: boolean;
};
