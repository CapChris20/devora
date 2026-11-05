// Sample data only. Every name, course group, and event here is fake.
// Replace getActivitySampleData() with Firestore reads later; the views only see these types.

import type { SlotId } from "./config";

export type Accent = "warm" | "cool" | "ember";

export type Person = {
  id: string;
  name: string;
  initials: string;
  major: string;
  year: string;
  accent: Accent;
  sharedClasses: string[];
  hours: SlotId[];
};

export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  proposal?: { slot: SlotId; status: "sent" | "accepted" };
};

export type Conversation = {
  id: string;
  personId: string;
  unread: boolean;
  lastTime: string;
  messages: Message[];
};

export type ConnectionState = "none" | "requested" | "connected";

export type Timed = {
  slots: SlotId[];
  online?: boolean;
  async?: boolean;
};

export type StudyGroup = Timed & {
  id: string;
  course: string;
  title: string;
  format: "live" | "async";
  where: string;
  when: string;
  memberIds: string[];
  capacity: number;
  mine?: boolean;
  about?: string;
};

export type CampusEvent = Timed & {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  where: string;
  posted: string;
  tag: "Talk" | "Career" | "Open lab" | "Tutoring" | "Hackathon";
  about?: string;
};

export type RecentItem = {
  id: string;
  personId: string;
  text: string;
  when: string;
};

export type ActivitySampleData = {
  myHours: SlotId[];
  people: Person[];
  conversations: Conversation[];
  connections: Record<string, ConnectionState>;
  groups: StudyGroup[];
  events: CampusEvent[];
  recent: RecentItem[];
  courses: string[];
};

