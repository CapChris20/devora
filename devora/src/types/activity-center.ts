// Shared TypeScript types for Devora Activity Center (/activity-center/*).
// Mirrors the Firestore documents for events, study groups, connections, and messaging.
// Marked with TODO(firestore) comments indicating future Firestore collection mappings.

// ===== SECTION: EVENTS =====

// Tags categorize events into distinct student interest buckets
// vocab: ActivityEventTag = string union for supported event categories
export type ActivityEventTag = "academic" | "social" | "workshop" | "club";

// One campus or student organization event
// TODO(firestore): stored at /events/{eventId}
export type ActivityEvent = {
  id: string;
  week: number;
  mon: string;
  day: string;
  dow: string;
  title: string;
  description: string;
  date?: string;
  time: string;
  location: string;
  organizer: string;
  tags: ActivityEventTag[];
  link?: string;
};

// ===== SECTION: STUDY GROUPS =====

// Commuter-friendly meeting modes for peer study groups
// vocab: MeetingPreference = whether a group meets online, on campus, or hybrid
export type MeetingPreference = "async" | "in-person" | "both";

// One course-centered study group created or joined by students
// TODO(firestore): stored at /studyGroups/{groupId}
export type StudyGroup = {
  id: string;
  course: string;
  topic: string;
  creatorUid?: string;
  members: string[];
  meetingPreference: MeetingPreference;
  coordinationMethod: string;
  description: string;
  createdAt?: string;
};

// ===== SECTION: CONNECTIONS =====

// Connection request state between two students
// TODO(firestore): stored at /users/{uid}/connections/{targetUid}
export type ConnectionStatus = "pending" | "accepted";

// Incoming connection request card in the deck
export type ConnectionRequest = {
  uid: string;
  note: string;
};

// Public mini-profile for display in connections and messaging
// vocab: PersonProfile = summary details stored at /users/{uid}
export type PersonProfile = {
  name: string;
  major: string;
  year: string;
};

// ===== SECTION: MESSAGING =====

// One 1:1 conversation thread
// TODO(firestore): stored at /conversations/{conversationId}
export type Conversation = {
  id: string;
  participants: [string, string];
  lastMessage?: string;
  lastUpdated?: string;
  unreadCount?: number;
};

// One chat bubble within a conversation
// TODO(firestore): stored at /conversations/{conversationId}/messages/{messageId}
export type ChatMessage = {
  id?: string;
  senderId: string;
  text: string;
  timestamp: string;
};

// ===== SECTION: UI NAVIGATION & WEEKS =====

// Primary tabs of the Activity Center
export type ActivityTab = "events" | "study-groups" | "connections" | "messaging";

// Grouping calendar weeks for the event feed
export type CalendarWeekGroup = {
  title: string;
  range: string;
  note?: string;
};
