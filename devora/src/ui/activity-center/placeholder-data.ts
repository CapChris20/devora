// Placeholder data for Devora Activity Center.
// Typed sample rows matching the reference prototype and future Firestore collections.
// Provides realistic initial states for events, study groups, connection requests, and messages.

import type {
  ActivityEvent,
  ActivityEventTag,
  CalendarWeekGroup,
  ChatMessage,
  ConnectionRequest,
  MeetingPreference,
  PersonProfile,
  StudyGroup,
} from "@/types/activity-center";

// ===== SECTION: PEOPLE =====

// Sample CECS classmates
// TODO(firestore): populated from /users/{uid}
export const INITIAL_PEOPLE: Record<string, PersonProfile> = {
  jordan: { name: "Jordan Lee", major: "Computer Science", year: "Junior" },
  sam: { name: "Sam Rivera", major: "Software Engineering", year: "Sophomore" },
  priya: { name: "Priya Shah", major: "Computer Engineering", year: "Senior" },
  alex: { name: "Alex Kim", major: "Cybersecurity", year: "Freshman" },
  maya: { name: "Maya Hassan", major: "Data Science", year: "Junior" },
  omar: { name: "Omar Farouk", major: "Electrical Engineering", year: "Senior" },
  lena: { name: "Lena Park", major: "Computer Science", year: "Sophomore" },
};

export const PEOPLE_ORDER: string[] = [
  "jordan",
  "sam",
  "priya",
  "alex",
  "maya",
  "omar",
  "lena",
];

// ===== SECTION: EVENTS =====

// Campus events through finals
// TODO(firestore): collection /events
export const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: "e1",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "CIS 310 Exam 2 Review Session",
    description:
      "Walk through the practice exam with a tutor. Recording posted after for anyone who can't stay.",
    time: "4:00–5:30 PM",
    location: "Engineering Lab Building, Rm 1030",
    organizer: "CECS Learning Center",
    tags: ["academic"],
  },
  {
    id: "e2",
    week: 0,
    mon: "NOV",
    day: "19",
    dow: "THU",
    title: "Intro to Firebase Workshop",
    description:
      "Build a tiny app with Firebase Auth and Firestore. Bring a laptop; no experience needed.",
    time: "6:00–7:30 PM",
    location: "Engineering Lab Building",
    organizer: "ACM Student Chapter",
    tags: ["workshop", "club"],
  },
  {
    id: "e3",
    week: 0,
    mon: "NOV",
    day: "20",
    dow: "FRI",
    title: "Commuter Coffee Hour",
    description:
      "Free coffee before morning classes. Meet other commuters from your major.",
    time: "8:30–9:30 AM",
    location: "University Center",
    organizer: "CECS Student Council",
    tags: ["social"],
  },
  {
    id: "e4",
    week: 1,
    mon: "NOV",
    day: "24",
    dow: "TUE",
    title: "Resume & LinkedIn Night",
    description:
      "Get your resume reviewed before winter internship deadlines.",
    time: "5:30–7:00 PM",
    location: "Online (Zoom)",
    organizer: "Society of Women Engineers",
    tags: ["workshop"],
  },
  {
    id: "e5",
    week: 2,
    mon: "DEC",
    day: "2",
    dow: "WED",
    title: "Game Night: Smash & Snacks",
    description:
      "End-of-semester break. Bring a friend or come meet some new ones.",
    time: "7:00–9:00 PM",
    location: "University Center",
    organizer: "GDSC",
    tags: ["social", "club"],
  },
  {
    id: "e6",
    week: 2,
    mon: "DEC",
    day: "4",
    dow: "FRI",
    title: "Finals Study Jam",
    description:
      "Quiet floor reserved for CECS students, with tutors walking around.",
    time: "1:00–6:00 PM",
    location: "Mardigian Library, 3rd floor",
    organizer: "CECS Learning Center",
    tags: ["academic"],
  },
];

export const CALENDAR_WEEKS: CalendarWeekGroup[] = [
  { title: "This week", range: "Nov 16–22" },
  {
    title: "Next week",
    range: "Nov 23–29",
    note: "Thanksgiving Day is Thu, Nov 26. Fewer events this week.",
  },
  { title: "Finals push", range: "Nov 30–Dec 6" },
];

export const TAG_TONE: Record<ActivityEventTag, "bg-nb-brand" | "bg-nb-orchid" | "bg-nb-sky" | "bg-nb-blush"> = {
  academic: "bg-nb-sky",
  social: "bg-nb-blush",
  workshop: "bg-nb-orchid",
  club: "bg-nb-brand",
  hangout: "bg-nb-brand",
};

// ===== SECTION: STUDY GROUPS =====

export const AVAILABLE_COURSES: string[] = [
  "CIS 310",
  "MATH 115",
  "CIS 350",
  "ECE 270",
  "CIS 450",
];

export const MEETING_PREFERENCE_LABELS: Record<MeetingPreference, string> = {
  async: "Async",
  "in-person": "In person",
  both: "Async + in person",
};

