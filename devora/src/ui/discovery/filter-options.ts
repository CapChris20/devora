// Static filter sidebar copy for the Discovery Grid.
// Flow: these lists fill the sidebar pills, and the grid starts with none of them selected.
// Used by DiscoveryFilterSidebar and DiscoveryGridContent. Mock profiles reuse the same strings.

// ===== NAMED CONSTANTS =====

// Repeated pill and title classes. The strings match globals.css exactly.
// Manipulate here: these tokens only change color if the CSS class names stay the same.
const PILL_CLASS_CYAN = "page-pill-cyan" as const;
const PILL_CLASS_PURPLE = "page-pill-purple" as const;
const PILL_CLASS_GOLD = "page-pill-gold" as const;
const PILL_CLASS_PINK = "page-pill-pink" as const;
// Empty string = Class Year stays neutral glass, with no cyan/gold chrome.
const PILL_CLASS_NONE = "" as const;

const LABEL_CLASS_LOGO = "logo-gradient" as const;
const LABEL_CLASS_DEVORA = "devora-gradient-text" as const;
const LABEL_CLASS_PINK = "pink-grad" as const;
const LABEL_CLASS_HEADLINE = "headline-grad" as const;

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

// ===== TYPES =====

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
  pillClass: "page-pill-cyan" | "page-pill-purple" | "page-pill-gold" | "page-pill-pink" | "";
  labelClass: string;
  activeLabelClass: string;
  options: readonly string[];
};

// This list is a constant, but it has to follow FilterSection so each row is type-checked.
// Section labels cycle the four Devora gradients (DESIGN_SCOPE mapping).
// Manipulate here: reorder sections or swap pillClass to retint a group
export const FILTER_SECTIONS: FilterSection[] = [
  {
    id: "majors",
    label: "CECS Major",
    pillClass: PILL_CLASS_CYAN,
    labelClass: LABEL_CLASS_LOGO,
    activeLabelClass: LABEL_CLASS_LOGO,
    options: DISCOVERY_MAJORS,
  },
  {
    id: "concentrations",
    label: "CIS / CIA Concentration",
    pillClass: PILL_CLASS_PURPLE,
    labelClass: LABEL_CLASS_DEVORA,
    activeLabelClass: LABEL_CLASS_DEVORA,
    options: DISCOVERY_CONCENTRATIONS,
  },
  {
    id: "niches",
    label: "Technical Niche",
    pillClass: PILL_CLASS_GOLD,
    labelClass: LABEL_CLASS_PINK,
    activeLabelClass: LABEL_CLASS_PINK,
    options: DISCOVERY_NICHES,
  },
  {
    id: "hobbies",
    label: "Hobbies & Activities",
    pillClass: PILL_CLASS_PINK,
    labelClass: LABEL_CLASS_HEADLINE,
    activeLabelClass: LABEL_CLASS_HEADLINE,
    options: DISCOVERY_HOBBIES,
  },
  {
    id: "media",
    label: "Media & Entertainment",
    pillClass: PILL_CLASS_PURPLE,
    labelClass: LABEL_CLASS_DEVORA,
    activeLabelClass: LABEL_CLASS_DEVORA,
    options: DISCOVERY_MEDIA,
  },
  {
    id: "clubs",
    label: "Clubs & Orgs",
    pillClass: PILL_CLASS_CYAN,
    labelClass: LABEL_CLASS_LOGO,
    activeLabelClass: LABEL_CLASS_LOGO,
    options: DISCOVERY_CLUBS,
  },
  {
    id: "lookingFor",
    label: "Looking For",
    pillClass: PILL_CLASS_GOLD,
    labelClass: LABEL_CLASS_PINK,
    activeLabelClass: LABEL_CLASS_PINK,
    options: DISCOVERY_LOOKING_FOR,
  },
  {
    id: "classYear",
    label: "Class Year",
    pillClass: PILL_CLASS_NONE,
    labelClass: LABEL_CLASS_HEADLINE,
    activeLabelClass: LABEL_CLASS_HEADLINE,
    options: DISCOVERY_CLASS_YEARS,
  },
];

// ===== MAIN FUNCTIONS =====

/**
 * Start the sidebar with every section cleared.
 * @returns A map whose keys are the section ids and whose values are empty lists
 */
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

/**
 * Count how many pills are on across every section.
 * The sidebar uses this for the “Clear N filters” label.
 * @param selectedFilters - Pills that are currently on, grouped by section id
 * @returns The total number of selected pills
 */
export function countActiveFilters(selectedFilters: Record<FilterSectionId, string[]>): number {
  return FILTER_SECTIONS.reduce((runningTotal, section) => {
    return runningTotal + selectedFilters[section.id].length;
  }, 0);
}