export const getActivitySampleData = (): ActivitySampleData => ({
  myHours: ["mon-afternoon", "tue-morning", "wed-afternoon", "thu-morning", "fri-afternoon", "sat-evening"],
  people: [
    {
      id: "maya",
      name: "Maya Hassan",
      initials: "MH",
      major: "Computer Engineering",
      year: "Sophomore",
      accent: "cool",
      sharedClasses: ["ECE 273", "MATH 205"],
      hours: ["tue-morning", "wed-afternoon", "thu-morning", "fri-morning"],
    },
    {
      id: "alex",
      name: "Alex Chen",
      initials: "AC",
      major: "Computer & Information Science",
      year: "Junior",
      accent: "warm",
      sharedClasses: ["CIS 350"],
      hours: ["mon-afternoon", "wed-afternoon", "sat-evening"],
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      initials: "JL",
      major: "Software Engineering",
      year: "Senior",
      accent: "ember",
      sharedClasses: ["CIS 350"],
      hours: ["sat-morning", "sun-evening"],
    },
    {
      id: "sam",
      name: "Sam Rivera",
      initials: "SR",
      major: "Mechanical Engineering",
      year: "Junior",
      accent: "warm",
      sharedClasses: ["ME 265"],
      hours: ["mon-afternoon", "thu-morning"],
    },
    {
      id: "priya",
      name: "Priya Patel",
      initials: "PP",
      major: "Data Science",
      year: "Sophomore",
      accent: "cool",
      sharedClasses: ["MATH 205", "CIS 350"],
      hours: ["tue-morning", "tue-afternoon", "fri-afternoon"],
    },
    {
      id: "nadia",
      name: "Nadia Karim",
      initials: "NK",
      major: "Electrical Engineering",
      year: "Freshman",
      accent: "ember",
      sharedClasses: ["ECE 273"],
      hours: ["wed-evening"],
    },
  ],
  conversations: [
    {
      id: "c-maya",
      personId: "maya",
      unread: true,
      lastTime: "2m",
      messages: [
        { id: "m1", from: "them", text: "Did you get the timing diagram for lab 4 to work?", time: "10:02" },
        { id: "m2", from: "me", text: "Mostly. Want to go through it together before Friday?", time: "10:05" },
        { id: "m3", from: "them", text: "Yes. I am on campus Tuesday and Thursday mornings.", time: "10:07" },
      ],
    },
    {
      id: "c-alex",
      personId: "alex",
      unread: true,
      lastTime: "1h",
      messages: [
        { id: "a1", from: "them", text: "Are you going to the ACM talk on Wednesday?", time: "9:14" },
      ],
    },
    {
      id: "c-jordan",
      personId: "jordan",
      unread: false,
      lastTime: "Mon",
      messages: [
        { id: "j1", from: "them", text: "Thanks for the CIS 350 notes from Tuesday.", time: "Mon" },
        { id: "j2", from: "me", text: "Anytime. Want to review graphs before the quiz?", time: "Mon" },
      ],
    },
  ],
  connections: {
    maya: "connected",
    alex: "connected",
    jordan: "connected",
    sam: "none",
    priya: "requested",
    nadia: "none",
  },
  groups: [
    {
      id: "g-ece273",
      about: "Bring your lab 4 draft. The group reads each other's timing diagrams and checks them against the rubric.",
      course: "ECE 273",
      title: "Lab report review",
      format: "live",
      where: "Engineering Lab Building, room 1050",
      when: "Thursday morning",
      slots: ["thu-morning"],
      memberIds: ["maya", "nadia", "sam", "priya"],
      capacity: 5,
    },
    {
      id: "g-math205",
      about: "One thread per problem set. Post where you are stuck and someone walks through it, usually within a day.",
      course: "MATH 205",
      title: "Problem set thread",
      format: "async",
      where: "Shared thread, replies within a day",
      when: "Any time this week",
      slots: [],
      async: true,
      memberIds: ["priya", "maya", "alex"],
      capacity: 8,
    },
    {
      id: "g-cis350",
      about: "Practice problems on graphs and trees before the quiz. Whiteboard in the library study room.",
      course: "CIS 350",
      title: "Graphs and trees practice",
      format: "live",
      where: "Mardigian Library, 2nd floor",
      when: "Wednesday afternoon",
      slots: ["wed-afternoon"],
      memberIds: ["alex", "jordan", "priya"],
      capacity: 5,
    },
    {
      id: "g-cis310",
      about: "Step through the assembly lab together on a shared screen. Cameras optional.",
      course: "CIS 310",
      title: "Assembly walkthrough",
      format: "live",
      where: "Video call",
      when: "Tuesday evening",
      slots: ["tue-evening"],
      online: true,
      memberIds: ["jordan", "alex", "sam", "nadia", "priya"],
      capacity: 6,
    },
    {
      id: "g-me265",
      about: "Free body diagrams and past exam problems. One person so far, so it is a good time to join.",
      course: "ME 265",
      title: "Statics exam prep",
      format: "live",
      where: "Engineering Complex, study lounge",
      when: "Monday evening",
      slots: ["mon-evening"],
      memberIds: ["sam"],
      capacity: 4,
    },
  ],
  events: [
    {
      id: "e-acm",
      about: "A short talk on building with Firebase, then time to ask questions. Lunch is the usual slot for commuters.",
      title: "ACM Firebase Talk",
      host: "ACM",
      date: "Wed, Nov 12",
      time: "12:30 to 1:30",
      where: "ELB 1030",
      posted: "Posted 3 weeks ahead",
      tag: "Talk",
      slots: ["wed-afternoon"],
    },
    {
      id: "e-ieee",
      about: "Bring a printed or digital resume. IEEE members give feedback in 10 minute slots. There is a video call option.",
      title: "IEEE Resume Review",
      host: "IEEE",
      date: "Thu, Nov 13",
      time: "2:00 to 3:30",
      where: "IAVS 1010 or video call",
      posted: "Posted 2 weeks ahead",
      tag: "Career",
      slots: ["thu-afternoon"],
      online: true,
    },
    {
      id: "e-isc",
      about: "Open lab night for the robotics team. Drop in, see the current build, and meet the people working on it.",
      title: "ISC Robotics Open Lab",
      host: "ISC Robotics",
      date: "Fri, Nov 14",
      time: "6:00 to 8:00",
      where: "Engineering Lab Building, high bay",
      posted: "Posted 10 days ahead",
      tag: "Open lab",
      slots: ["fri-evening"],
    },
    {
      id: "e-elc",
      about: "Free review session run by Engineering Learning Center tutors before the next exam.",
      title: "Calculus II exam review",
      host: "Engineering Learning Center",
      date: "Tue, Nov 11",
      time: "9:00 to 10:30",
      where: "ELC, Engineering Complex",
      posted: "Posted 2 weeks ahead",
      tag: "Tutoring",
      slots: ["tue-morning"],
    },
    {
      id: "e-hack",
      about: "Team forming and the theme reveal for this term's CECS hackathon.",
      title: "CECS Hackathon Kickoff",
      host: "CECS student orgs",
      date: "Sat, Nov 15",
      time: "10:00 to 12:00",
      where: "Fieldhouse",
      posted: "Posted 4 weeks ahead",
      tag: "Hackathon",
      slots: ["sat-morning"],
    },
  ],
  recent: [
    { id: "r1", personId: "maya", text: "joined ECE 273 lab report review", when: "20m ago" },
    { id: "r2", personId: "alex", text: "is going to ACM Firebase Talk", when: "2h ago" },
    { id: "r3", personId: "jordan", text: "added Saturday mornings to their hours", when: "Yesterday" },
  ],
  courses: ["CIS 350", "CIS 310", "ECE 273", "MATH 205", "ME 265", "IMSE 317"],
});
