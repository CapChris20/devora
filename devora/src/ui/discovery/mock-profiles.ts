// Mock CECS students — reference data for the deferred Discovery Grid, not mounted on /find-students.
// Filter pills match these exact strings. Keep this as the shape example until users/{uid} browse exists.
// Used by the card and peek components. Real queries live in src/docs/discovery-grid.md.

// ===== IMPORTS =====

import type { FilterSectionId } from "./filter-options";

// ===== NAMED CONSTANTS =====

const DICEBEAR_AVATAR_URL_PREFIX = "https://api.dicebear.com/9.x/adventurer/svg?seed=";
const DICEBEAR_BACKGROUND_QUERY = "&backgroundColor=2a1248";
const GITHUB_PROFILE_URL_PREFIX = "https://github.com/";
const LINKEDIN_PROFILE_URL_PREFIX = "https://www.linkedin.com/in/";
const INSTAGRAM_PROFILE_URL_PREFIX = "https://instagram.com/";
const MISSING_INITIAL = "?";
const NAME_WHITESPACE_PATTERN = /\s+/;
const DEFAULT_MOCK_SOCIAL_NETWORKS: Array<"github" | "linkedin" | "instagram"> = [
  "github",
  "linkedin",
  "instagram",
];

// ===== TYPES =====

type MockSocialNetwork = "github" | "linkedin" | "instagram";

// Avatar ring color — cycles cyan / purple / gold / pink per DESIGN_SCOPE.
export type DiscoveryAccent = "cyan" | "purple" | "gold" | "pink";

