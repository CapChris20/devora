// Static lists and helpers for onboarding dropdowns and pill buttons.
// Defines majors, career niches, interest groups, and step titles.
// Imported by OnboardingForm + AccountProfileEditor (same pills everywhere).

// How many wizard steps the onboarding form has.
// Manipulate here: if you add a step, also update STEP_TITLES, OnboardingForm canContinue + JSX
export const ONBOARDING_STEPS = 5;

// Class-year pills for step 1.
// vocab/symbol: as const = lock this array to these exact string literals (TypeScript)
export const CLASS_RANKS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
] as const;

// Gender pills for step 1.
export const GENDERS = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer not to say",
  "Prefer to self-describe",
] as const;

// Age pills for step 1.
export const AGES = ["17", "18", "19", "20", "21", "22", "23", "24", "25+"] as const;

// CECS majors shown in the step 2 dropdown.
export const MAJORS = [
  "Bioengineering",
  "Computer & Information Science",
  "Computer Engineering",
  "Cybersecurity & Information Assurance",
  "Data Science",
  "Electrical Engineering",
  "Engineering Mathematics",
  "Human-Centered Engineering Design",
  "Industrial & Systems Engineering",
  "Manufacturing Engineering",
  "Mechanical Engineering",
  "Robotics Engineering",
  "Software Engineering",
] as const;

// vocab/symbol: typeof MAJORS[number] — any one item from the MAJORS array
export type Major = (typeof MAJORS)[number];

// Career-focus pills keyed by major — used after the student picks a major.
// vocab: Record<Major, …> = object map where every Major key has a string[] value
export const CAREER_NICHES_BY_MAJOR: Record<Major, readonly string[]> = {
  Bioengineering: [
    "Medical Devices",
    "Biomechanics",
    "Tissue Engineering",
    "Bioinformatics",
    "Healthcare Tech",
    "Clinical Research",
    "Prosthetics",
    "Pharmaceutical",
    "Lab Research",
    "Regulatory Affairs",
  ],
  "Computer & Information Science": [
    "Frontend",
    "Backend",
    "Full Stack",
    "Mobile",
    "AI / Machine Learning",
    "Cybersecurity",
    "Cloud & DevOps",
    "UI / UX Design",
    "Game Development",
    "Research",
    "Startup",
    "SaaS",
  ],
  "Computer Engineering": [
    "Embedded Systems",
    "Hardware Design",
    "Firmware",
    "IoT",
    "Robotics",
    "VLSI / Chip Design",
    "Signal Processing",
    "FPGA",
    "Automotive Electronics",
    "Research",
  ],
  "Cybersecurity & Information Assurance": [
    "Network Security",
    "Penetration Testing",
    "Incident Response",
    "Cloud Security",
    "Application Security",
    "Digital Forensics",
    "Identity & Access",
    "Compliance & GRC",
    "Malware Analysis",
    "Security Operations",
  ],
  "Data Science": [
    "Machine Learning",
    "Data Analytics",
    "Big Data",
    "NLP",
    "Computer Vision",
    "Business Intelligence",
    "Statistical Modeling",
    "MLOps",
    "Data Engineering",
    "Research",
  ],
  "Electrical Engineering": [
    "Power Systems",
    "Signal Processing",
    "Control Systems",
    "Communications",
    "Embedded Systems",
    "RF / Wireless",
    "Circuit Design",
    "Renewable Energy",
    "IoT",
    "Research",
  ],
  "Engineering Mathematics": [
    "Applied Mathematics",
    "Modeling & Simulation",
    "Optimization",
    "Data Science",
    "Financial Engineering",
    "Machine Learning",
    "Cryptography",
    "Operations Research",
    "Academia",
    "Research",
  ],
  "Human-Centered Engineering Design": [
    "UX Research",
    "Product Design",
    "Accessibility",
    "Service Design",
    "Human-Computer Interaction",
    "Design Systems",
    "User Testing",
    "Industrial Design",
    "Healthcare UX",
    "Research",
  ],
  "Industrial & Systems Engineering": [
    "Process Improvement",
    "Supply Chain",
    "Operations Research",
    "Quality Engineering",
    "Logistics",
    "Lean / Six Sigma",
    "Data Analytics",
    "Project Management",
    "Manufacturing Systems",
    "Research",
  ],
  "Manufacturing Engineering": [
    "CAD / CAM",
    "CNC & Machining",
    "Quality Control",
    "Process Engineering",
    "Automation",
    "Materials Science",
    "Lean Manufacturing",
    "Production Planning",
    "Robotics Integration",
    "Research",
  ],
  "Mechanical Engineering": [
    "Thermodynamics",
    "CAD / Design",
    "Automotive",
    "Aerospace",
    "HVAC",
    "Materials",
    "Robotics",
    "FEA / Simulation",
    "Manufacturing",
    "Research",
  ],
  "Robotics Engineering": [
    "Autonomous Systems",
    "Computer Vision",
    "Mechatronics",
    "ROS",
    "Control Systems",
    "AI / Machine Learning",
    "Embedded Systems",
    "Drone Tech",
    "Industrial Robotics",
    "Research",
  ],
  "Software Engineering": [
    "Frontend",
    "Backend",
    "Full Stack",
    "Mobile",
    "DevOps",
    "QA / Testing",
    "Cloud Architecture",
    "API Design",
    "Agile / Scrum",
    "Startup",
    "SaaS",
  ],
};

