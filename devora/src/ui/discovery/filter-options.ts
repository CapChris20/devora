// Static filter sidebar copy for the Discovery Grid.
// These lists match DESIGN_SCOPE.md (not Firestore yet — mock profiles use the same strings).
// Used by DiscoveryFilterSidebar. Edit options here to change what faculty see in the demo.

// vocab: as const = lock the array to these exact strings so TypeScript can autocomplete them
export const DISCOVERY_MAJORS = [
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

export const DISCOVERY_CONCENTRATIONS = [
  "Artificial Intelligence",
  "Computer Science",
  "Information Systems",
  "Game Design",
  "Digital Forensics",
  "Cybersecurity & Privacy",
] as const;

export const DISCOVERY_NICHES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile",
  "Embedded Systems",
  "FPGA / Hardware",
  "Cloud & DevOps",
  "UI/UX Design",
  "AI / Machine Learning",
  "Data Engineering",
  "Cybersecurity",
  "Robotics",
  "Game Development",
  "AR / VR",
  "IoT",
  "Systems Programming",
] as const;

export const DISCOVERY_HOBBIES = [
  "Hackathons",
  "Open Source",
  "Photography",
  "Fitness / Gym",
  "Cooking",
  "Hiking",
  "Skateboarding",
  "Basketball",
  "Soccer",
  "Chess",
  "Board Games",
  "Tabletop RPG",
  "Cars & Motorsports",
  "Art & Illustration",
  "Volunteering",
  "Entrepreneurship",
] as const;

export const DISCOVERY_MEDIA = [
  "Anime",
  "Marvel / DC",
  "Sci-Fi",
  "Horror",
  "K-Drama",
  "Hip-Hop",
  "EDM",
  "Rock",
  "Jazz / Lo-Fi",
  "Gaming — FPS",
  "Gaming — RPG",
  "Gaming — Fighting",
  "Streaming",
  "Podcasts",
  "Reading",
  "Film Photography",
] as const;

export const DISCOVERY_CLUBS = [
  "ACM",
  "IEEE",
  "ISC Robotics",
  "M@uto (Autonomous Vehicles)",
  "Dearborn Electric Racing",
  "NSBE",
  "SHPE",
  "Society of Women Engineers",
  "Game Dev Club",
  "Cybersecurity Club",
  "ECO",
  "Circle K",
  "First Gen Student Org",
  "Swing Dearborn",
  "BuildOn",
  "VictorsLink Events",
] as const;

export const DISCOVERY_LOOKING_FOR = [
  "Friend",
  "Study Partner",
  "Coffee Chat",
  "Colleague",
  "Mentor",
  "Mentee",
  "Gym Buddy",
  "Gaming Squad",
  "Lab Partner",
  "Campus Events",
] as const;

export const DISCOVERY_CLASS_YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
] as const;

// One sidebar block = a label + pill color + the option strings.
export type FilterSectionId =
  | "majors"
  | "concentrations"
  | "niches"
  | "hobbies"
  | "media"
  | "clubs"
  | "lookingFor"
  | "classYear";

// vocab: pillClass = CSS on the button chrome; activeLabelClass = gradient on the word when selected
// vocab: labelClass = gradient on the SECTION title (CECS Major, Looking For, …)
export type FilterSection = {
  id: FilterSectionId;
  label: string;
  // Empty string = Class Year (neutral glass, no cyan/gold chrome)
  pillClass: "page-pill-cyan" | "page-pill-purple" | "page-pill-gold" | "page-pill-pink" | "";
  labelClass: string;
  activeLabelClass: string;
  options: readonly string[];
};

// Section labels cycle the four Devora gradients (DESIGN_SCOPE mapping).
// Manipulate here: reorder sections or swap pillClass to retint a group
export const FILTER_SECTIONS: FilterSection[] = [
  {
    id: "majors",
    label: "CECS Major",
    pillClass: "page-pill-cyan",
    labelClass: "logo-gradient",
    activeLabelClass: "logo-gradient",
    options: DISCOVERY_MAJORS,
  },
  {
    id: "concentrations",
    label: "CIS / CIA Concentration",
    pillClass: "page-pill-purple",
    labelClass: "devora-gradient-text",
    activeLabelClass: "devora-gradient-text",
    options: DISCOVERY_CONCENTRATIONS,
  },
  {
    id: "niches",
    label: "Technical Niche",
    pillClass: "page-pill-gold",
    labelClass: "pink-grad",
    activeLabelClass: "pink-grad",
    options: DISCOVERY_NICHES,
  },
  {
    id: "hobbies",
    label: "Hobbies & Activities",
    pillClass: "page-pill-pink",
    labelClass: "headline-grad",
    activeLabelClass: "headline-grad",
    options: DISCOVERY_HOBBIES,
  },
  {
    id: "media",
    label: "Media & Entertainment",
    pillClass: "page-pill-purple",
    labelClass: "devora-gradient-text",
    activeLabelClass: "devora-gradient-text",
    options: DISCOVERY_MEDIA,
  },
  {
    id: "clubs",
    label: "Clubs & Orgs",
    pillClass: "page-pill-cyan",
    labelClass: "logo-gradient",
    activeLabelClass: "logo-gradient",
    options: DISCOVERY_CLUBS,
  },
  {
    id: "lookingFor",
    label: "Looking For",
    pillClass: "page-pill-gold",
    labelClass: "pink-grad",
    activeLabelClass: "pink-grad",
    options: DISCOVERY_LOOKING_FOR,
  },
  {
    id: "classYear",
    label: "Class Year",
    pillClass: "",
    labelClass: "headline-grad",
    activeLabelClass: "headline-grad",
    options: DISCOVERY_CLASS_YEARS,
  },
];

// Empty selected map — every section starts with no pills on.
export function emptyFilterSelection(): Record<FilterSectionId, string[]> {
  return {
    majors: [],
    concentrations: [],
    niches: [],
    hobbies: [],
    media: [],
    clubs: [],
    lookingFor: [],
    classYear: [],
  };
}

// How many pills are on across every section (drives “Clear N filters”).
export function countActiveFilters(selected: Record<FilterSectionId, string[]>): number {
  return FILTER_SECTIONS.reduce((sum, section) => sum + selected[section.id].length, 0);
}