// Public card fields plus extra mock-only tags so Clubs and Concentration filters still work.
// Field names stay as written because the card and peek read these exact keys.
export type DiscoveryProfile = {
  id: string;
  displayName: string;
  // Short major on the card (CIS, CompE) — filters still use the full `major` string
  majorShort: string;
  major: string;
  classRank: string;
  careerNiche: string[];
  casualInterests: string[];
  lookingFor: string[];
  clubs: string[];
  // Only CIS / CIA students typically have this; others leave it blank
  concentration?: string;
  bio: string;
  // Public socials — same shape as Firestore users.links
  links: {
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  accent: DiscoveryAccent;
  // Real Storage URL when the student uploaded one. Missing means initials, not a mock face.
  photoUrl?: string;
};

// ===== HELPER FUNCTIONS =====

// Build the public social bag for a mock student.
// vocab: the links type lets a student omit github, linkedin, or instagram
// Manipulate here: pass only the networks that student filled in
function buildMockProfileLinks(
  profileSlug: string,
  socialNetworks: MockSocialNetwork[] = DEFAULT_MOCK_SOCIAL_NETWORKS
): DiscoveryProfile["links"] {
  const socialUrlByNetwork = {
    github: `${GITHUB_PROFILE_URL_PREFIX}${profileSlug}`,
    linkedin: `${LINKEDIN_PROFILE_URL_PREFIX}${profileSlug}`,
    instagram: `${INSTAGRAM_PROFILE_URL_PREFIX}${profileSlug}`,
  };
  const links: DiscoveryProfile["links"] = {};

  for (const socialNetwork of socialNetworks) {
    links[socialNetwork] = socialUrlByNetwork[socialNetwork];
  }

  return links;
}

function doesProfileMatchSearchText(profile: DiscoveryProfile, searchQuery: string): boolean {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  // Search box stays on these fields only. Concentration and looking-for are pill filters, not search.
  const searchableProfileText = [
    profile.displayName,
    profile.major,
    profile.majorShort,
    profile.bio,
    ...profile.careerNiche,
    ...profile.casualInterests,
    ...profile.clubs,
  ]
    .join(" ")
    .toLowerCase();

  return searchableProfileText.includes(normalizedQuery);
}

// vocab: .some = true if at least one selected pill is on this profile
function doesSelectionMatchAnyProfileTag(selectedTags: string[], profileTags: string[]): boolean {
  if (selectedTags.length === 0) {
    return true;
  }
  return selectedTags.some((tag) => profileTags.includes(tag));
}

function doesRequiredValueMatchSelection(selectedValues: string[], profileValue: string): boolean {
  if (selectedValues.length === 0) {
    return true;
  }
  return selectedValues.includes(profileValue);
}

function doesOptionalValueMatchSelection(
  selectedValues: string[],
  profileValue: string | undefined
): boolean {
  if (selectedValues.length === 0) {
    return true;
  }
  // A blank concentration cannot satisfy a concentration pill.
  if (!profileValue) {
    return false;
  }
  return selectedValues.includes(profileValue);
}

// ===== MAIN FUNCTIONS =====

/**
 * Illustrated mock portrait from Dicebear. The same id always gets the same face.
 * @param profileId - Seed string. Dicebear uses this as the random input, not the display name.
 * @returns An SVG URL for that seed
 */
export function getMockPhotoUrl(profileId: string): string {
  const encodedSeed = encodeURIComponent(profileId);
  // Manipulate here: swap "adventurer" in the prefix for "lorelei" or "notionists" for a different style
  return `${DICEBEAR_AVATAR_URL_PREFIX}${encodedSeed}${DICEBEAR_BACKGROUND_QUERY}`;
}

/**
 * Two-letter initials from the display name, for when the mock photo fails.
 * @param displayName - The student's full name
 * @returns Uppercase initials, or "?" when the name is blank
 */
export function getMockInitials(displayName: string): string {
  const nameParts = displayName.trim().split(NAME_WHITESPACE_PATTERN);
  const firstInitial = nameParts[0]?.[0] ?? MISSING_INITIAL;
  const lastInitial = nameParts[1]?.[0] ?? "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

// 12 students so the grid looks full and every filter section has at least one hit.
// Manipulate here: add or rename people; keep tag strings identical to filter-options.ts
export const MOCK_PROFILES: DiscoveryProfile[] = [
  {
    id: "alex-chen",
    displayName: "Alex Chen",
    majorShort: "CIS",
    major: "Computer & Information Science",
    classRank: "Junior",
    concentration: "Computer Science",
    careerNiche: ["Frontend", "Full Stack"],
    casualInterests: ["Hackathons", "Anime"],
    lookingFor: ["Friend", "Campus Events"],
    clubs: ["ACM"],
    bio: "CIS junior into frontend. Always down for coffee after ACM and a weekend event.",
    links: buildMockProfileLinks("alexchen"),
    accent: "cyan",
  },
  {
    id: "maya-hassan",
    displayName: "Maya Hassan",
    majorShort: "CompE",
    major: "Computer Engineering",
    classRank: "Sophomore",
    careerNiche: ["Embedded Systems", "Robotics"],
    casualInterests: ["Hiking", "Sci-Fi"],
    lookingFor: ["Lab Partner", "Study Partner"],
    clubs: ["IEEE", "ISC Robotics"],
    bio: "Firmware + sensors. Looking for a lab partner who actually shows up to office hours.",
    links: buildMockProfileLinks("mayahassan", ["github", "linkedin"]),
    accent: "purple",
  },
  {
    id: "jordan-lee",
    displayName: "Jordan Lee",
    majorShort: "SE",
    major: "Software Engineering",
    classRank: "Senior",
    careerNiche: ["Backend", "Cloud & DevOps"],
    casualInterests: ["Open Source", "Gaming — RPG"],
    lookingFor: ["Colleague", "Mentor"],
    clubs: ["ACM"],
    bio: "SE senior on Node + AWS. Happy to swap internship stories and résumé notes.",
    links: buildMockProfileLinks("jordanlee", ["github", "linkedin"]),
    accent: "gold",
  },
  {
    id: "priya-patel",
    displayName: "Priya Patel",
    majorShort: "DS",
    major: "Data Science",
    classRank: "Junior",
    careerNiche: ["AI / Machine Learning", "Data Engineering"],
    casualInterests: ["Chess", "K-Drama"],
    lookingFor: ["Study Partner", "Coffee Chat"],
    clubs: ["Society of Women Engineers"],
    bio: "Training models by day, speed-chess by night. Need a stats buddy for CIS 350.",
    links: buildMockProfileLinks("priyapatel"),
    accent: "pink",
  },
  {
    id: "sam-okonkwo",
    displayName: "Sam Okonkwo",
    majorShort: "CIA",
    major: "Cybersecurity & Information Assurance",
    classRank: "Senior",
    concentration: "Digital Forensics",
    careerNiche: ["Cybersecurity", "Systems Programming"],
    casualInterests: ["Podcasts", "Fitness / Gym"],
    lookingFor: ["Mentor", "Gym Buddy"],
    clubs: ["Cybersecurity Club", "NSBE"],
    bio: "Forensics labs and CTFs. Will talk threat models if you spot me on a deadlift.",
    links: buildMockProfileLinks("samokonkwo", ["github", "linkedin"]),
    accent: "cyan",
  },
  {
    id: "riley-nguyen",
    displayName: "Riley Nguyen",
    majorShort: "EE",
    major: "Electrical Engineering",
    classRank: "Sophomore",
    careerNiche: ["IoT", "FPGA / Hardware"],
    casualInterests: ["Rock", "Photography"],
    lookingFor: ["Friend", "Coffee Chat"],
    clubs: ["IEEE"],
    bio: "Boards, sensors, and a film camera. Looking for people who geek out on hardware and photos.",
    links: buildMockProfileLinks("rileynguyen", ["github", "instagram"]),
    accent: "purple",
  },
  {
    id: "chris-alvarez",
    displayName: "Chris Alvarez",
    majorShort: "Robotics",
    major: "Robotics Engineering",
    classRank: "Freshman",
    careerNiche: ["Robotics", "Embedded Systems"],
    casualInterests: ["Basketball", "Marvel / DC"],
    lookingFor: ["Mentee", "Gaming Squad"],
    clubs: ["M@uto (Autonomous Vehicles)"],
    bio: "New to Dearborn. Want a crew for M@uto and pickup basketball after labs.",
    links: buildMockProfileLinks("chrisalvarez", ["instagram"]),
    accent: "gold",
  },
  {
    id: "taylor-kim",
    displayName: "Taylor Kim",
    majorShort: "HCED",
    major: "Human-Centered Engineering Design",
    classRank: "Junior",
    careerNiche: ["UI/UX Design", "Frontend"],
    casualInterests: ["Art & Illustration", "Film Photography"],
    lookingFor: ["Friend", "Campus Events"],
    clubs: ["Game Dev Club"],
    bio: "Figma and React. Want friends in HCED / frontend who actually show up to campus stuff.",
    links: buildMockProfileLinks("taylorkim"),
    accent: "pink",
  },
  {
    id: "aisha-rahman",
    displayName: "Aisha Rahman",
    majorShort: "BME",
    major: "Bioengineering",
    classRank: "Graduate",
    careerNiche: ["AI / Machine Learning", "Data Engineering"],
    casualInterests: ["Reading", "Volunteering"],
    lookingFor: ["Coffee Chat", "Mentor"],
    clubs: ["SHPE", "BuildOn"],
    bio: "Healthcare data + devices. Open to coffee chats about grad life and industry internships.",
    links: buildMockProfileLinks("aisharahman", ["linkedin"]),
    accent: "cyan",
  },
  {
    id: "noah-berg",
    displayName: "Noah Berg",
    majorShort: "ME",
    major: "Mechanical Engineering",
    classRank: "Junior",
    careerNiche: ["FPGA / Hardware", "IoT"],
    casualInterests: ["Cars & Motorsports", "Fitness / Gym"],
    lookingFor: ["Gym Buddy", "Friend"],
    clubs: ["Dearborn Electric Racing"],
    bio: "DER chassis + gym at 6am. Looking for a gym buddy who also likes cars.",
    links: buildMockProfileLinks("noahberg", ["github", "instagram"]),
    accent: "purple",
  },
  {
    id: "elena-vasquez",
    displayName: "Elena Vasquez",
    majorShort: "ISE",
    major: "Industrial & Systems Engineering",
    classRank: "Senior",
    careerNiche: ["Cloud & DevOps", "UI/UX Design"],
    casualInterests: ["Entrepreneurship", "Jazz / Lo-Fi"],
    lookingFor: ["Colleague", "Coffee Chat"],
    clubs: ["SHPE", "First Gen Student Org"],
    bio: "Process + product. Mapping first-gen resources for CECS — always open to coffee chats.",
    links: buildMockProfileLinks("elenavasquez", ["linkedin", "instagram"]),
    accent: "gold",
  },
  {
    id: "malik-johnson",
    displayName: "Malik Johnson",
    majorShort: "CIS",
    major: "Computer & Information Science",
    classRank: "Freshman",
    concentration: "Game Design",
    careerNiche: ["Game Development", "AR / VR"],
    casualInterests: ["Gaming — Fighting", "Marvel / DC"],
    lookingFor: ["Gaming Squad", "Friend"],
    clubs: ["Game Dev Club", "NSBE"],
    bio: "Unity newbie hunting a fighting-game squad and friends who won't ghost a campus event.",
    links: buildMockProfileLinks("malikjohnson"),
    accent: "pink",
  },
];

/**
 * True when this profile should stay visible for the current search and pills.
 * Within one section, any matching pill is enough. Across sections, every section must pass.
 * @param profile - The student to test
 * @param searchQuery - Text from the search box. Blank search matches everyone.
 * @param selectedFilters - Pills that are on, grouped by section id
 * @returns True when the profile passes search and every active section
 */
export function profileMatchesFilters(
  profile: DiscoveryProfile,
  searchQuery: string,
  selectedFilters: Record<FilterSectionId, string[]>
): boolean {
  if (!doesProfileMatchSearchText(profile, searchQuery)) {
    return false;
  }
  if (!doesRequiredValueMatchSelection(selectedFilters.majors, profile.major)) {
    return false;
  }
  if (!doesOptionalValueMatchSelection(selectedFilters.concentrations, profile.concentration)) {
    return false;
  }
  if (!doesSelectionMatchAnyProfileTag(selectedFilters.niches, profile.careerNiche)) {
    return false;
  }
  // Hobbies and media both live in casualInterests on the mock cards.
  if (!doesSelectionMatchAnyProfileTag(selectedFilters.hobbies, profile.casualInterests)) {
    return false;
  }
  if (!doesSelectionMatchAnyProfileTag(selectedFilters.media, profile.casualInterests)) {
    return false;
  }
  if (!doesSelectionMatchAnyProfileTag(selectedFilters.clubs, profile.clubs)) {
    return false;
  }
  if (!doesSelectionMatchAnyProfileTag(selectedFilters.lookingFor, profile.lookingFor)) {
    return false;
  }
  if (!doesRequiredValueMatchSelection(selectedFilters.classYear, profile.classRank)) {
    return false;
  }

  return true;
}
