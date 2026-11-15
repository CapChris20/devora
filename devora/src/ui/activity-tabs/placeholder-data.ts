// Fake study groups so the Study Groups tab has something to lay out before Firestore is wired up.
// Every name here is made up. Delete each block once its tab reads real data.
// Shapes come from src/types/activity.ts, so real data drops in without prop changes.

// ===== IMPORTS =====

import type { StudyGroup } from "@/types/activity";

// ===== NAMED CONSTANTS =====

// Stand-in for auth.currentUser.uid (used for "am I in this group?").
// TODO: replace with the signed-in user's uid from Firebase Auth.
export const PLACEHOLDER_MY_UID = "me";

// Manipulate here: add a course code to show another filter chip on Study Groups
export const PLACEHOLDER_COURSES = ["CIS 310", "MATH 115", "CIS 350", "ECE 270"];

// ===== STUDY GROUPS =====
// TODO(firestore): replace with a read of /studyGroups (filter by courseCode)

export const PLACEHOLDER_STUDY_GROUPS: StudyGroup[] = [
  {
    id: "group-1",
    name: "Algorithms Night Owls",
    courseCode: "CIS 310",
    description: "Working through problem sets together before they're due. Bring questions.",
    memberIds: ["u1", "u2", "u3"],
    maxMembers: 6,
    meetingSchedule: "Tue & Thu · 6–7:30pm",
    meetingMode: "online",
    createdBy: "u1",
    createdAt: "2026-11-01T18:00:00Z",
  },
  {
    id: "group-2",
    name: "Calc Between Classes",
    courseCode: "MATH 115",
    description: "Short sessions for commuters who are on campus Mon/Wed. Practice exams + review.",
    memberIds: ["u4", "u5"],
    maxMembers: 5,
    meetingSchedule: "Mon & Wed · 12–1pm",
    meetingMode: "in-person",
    createdBy: "u4",
    createdAt: "2026-11-03T15:00:00Z",
  },
  {
    id: "group-3",
    name: "Data Structures Lab Crew",
    courseCode: "CIS 350",
    description: "Pair up on lab assignments and compare approaches afterwards.",
    memberIds: ["u2", "u6", "u7", "u8"],
    maxMembers: 8,
    meetingSchedule: "Fri · 2–4pm",
    meetingMode: "hybrid",
    createdBy: "u6",
    createdAt: "2026-11-05T20:00:00Z",
  },
];