// Career niche pills for a given major, or an empty list when major is blank.
// Look up career-focus pills for a chosen major string.
// Used by OnboardingForm + AccountProfileEditor after the major dropdown changes.
export function getCareerNichesForMajor(major: string): readonly string[] {
  // No major yet — nothing to show (UI hides the niche PillGroup).
  if (!major) {
    return [];
  }

  // Unknown major string — fall back to empty instead of crashing.
  // vocab/symbol: as Major = tell TypeScript this string is one of the MAJORS values
  // vocab/symbol: ?? [] = if the key is missing from the map, return an empty list
  // Manipulate here: add niches under CAREER_NICHES_BY_MAJOR for that major key
  return CAREER_NICHES_BY_MAJOR[major as Major] ?? [];
}

// Interest categories for step 3 (each group becomes its own PillGroup).
export const PERSONAL_INTEREST_GROUPS = [
  {
    label: "Sports & fitness",
    options: [
      "Basketball",
      "Soccer",
      "Volleyball",
      "Football",
      "Tennis",
      "Pickleball",
      "Swimming",
      "Running",
      "Gym / Weightlifting",
      "Yoga",
      "Martial Arts",
      "Cycling",
      "Intramural Sports",
    ],
  },
  {
    label: "Outdoors & adventure",
    options: [
      "Hiking",
      "Camping",
      "Fishing",
      "Skateboarding",
      "Rock Climbing",
      "Biking",
      "Kayaking",
      "Beach Days",
      "Road Trips",
      "Skiing / Snowboarding",
      "Stargazing",
    ],
  },
  {
    label: "Games",
    options: [
      "Video Games — FPS",
      "Video Games — RPG",
      "Video Games — Fighting",
      "Video Games — Sports",
      "Board Games",
      "Chess",
      "Tabletop RPG",
      "D&D",
      "Pokémon",
      "Minecraft",
      "Card Games",
      "Esports",
      "VR Gaming",
    ],
  },
  {
    label: "Music",
    options: [
      "Concerts / Live Music",
      "Playing Guitar",
      "Playing Piano",
      "Singing",
      "DJing",
      "K-Pop",
      "Hip-Hop",
      "EDM",
      "Rock",
      "Jazz / Lo-Fi",
      "Vinyl Collecting",
      "Music Production",
    ],
  },
  {
    label: "Food & drink",
    options: [
      "Cooking",
      "Baking",
      "Coffee",
      "Dining Out",
      "BBQ",
      "Vegan / Vegetarian",
      "Food Trucks",
      "Brunch",
      "Trying New Restaurants",
      "Mixology / Cocktails",
    ],
  },
  {
    label: "Creative & arts",
    options: [
      "Drawing",
      "Painting",
      "Photography",
      "Film / Video",
      "Writing",
      "Poetry",
      "Fashion",
      "Cosplay",
      "Crafts",
      "DIY",
      "Content Creation",
      "Graphic Design",
    ],
  },
  {
    label: "Media & entertainment",
    options: [
      "Anime",
      "Marvel / DC",
      "Sci-Fi",
      "Horror",
      "K-Drama",
      "TV & Streaming",
      "Movies",
      "Books",
      "Comics / Manga",
      "Podcasts",
      "True Crime",
      "Reality TV",
      "Film Photography",
      "Streaming",
    ],
  },
  {
    label: "Social & hangouts",
    options: [
      "Coffee Chats",
      "Game Nights",
      "House Parties",
      "Nightlife",
      "Volunteering",
      "Thrifting",
      "Pub Quizzes",
      "Open Mic",
      "Hackathons",
      "Community Events",
    ],
  },
  {
    label: "Wellness & chill",
    options: [
      "Meditation",
      "Journaling",
      "Plants & Gardening",
      "Dogs",
      "Cats",
      "Self-Care",
      "Mindfulness",
      "Nature Walks",
    ],
  },
  {
    label: "Travel & lifestyle",
    options: [
      "Travel",
      "Backpacking",
      "Cars & Motorsports",
      "Collecting",
      "Astronomy",
      "Language Learning",
      "Open Source",
      "Entrepreneurship",
    ],
  },
] as const;

