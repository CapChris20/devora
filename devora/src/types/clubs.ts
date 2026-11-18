// Types for CECS Clubs in the Campus Hub.

import type { Timestamp } from "firebase/firestore";

export type ClubCategory =
  | "Professional"
  | "Academic"
  | "Social"
  | "Competitive";

export type ClubPost = {
  id: string;
  clubId: string;
  authorUid: string;
  authorName: string;
  authorEmail?: string;
  authorPhoto?: string;
  text: string;
  timestamp: Timestamp | Date | string | null;
};

export type Club = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: ClubCategory;
  meetingFrequency: string;
  link?: string;
  followerCount: number;
  memberCount: number;
  latestPost?: {
    text: string;
    authorName: string;
    timestamp: Timestamp | Date | string | null;
  } | null;
  createdAt?: Timestamp | Date | string | null;
};