// Course accent colors for tags
export const COURSE_TONES: Array<"bg-nb-brand" | "bg-nb-orchid" | "bg-nb-sky" | "bg-nb-blush"> = [
  "bg-nb-brand",
  "bg-nb-orchid",
  "bg-nb-sky",
  "bg-nb-blush",
];

// Initial study groups
// TODO(firestore): collection /studyGroups
export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: "g1",
    course: "CIS 310",
    topic: "Exam 2 prep: assembly and memory",
    description:
      "Working through old exams and the practice set before Exam 2. Bring the parts you're stuck on.",
    members: ["jordan", "sam", "lena", "omar"],
    meetingPreference: "both",
    coordinationMethod: "Discord server, #cis310-study",
  },
  {
    id: "g3",
    course: "CIS 350",
    topic: "Data structures lab buddies",
    description:
      "Pair up on lab assignments Tuesday afternoons, then compare approaches.",
    members: ["priya", "jordan", "alex"],
    meetingPreference: "in-person",
    coordinationMethod: "Tue 2 PM, engineering study lounge",
  },
  {
    id: "g2",
    course: "MATH 115",
    topic: "Weekly problem sets",
    description:
      "Post your work by Thursday night, compare answers by Friday. Fully async.",
    members: ["alex", "maya", "priya"],
    meetingPreference: "async",
    coordinationMethod: "GroupMe chat",
  },
  {
    id: "g4",
    course: "ECE 270",
    topic: "Circuits homework check",
    description:
      "Quick answer checks and help on the tricky problems each week.",
    members: ["omar", "maya"],
    meetingPreference: "async",
    coordinationMethod: "Discord group DM",
  },
  {
    id: "g5",
    course: "CIS 450",
    topic: "OS project teammates",
    description:
      "Looking for 1 to 2 more people for the threading project.",
    members: ["sam", "jordan", "priya"],
    meetingPreference: "both",
    coordinationMethod: "Slack workspace",
  },
];

// ===== SECTION: CONNECTIONS =====

// Initial connection requests waiting for approval
// TODO(firestore): documents from /users/{uid}/connections where status == 'pending'
export const INITIAL_REQUESTS: ConnectionRequest[] = [
  {
    uid: "maya",
    note: 'Also in MATH 115. "I study async most nights, want to swap problem sets?"',
  },
  {
    uid: "omar",
    note: 'Also in ECE 270. "Commuting from Canton, looking for a homework buddy."',
  },
];

// Initial accepted connections
// TODO(firestore): documents from /users/{uid}/connections where status == 'accepted'
export const INITIAL_CONNECTIONS: string[] = [
  "jordan",
  "sam",
  "priya",
  "alex",
];

// ===== SECTION: MESSAGING =====

export const INITIAL_CONVERSATION_ORDER: string[] = ["jordan", "sam", "priya"];

export const INITIAL_UNREAD_COUNTS: Record<string, number> = {
  jordan: 2,
};

// Initial messages by conversation partner uid
// TODO(firestore): collections /conversations/{id}/messages
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  jordan: [
    { from: "jordan", text: "Hey! Saw you're in CIS 310 too.", time: "2:02 PM" },
    { from: "me", text: "Yeah, Tue/Thu section. Exam 2 is rough.", time: "2:09 PM" },
    { from: "jordan", text: "Want to join the CIS 310 group? We meet on Discord.", time: "2:14 PM" },
  ].map((m, idx) => ({ id: `j${idx}`, senderId: m.from, text: m.text, timestamp: m.time })),
  sam: [
    { from: "me", text: "Still on for the lounge Wednesday?", time: "Yesterday" },
    { from: "sam", text: "See you Wednesday at noon", time: "Yesterday" },
  ].map((m, idx) => ({ id: `s${idx}`, senderId: m.from, text: m.text, timestamp: m.time })),
  priya: [
    { from: "me", text: "Here are my lab notes from Tuesday.", time: "Nov 12" },
    { from: "priya", text: "Thanks for the lab notes!", time: "Nov 12" },
  ].map((m, idx) => ({ id: `p${idx}`, senderId: m.from, text: m.text, timestamp: m.time })),
};

// Automated canned responses to simulate chat interactivity
export const SAMPLE_REPLIES: Record<string, string[]> = {
  jordan: [
    "Nice, I'll add you to the Discord tonight.",
    "We usually start around 6.",
  ],
  sam: [
    "Bet. I'll grab a table by the window.",
    "Bring the lab handout if you have it.",
  ],
  priya: [
    "Anytime! Good luck on the lab.",
    "Want to compare answers Friday?",
  ],
  alex: [
    "Hey! Yeah, I'm in MATH 115 too.",
    "Want to join the problem set group?",
  ],
  maya: [
    "Hi! Thanks for accepting.",
    "Are you in the async MATH 115 group?",
  ],
  omar: [
    "Hey, thanks for connecting!",
    "Do you take the 94 in too?",
  ],
  lena: [
    "Hey!",
    "See you in CIS 310.",
  ],
};
