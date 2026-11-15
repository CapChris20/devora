// Static list for the Clubs Directory tab. No Firestore — edit this file to change the directory.
// IMPORTANT: meeting info and links are PLACEHOLDERS. Confirm each one with the club
// (or the UM-Dearborn student org directory) before flipping `verified` to true.
// Never fill `link` with a guessed URL or email.

// ===== IMPORTS =====

import type { Club } from "@/types/activity";

// ===== NAMED CONSTANTS =====

const MEETING_TBD = "TBD (verify time and place with the club)";
const CONTACT_TBD = "TBD (check the UM-Dearborn student org directory)";

// ===== MAIN DATA =====

// Manipulate here: reorder to change the directory order; add an object to add a club
export const CLUBS: Club[] = [
  {
    id: "acm",
    name: "Association for Computing Machinery",
    shortName: "ACM",
    description: "Student chapter of the ACM, the computing professional society. Tech talks, projects and career prep for anyone interested in computing.",
    meetingInfo: MEETING_TBD,
    link: null,
    contactNote: CONTACT_TBD,
    verified: false,
  },
  {
    id: "gdsc",
    name: "Google Developer Student Club",
    shortName: "GDSC",
    // Google renamed the program "Google Developer Groups on Campus" — confirm the chapter's current name.
    description: "Google-supported student developer community (program now called Google Developer Groups on Campus). Workshops and build projects with Google tech.",
    meetingInfo: MEETING_TBD,
    link: null,
    contactNote: CONTACT_TBD,
    verified: false,
  },
  {
    id: "swe",
    name: "Society of Women Engineers",
    shortName: "SWE",
    description: "Section of the national Society of Women Engineers. Professional development, outreach and community for engineering and CS students.",
    meetingInfo: MEETING_TBD,
    link: null,
    contactNote: CONTACT_TBD,
    verified: false,
  },
  {
    id: "girls-who-code",
    name: "Girls Who Code",
    shortName: "GWC",
    description: "College Loop of Girls Who Code, focused on closing the gender gap in tech through community, coding practice and mentorship.",
    meetingInfo: MEETING_TBD,
    link: null,
    contactNote: CONTACT_TBD,
    verified: false,
  },
  {
    id: "wicys",
    name: "Women in CyberSecurity",
    shortName: "WiCyS",
    description: "Student chapter of WiCyS. Cybersecurity skill-building, CTF practice and networking for students interested in security.",
    meetingInfo: MEETING_TBD,
    link: null,
    contactNote: CONTACT_TBD,
    verified: false,
  },
  {
    id: "hack-dearborn",
    name: "Hack Dearborn",
    shortName: "HD",
    description: "UM-Dearborn's student-run hackathon. Join the organizing team or sign up to hack.",
    meetingInfo: "Event and organizer dates: TBD (verify with organizers)",
    link: null,
    contactNote: CONTACT_TBD,
    verified: false,
  },
];
