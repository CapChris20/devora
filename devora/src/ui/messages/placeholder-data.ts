// Fake conversations + messages so the Messages page has something to lay out before Firestore.
// Every name here is made up. Delete once Messages reads /conversations.

// ===== IMPORTS =====

import type { Conversation, Message } from "@/types/activity";

// ===== NAMED CONSTANTS =====

// Stand-in for auth.currentUser.uid so chat bubbles know which side is "me".
// TODO: replace with the signed-in user's uid from Firebase Auth.
export const PLACEHOLDER_MY_UID = "me";

// ===== MESSAGING =====
// TODO(firestore): replace with a read of /conversations where participantIds contains my uid

export const PLACEHOLDER_CONVERSATIONS: Conversation[] = [
  {
    id: "convo-1",
    participantIds: [PLACEHOLDER_MY_UID, "u1"],
    otherParticipantName: "Jordan Lee",
    otherParticipantMajor: "Computer Science",
    lastMessagePreview: "Want to join the CIS 310 group?",
    lastMessageAt: "2026-11-14T21:10:00Z",
    unreadCount: 2,
  },
  {
    id: "convo-2",
    participantIds: [PLACEHOLDER_MY_UID, "u4"],
    otherParticipantName: "Sam Rivera",
    otherParticipantMajor: "Software Engineering",
    lastMessagePreview: "See you Wednesday at noon",
    lastMessageAt: "2026-11-13T16:45:00Z",
    unreadCount: 0,
  },
  {
    id: "convo-3",
    participantIds: [PLACEHOLDER_MY_UID, "u6"],
    otherParticipantName: "Priya Shah",
    otherParticipantMajor: "Computer Engineering",
    lastMessagePreview: "Thanks for the lab notes!",
    lastMessageAt: "2026-11-12T19:30:00Z",
    unreadCount: 0,
  },
];

// TODO(firestore): replace with a read of /conversations/{conversationId}/messages ordered by sentAt
export const PLACEHOLDER_MESSAGES: Message[] = [
  { id: "m1", conversationId: "convo-1", senderId: "u1", text: "Hey! Saw you're in CIS 310 too.", sentAt: "2026-11-14T21:00:00Z" },
  { id: "m2", conversationId: "convo-1", senderId: PLACEHOLDER_MY_UID, text: "Yeah, Tue/Thu section.", sentAt: "2026-11-14T21:05:00Z" },
  { id: "m3", conversationId: "convo-1", senderId: "u1", text: "Want to join the CIS 310 group?", sentAt: "2026-11-14T21:10:00Z" },
  { id: "m4", conversationId: "convo-2", senderId: "u4", text: "See you Wednesday at noon", sentAt: "2026-11-13T16:45:00Z" },
  { id: "m5", conversationId: "convo-3", senderId: PLACEHOLDER_MY_UID, text: "Here are my lab notes.", sentAt: "2026-11-12T19:00:00Z" },
  { id: "m6", conversationId: "convo-3", senderId: "u6", text: "Thanks for the lab notes!", sentAt: "2026-11-12T19:30:00Z" },
];