// Flat list of every interest pill — used to tell "known" vs custom interests apart.
// vocab/symbol: flatMap — run on each group and flatten into one combined array
export const PERSONAL_INTERESTS = PERSONAL_INTEREST_GROUPS.flatMap(
  (group) => group.options
);

/** @deprecated Use PERSONAL_INTEREST_GROUPS — kept for filter sidebar parity */
export const HOBBIES_AND_ACTIVITIES = PERSONAL_INTEREST_GROUPS[0].options;

/** @deprecated Use PERSONAL_INTEREST_GROUPS */
export const MEDIA_AND_ENTERTAINMENT = PERSONAL_INTEREST_GROUPS[6].options;

// Alias kept so older imports of CASUAL_INTERESTS still work.
export const CASUAL_INTERESTS = PERSONAL_INTERESTS;

// Split a comma- or semicolon-separated string into trimmed interest labels.
// Example: "Knitting, F1; Pottery" → ["Knitting", "F1", "Pottery"]
export function parseCustomInterests(raw: string): string[] {
  return raw
    // vocab/symbol: /[,;]+/ = split on one or more commas or semicolons
    .split(/[,;]+/)
    .map((item) => item.trim())
    // Drop empty pieces from trailing commas or double separators.
    .filter((item) => item.length > 0);
}

// Combine pill selections with custom-typed interests, removing duplicates.
// This is what gets written to profile.casualInterests on Finish / Save.
export function mergeCasualInterests(
  selected: string[],
  customRaw: string
): string[] {
  // vocab/symbol: new Set — removes duplicates; Array.from turns it back into a list
  // Order: pill picks first, then custom typed ones
  return Array.from(
    new Set([...selected, ...parseCustomInterests(customRaw)])
  );
}

// "Looking for" tags (study partner, hackathon squad, etc.).
export const LOOKING_FOR = [
  "Study Partner",
  "Project Teammate",
  "Hackathon Squad",
  "Gym Buddy",
  "Gaming Squad",
  "Mentor",
  "Mentee",
  "Coffee Chat",
  "Lab Partner",
  "Capstone Team",
] as const;

// ABOUT_YOU = looking-for tags plus a couple identity options.
export const ABOUT_YOU = [
  ...LOOKING_FOR,
  "Commuter Student",
  "First-Gen Student",
] as const;

// Optional belief / religion pills for step 3.
export const RELIGIONS = [
  "Christianity",
  "Islam",
  "Judaism",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Atheist / Agnostic",
  "Spiritual but not religious",
  "Prefer not to say",
] as const;

// Short note shown under the religion pills.
export const RELIGION_DISCLAIMER =
  "Optional — shared only to help classmates connect on a personal level. Never used for discrimination or judgment.";

// Why-Devora pills for step 4.
export const SIGNUP_REASONS = [
  "Find project teammates",
  "Meet study partners",
  "Discover CECS events",
  "Build my network",
  "Find mentors",
  "Make friends on campus",
  "Capstone collaboration",
  "Explore career paths",
] as const;

// Heading shown at the top of each onboarding step (index = step - 1).
export const STEP_TITLES = [
  "Who you are",
  "Career path & major",
  "About you & interests",
  "Why Devora",
  "Bio & socials",
] as const;
