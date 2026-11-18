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
  // --- WEEK 0: NOV 16 – NOV 22 (This week) ---
  {
    id: "vlink-1",
    week: 0,
    mon: "NOV",
    day: "16",
    dow: "MON",
    title: "Native American Heritage Month: Painting & Culture Social",
    description:
      "Interactive canvas painting, storytelling, and cultural appreciation hosted by the Office of Student Life. Art supplies and refreshments provided.",
    time: "2:00–4:30 PM",
    location: "University Center Lounge",
    organizer: "Office of Student Life",
    tags: ["social", "hangout"],
  },
  {
    id: "vlink-2",
    week: 0,
    mon: "NOV",
    day: "17",
    dow: "TUE",
    title: "Employer Promo Table: Camp Michigania Tech & Leadership",
    description:
      "Connect directly with Camp Michigania directors recruiting STEM counselors, waterfront staff, and outdoor program coordinators for Summer 2027.",
    time: "11:00 AM–2:00 PM",
    location: "University Center, 1st Floor Hallway",
    organizer: "Career Services",
    tags: ["workshop", "social"],
  },
  {
    id: "vlink-3",
    week: 0,
    mon: "NOV",
    day: "17",
    dow: "TUE",
    title: "DPS Self-Defense: Sitting Safely",
    description:
      "Public safety workshop covering situational awareness while studying in labs, commuter parking lot safety, and practical self-defense techniques.",
    time: "1:00–2:30 PM",
    location: "Campus Safety Building & Zoom",
    organizer: "Department of Public Safety",
    tags: ["workshop"],
  },
  {
    id: "vlink-4",
    week: 0,
    mon: "NOV",
    day: "17",
    dow: "TUE",
    title: "Cookies and Consultations at the Library",
    description:
      "Enjoy warm cookies while consulting one-on-one with subject librarians on final papers, engineering citations, and research databases.",
    time: "3:00–5:00 PM",
    location: "Mardigian Library, 1st Floor Cafe",
    organizer: "Mardigian Library",
    tags: ["academic", "social"],
  },
  {
    id: "vlink-5",
    week: 0,
    mon: "NOV",
    day: "17",
    dow: "TUE",
    title: "It's M.Y. Time! First Gen Forward Presentation & Networking",
    description:
      "Empowering first-generation university students with career trajectory insights, faculty mentorship pairs, and professional networking strategies.",
    time: "4:00–5:30 PM",
    location: "University Center, Kochoff Hall",
    organizer: "TRIO - Student Support Services Program",
    tags: ["academic", "workshop"],
  },
  {
    id: "vlink-6",
    week: 0,
    mon: "NOV",
    day: "17",
    dow: "TUE",
    title: "Faculty & Graduate Library Research Workshop (Advanced Methods)",
    description:
      "In-depth session covering systematic literature reviews, citation management via Zotero/EndNote, and academic repository access.",
    time: "5:00–6:30 PM",
    location: "Mardigian Library, Rm 1205",
    organizer: "Mardigian Library",
    tags: ["academic", "workshop"],
  },
  {
    id: "vlink-7",
    week: 0,
    mon: "NOV",
    day: "17",
    dow: "TUE",
    title: "Managing College & Beyond with Alumnus Adam",
    description:
      "Alumni keynote on navigating work-study balance, overcoming imposter syndrome in engineering/business, and transitioning into industry.",
    time: "6:00–7:30 PM",
    location: "University Center, Rm 2140",
    organizer: "Office of Student Life",
    tags: ["workshop", "social"],
  },
  {
    id: "vlink-8",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "CIS 310 Exam 2 Review Session",
    description:
      "Walk through the practice exam with peer tutors. Covers memory management, assembly, CPU scheduling algorithms, and paging systems.",
    time: "4:00–5:30 PM",
    location: "Engineering Lab Building, Rm 1030",
    organizer: "Engineering Learning Center",
    tags: ["academic"],
  },
  {
    id: "vlink-9",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "The Eco-Preneur Project: Sustainable Solutions Pitch",
    description:
      "Collaborative pitch workshop exploring clean tech ideas, environmental startup models, and ecological research funding on campus.",
    time: "1:00–2:30 PM",
    location: "Environmental Interpretive Center (EIC)",
    organizer: "Environmental Scientists Student Association",
    tags: ["club", "workshop"],
  },
  {
    id: "vlink-10",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "Pathway to CPA with Becker",
    description:
      "Beta Alpha Psi presentation on CPA exam roadmap, credit requirements, Becker test prep materials, and corporate accounting trajectories.",
    time: "5:00–6:30 PM",
    location: "Fairlane Center South, Rm 138",
    organizer: "Beta Alpha Psi",
    tags: ["club", "workshop"],
  },
  {
    id: "vlink-11",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "FAFSA Completion Night & Financial Aid Assistance",
    description:
      "Hands-on walk-through with financial aid counselors to complete your 2027–2028 FAFSA form error-free. Bring your tax documentation.",
    time: "5:30–7:30 PM",
    location: "University Center, Computer Lab",
    organizer: "Select Student Support Services Program",
    tags: ["academic", "workshop"],
  },
  {
    id: "vlink-12",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "Nature Walks for Mental Health",
    description:
      "A gentle guided mid-day decompression walk through the Rouge River trails behind campus. Reset your mind before finals.",
    time: "12:00–1:00 PM",
    location: "EIC Trailhead",
    organizer: "Planet Blue Ambassadors",
    tags: ["social", "hangout"],
  },
  {
    id: "vlink-13",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "God as Trinity: Lecture by Dr. Peter Williamson",
    description:
      "Theological lecture and open community Q&A session exploring historical perspectives, philosophy, and textual scholarship.",
    time: "6:00–7:30 PM",
    location: "University Center, Rm 1225",
    organizer: "Ratio Christi",
    tags: ["club", "social"],
  },
  {
    id: "vlink-14",
    week: 0,
    mon: "NOV",
    day: "18",
    dow: "WED",
    title: "SOAC General Body Meeting & Student Org Allocations",
    description:
      "Bi-weekly allocation review meeting for registered student org funding, conference grant proposals, and club budget approvals.",
    time: "3:30–5:00 PM",
    location: "University Center, Kochoff Hall",
    organizer: "Student Organization Allocation Council",
    tags: ["club", "academic"],
  },
  {
    id: "vlink-15",
    week: 0,
    mon: "NOV",
    day: "19",
    dow: "THU",
    title: "Intro to Firebase & Cloud Architecture",
    description:
      "Hands-on workshop building serverless web apps with Firebase Auth, Firestore security rules, and real-time listeners. Open to all CECS skill levels.",
    time: "6:00–7:30 PM",
    location: "Engineering Lab Building, Rm 1045",
    organizer: "ACM Student Chapter",
    tags: ["workshop", "club"],
  },
  {
    id: "vlink-16",
    week: 0,
    mon: "NOV",
    day: "19",
    dow: "THU",
    title: "Sip & Share: Peer-to-Peer Tech Interviewing",
    description:
      "Practice behavioral questions and whiteboarding logic over coffee with senior students who landed internships at FAANG, auto OEMs, and tech co-ops.",
    time: "3:00–4:30 PM",
    location: "University Center, Career Services Hub",
    organizer: "Career Services",
    tags: ["workshop", "academic"],
  },
  {
    id: "vlink-17",
    week: 0,
    mon: "NOV",
    day: "19",
    dow: "THU",
    title: "AWU x KNOW Fall Event: Cultural Identity & Sisterhood",
    description:
      "Community gathering celebrating African women and allies with traditional food, cultural exchange, and interactive discussion circles.",
    time: "5:00–7:00 PM",
    location: "University Center, Inclusion Hub",
    organizer: "Keys to Navigating Our World",
    tags: ["club", "social"],
  },
  {
    id: "vlink-18",
    week: 0,
    mon: "NOV",
    day: "19",
    dow: "THU",
    title: "Thanksgiving with La Mezcla",
    description:
      "Potluck celebration honoring Latinx heritage, gratitude, and community bonding before fall recess. All campus students welcome.",
    time: "6:00–8:30 PM",
    location: "University Center, Kochoff Hall B",
    organizer: "La Mezcla",
    tags: ["club", "social", "hangout"],
  },
  {
    id: "vlink-19",
    week: 0,
    mon: "NOV",
    day: "19",
    dow: "THU",
    title: "Student Government General Body Meeting",
    description:
      "Weekly senate assembly discussing campus food pantry expansion, parking updates, CECS lab hours, and open student concerns.",
    time: "7:00–8:30 PM",
    location: "University Center, SG Chambers",
    organizer: "Student Government",
    tags: ["club", "social"],
  },
  {
    id: "vlink-20",
    week: 0,
    mon: "NOV",
    day: "20",
    dow: "FRI",
    title: "Autonomous Drone Club: Flight & Sensor Testing",
    description:
      "Testing small low-cost self-flying drones and computer vision sensor calibration in the ELB Atrium with live telemetry display.",
    time: "3:30–5:00 PM",
    location: "ELB Atrium",
    organizer: "Autonomous Drone Club",
    tags: ["workshop", "club"],
  },
  {
    id: "vlink-21",
    week: 0,
    mon: "NOV",
    day: "20",
    dow: "FRI",
    title: "Faculty & Grad Library Research Workshop: Thesis Formatting",
    description:
      "Guidance on Rackham formatting standards, copyright clearances for dissertations, and Deep Blue academic repository deposit.",
    time: "1:00–2:30 PM",
    location: "Mardigian Library, Rm 1205 & Zoom",
    organizer: "Mardigian Library",
    tags: ["academic", "workshop"],
  },

  // --- WEEK 1: NOV 23 – NOV 29 (Next week / Thanksgiving) ---
  {
    id: "vlink-22",
    week: 1,
    mon: "NOV",
    day: "24",
    dow: "TUE",
    title: "Formula Electric Shop Night: Powertrain & Battery",
    description:
      "Hands-on chassis fabrication, harness routing, and battery telemetry check for our Formula-style electric race car.",
    time: "6:00–8:00 PM",
    location: "ELB Automotive Lab",
    organizer: "Dearborn Electric Racing",
    tags: ["workshop", "club"],
  },
  {
    id: "vlink-23",
    week: 1,
    mon: "NOV",
    day: "25",
    dow: "WED",
    title: "SOAC Executive Funding Review",
    description:
      "Emergency and rapid-review session for registered organizations preparing end-of-term banquets and winter conferences.",
    time: "1:00–2:00 PM",
    location: "University Center / Zoom",
    organizer: "Student Organization Allocation Council",
    tags: ["club", "academic"],
  },
  {
    id: "vlink-24",
    week: 1,
    mon: "NOV",
    day: "26",
    dow: "THU",
    title: "Student Government Holiday Recess Open Forum",
    description:
      "Virtual check-in and games session for commuters and international students staying on or near campus during Thanksgiving break.",
    time: "12:00–1:00 PM",
    location: "Zoom / Virtual",
    organizer: "Student Government",
    tags: ["club", "social"],
  },

  // --- WEEK 2: NOV 30 – DEC 6 (Finals push) ---
  {
    id: "vlink-25",
    week: 2,
    mon: "NOV",
    day: "30",
    dow: "MON",
    title: "Leadership Workshops: Inclusive Project Management",
    description:
      "Interactive workshop on agile leadership, running effective team retrospectives, and cross-functional conflict resolution in student projects.",
    time: "11:00 AM–12:30 PM",
    location: "University Center, Rm 2140",
    organizer: "Office of Student Life",
    tags: ["workshop", "academic"],
  },
  {
    id: "vlink-26",
    week: 2,
    mon: "NOV",
    day: "30",
    dow: "MON",
    title: "Mardigian Mondays: Puzzles, Games & Study Breaks",
    description:
      "Relaxing jigsaw puzzles, chess sets, tabletop games, and free tea on the 1st floor of Mardigian Library.",
    time: "1:00–4:00 PM",
    location: "Mardigian Library, 1st Floor",
    organizer: "Mardigian Library",
    tags: ["social", "hangout"],
  },
  {
    id: "vlink-27",
    week: 2,
    mon: "NOV",
    day: "30",
    dow: "MON",
    title: "Women in Mathematics & Computing Celebration 2026",
    description:
      "Celebrating women in STEM with guest faculty panels, networking snacks, and student research spotlight talks in the atrium.",
    time: "2:00–4:00 PM",
    location: "ELB Atrium",
    organizer: "Mathematics & Statistics",
    tags: ["academic", "social", "club"],
  },
  {
    id: "vlink-28",
    week: 2,
    mon: "NOV",
    day: "30",
    dow: "MON",
    title: "Buy Now, Pay Later? Financial Literacy & Credit Safety",
    description:
      "Critical analysis of BNPL apps, credit card interest traps, and practical strategies for building a 750+ credit score as an undergraduate.",
    time: "3:30–5:00 PM",
    location: "University Center, Rm 1225",
    organizer: "Select Student Support Services Program",
    tags: ["academic", "workshop"],
  },
  {
    id: "vlink-29",
    week: 2,
    mon: "NOV",
    day: "30",
    dow: "MON",
    title: "Casual Gaming Club Weekly Meeting",
    description:
      "Weekly community gaming session: Smash Bros, Mario Kart, fighting games, and board games. Great commuter de-stress.",
    time: "5:00–7:00 PM",
    location: "University Center Lounge",
    organizer: "Casual Gaming Club",
    tags: ["club", "social", "hangout"],
  },
  {
    id: "vlink-30",
    week: 2,
    mon: "DEC",
    day: "1",
    dow: "TUE",
    title: "Cookies and Consultations: Finals Edition",
    description:
      "Snack on fresh cookies and get targeted assistance with research references, bibliography checks, and last-minute study aids.",
    time: "2:00–4:00 PM",
    location: "Mardigian Library Cafe",
    organizer: "Mardigian Library",
    tags: ["academic", "social"],
  },
  {
    id: "vlink-31",
    week: 2,
    mon: "DEC",
    day: "1",
    dow: "TUE",
    title: "Career Services Drop-In Hours: Resume & Portfolio Polishing",
    description:
      "Walk in for 15-minute 1-on-1 resume reviews and GitHub/LinkedIn profile critiques ahead of Winter semester internship applications.",
    time: "1:00–3:30 PM",
    location: "University Center, Rm 2140",
    organizer: "Career Services",
    tags: ["workshop", "academic"],
  },
  {
    id: "vlink-32",
    week: 2,
    mon: "DEC",
    day: "2",
    dow: "WED",
    title: "Pride! Official Social Hours: Hot Cocoa & De-stress",
    description:
      "Safe, welcoming social gathering for LGBTQ+ students and allies featuring a hot chocolate bar, craft supplies, and low-stress games.",
    time: "3:00–5:00 PM",
    location: "University Center, Inclusion Hub",
    organizer: "Pride!",
    tags: ["club", "social", "hangout"],
  },
  {
    id: "vlink-33",
    week: 2,
    mon: "DEC",
    day: "2",
    dow: "WED",
    title: "Nature Walks for Mental Health: Fall Foliage Wrap-Up",
    description:
      "End-of-term nature walk through the Environmental Interpretive Center trails. Hot apple cider served at the trailhead.",
    time: "12:00–1:00 PM",
    location: "EIC Grounds",
    organizer: "Planet Blue Ambassadors",
    tags: ["social", "hangout"],
  },
  {
    id: "vlink-34",
    week: 2,
    mon: "DEC",
    day: "2",
    dow: "WED",
    title: "The Incarnation: Lecture & Discussion with Dr. Caleb Little",
    description:
      "Interdisciplinary academic talk on theological philosophy, historical documents, and open philosophical discourse.",
    time: "5:30–7:00 PM",
    location: "University Center, Rm 1225",
    organizer: "Ratio Christi",
    tags: ["club", "academic"],
  },
  {
    id: "vlink-35",
    week: 2,
    mon: "DEC",
    day: "3",
    dow: "THU",
    title: "Be Kind to Your Mind: Resilience, Self-Care & Finals Prep",
    description:
      "Guided stress-reduction techniques, cognitive wellness habits, and free care packages for students facing finals week.",
    time: "1:00–2:30 PM",
    location: "University Center, Kochoff Hall",
    organizer: "TRIO - Student Support Services Program",
    tags: ["academic", "workshop"],
  },
  {
    id: "vlink-36",
    week: 2,
    mon: "DEC",
    day: "3",
    dow: "THU",
    title: "Anthropology Field School Showcase",
    description:
      "Undergraduate researchers showcase archaeological finds, cultural fieldwork artifacts, and digital archiving projects.",
    time: "2:30–4:30 PM",
    location: "CASL Social Sciences Bldg, Rm 108",
    organizer: "Association of Student Anthropologists",
    tags: ["club", "academic", "workshop"],
  },
  {
    id: "vlink-37",
    week: 2,
    mon: "DEC",
    day: "3",
    dow: "THU",
    title: "AI, Animism, and Anthropology: Tech & Culture Talk",
    description:
      "Symposium exploring how artificial intelligence is reshaping indigenous cultural preservation, digital folklore, and ethnographic ethics.",
    time: "4:30–6:00 PM",
    location: "CASL Social Sciences Bldg, Rm 112",
    organizer: "Association of Student Anthropologists",
    tags: ["club", "academic", "workshop"],
  },
  {
    id: "vlink-38",
    week: 2,
    mon: "DEC",
    day: "3",
    dow: "THU",
    title: "End of Semester Celebration & Student Awards",
    description:
      "Celebrating student perseverance and academic accomplishments with dinner, awards, and music before finals kick off.",
    time: "6:00–8:00 PM",
    location: "University Center, Kochoff Hall A",
    organizer: "Select Student Support Services Program",
    tags: ["social", "hangout"],
  },
  {
    id: "vlink-39",
    week: 2,
    mon: "DEC",
    day: "3",
    dow: "THU",
    title: "Student Government General Body Meeting: Final Session",
    description:
      "Last Senate session of the Fall semester with committee reports, club approvals, and student body updates.",
    time: "7:00–8:30 PM",
    location: "University Center, SG Chambers",
    organizer: "Student Government",
    tags: ["club", "social"],
  },

  // --- WEEK 3: DEC 7 – DEC 17 (Finals & Wrap-up) ---
  {
    id: "vlink-40",
    week: 3,
    mon: "DEC",
    day: "7",
    dow: "MON",
    title: "The Dual Job Search: On-Campus vs Off-Campus Tech & Co-ops",
    description:
      "Career Services workshop breaking down how to land winter and summer tech internships, handshake co-ops, and research gigs.",
    time: "4:00–5:00 PM",
    location: "Mardigian Library & Zoom",
    organizer: "Career Services",
    tags: ["workshop", "academic"],
  },
  {
    id: "vlink-41",
    week: 3,
    mon: "DEC",
    day: "7",
    dow: "MON",
    title: "Mardigian Mondays: Silent Book Club & Cozy Reading",
    description:
      "Dedicated quiet hour with cozy ambient lighting, complimentary herbal tea, and no assigned reading—just bring whatever you need to focus on.",
    time: "2:00–4:00 PM",
    location: "Mardigian Library, 2nd Floor Quiet Stacks",
    organizer: "Mardigian Library",
    tags: ["academic", "hangout"],
  },
  {
    id: "vlink-42",
    week: 3,
    mon: "DEC",
    day: "7",
    dow: "MON",
    title: "Casual Gaming Club: Pre-Finals Smash & Mario Kart Night",
    description:
      "Blow off steam before finals start. Bracket tournament with snacks, friendly matches, and portable gaming setups.",
    time: "5:00–7:30 PM",
    location: "University Center Lounge",
    organizer: "Casual Gaming Club",
    tags: ["club", "social", "hangout"],
  },
  {
    id: "vlink-43",
    week: 3,
    mon: "DEC",
    day: "8",
    dow: "TUE",
    title: "Grab and Go Finals Study Kits: Day 1",
    description:
      "Free coffee, highlighters, earplugs, granola bars, and reserved quiet study tables across the 2nd and 3rd floors of Mardigian.",
    time: "10:00 AM–4:00 PM",
    location: "Mardigian Library, Lobby",
    organizer: "Mardigian Library",
    tags: ["academic", "hangout"],
  },
  {
    id: "vlink-44",
    week: 3,
    mon: "DEC",
    day: "8",
    dow: "TUE",
    title: "Career Services Drop-In: Winter Co-op & Internship Check",
    description:
      "Last-minute check on co-op paperwork, CPT/OPT requirements, and employer offer deadline navigation.",
    time: "1:00–3:00 PM",
    location: "University Center, Rm 2140",
    organizer: "Career Services",
    tags: ["workshop", "academic"],
  },
  {
    id: "vlink-45",
    week: 3,
    mon: "DEC",
    day: "9",
    dow: "WED",
    title: "Grab and Go Finals Study Kits: Day 2",
    description:
      "Restocked finals care kits, complimentary energy snacks, stress balls, and quiet study room access.",
    time: "10:00 AM–4:00 PM",
    location: "Mardigian Library, Lobby",
    organizer: "Mardigian Library",
    tags: ["academic", "hangout"],
  },
  {
    id: "vlink-46",
    week: 3,
    mon: "DEC",
    day: "9",
    dow: "WED",
    title: "Pride! Finals Social & Cocoa Station",
    description:
      "Drop by for free hot cocoa, soothing lo-fi tunes, and a quiet, inclusive space to study or relax between exams.",
    time: "2:00–4:30 PM",
    location: "University Center, Inclusion Hub",
    organizer: "Pride!",
    tags: ["club", "social", "hangout"],
  },
  {
    id: "vlink-47",
    week: 3,
    mon: "DEC",
    day: "9",
    dow: "WED",
    title: "SOAC End-of-Year Allocation Finalization",
    description:
      "Final SOAC council gathering to reconcile budget balances and transition funding accounts for Winter 2027.",
    time: "3:30–5:00 PM",
    location: "University Center, Kochoff Hall",
    organizer: "Student Organization Allocation Council",
    tags: ["club", "academic"],
  },
  {
    id: "vlink-48",
    week: 3,
    mon: "DEC",
    day: "10",
    dow: "THU",
    title: "Career Services Drop-In Hours: Final Resume Reviews",
    description:
      "One-on-one drop-in resume critiques and interview preparation for upcoming winter career fairs.",
    time: "11:00 AM–1:00 PM",
    location: "University Center, Rm 2140",
    organizer: "Career Services",
    tags: ["workshop"],
  },
  {
    id: "vlink-49",
    week: 3,
    mon: "DEC",
    day: "10",
    dow: "THU",
    title: "Student Government Executive Transition Meeting",
    description:
      "Wrap-up assembly evaluating campus initiatives passed during Fall and outlining winter legislative priorities.",
    time: "7:00–8:30 PM",
    location: "University Center, SG Chambers",
    organizer: "Student Government",
    tags: ["club", "academic"],
  },
  {
    id: "vlink-50",
    week: 3,
    mon: "DEC",
    day: "16",
    dow: "WED",
    title: "Post-Finals Decompression Social",
    description:
      "Celebrate completing the Fall semester! Free pizza, music, board games, and good vibes before heading off for winter break.",
    time: "3:00–5:30 PM",
    location: "University Center Lounge",
    organizer: "Pride! & Student Life",
    tags: ["club", "social", "hangout"],
  },
  {
    id: "vlink-51",
    week: 3,
    mon: "DEC",
    day: "17",
    dow: "THU",
    title: "Winter Commencement Rehearsal & Farewell Social",
    description:
      "Congratulating graduating seniors with celebratory snacks, cap decorating stations, and photo opportunities.",
    time: "1:00–3:00 PM",
    location: "Fieldhouse / Wellness Center",
    organizer: "Office of Student Life",
    tags: ["social", "hangout"],
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
  { title: "Finals & Wrap-up", range: "Dec 7–17" },
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
