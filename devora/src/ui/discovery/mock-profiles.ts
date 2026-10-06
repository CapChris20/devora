// Mock CECS students — reference data for the deferred Discovery Grid, not mounted on /find-students.
// Filter pills match these exact strings. Keep as a shape example until users/{uid} browse exists.
// Used by card/peek components. Real queries: src/docs/discovery-grid.md.

import type { FilterSectionId } from "./filter-options";

// Avatar ring color — cycles cyan / purple / gold / pink per DESIGN_SCOPE.
export type DiscoveryAccent = "cyan" | "purple" | "gold" | "pink";

// Public card fields + extra mock-only tags so Clubs / Concentration filters still work.
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
};

// Illustrated mock PFP from Dicebear — seeded so the same student always gets the same face.
// vocab: seed = Dicebear uses this string as the RNG input (id, not the display name)
// Manipulate here: swap "adventurer" for "lorelei" / "notionists" if you want a different art style
export function getMockPhotoUrl(id: string): string {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(id)}&backgroundColor=2a1248`;
}

// Build the public social bag for a mock student.
// vocab: Partial = TypeScript — you can omit github / linkedin / instagram
// Manipulate here: pass only the networks that student filled in
function mockLinks(
  slug: string,
  networks: Array<"github" | "linkedin" | "instagram"> = ["github", "linkedin", "instagram"]
) {
  const catalog = {
    github: `https://github.com/${slug}`,
    linkedin: `https://www.linkedin.com/in/${slug}`,
    instagram: `https://instagram.com/${slug}`,
  };
  const links: DiscoveryProfile["links"] = {};
  for (const network of networks) {
    links[network] = catalog[network];
  }
  return links;
}

// 12 students so the grid looks full and every filter section has at least one hit.
// Manipulate here: add/rename people; keep tag strings identical to filter-options.ts
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
    links: mockLinks("alexchen"),
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
    links: mockLinks("mayahassan", ["github", "linkedin"]),
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
    links: mockLinks("jordanlee", ["github", "linkedin"]),
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
    links: mockLinks("priyapatel"),
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
    links: mockLinks("samokonkwo", ["github", "linkedin"]),
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
    links: mockLinks("rileynguyen", ["github", "instagram"]),
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
    links: mockLinks("chrisalvarez", ["instagram"]),
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
    links: mockLinks("taylorkim"),
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
    links: mockLinks("aisharahman", ["linkedin"]),
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
    links: mockLinks("noahberg", ["github", "instagram"]),
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
    links: mockLinks("elenavasquez", ["linkedin", "instagram"]),
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
    links: mockLinks("malikjohnson"),
    accent: "pink",
  },
];

// Two-letter initials from the display name (no Firestore profile needed).
export function getMockInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts[1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

// True if this profile should stay visible for the current search + pills.
// Within one section, any matching pill is enough (OR). Across sections, all must pass (AND).
export function profileMatchesFilters(
  profile: DiscoveryProfile,
  query: string,
  selected: Record<FilterSectionId, string[]>
): boolean {
  const needle = query.trim().toLowerCase();

  // Search box — name, major, tags, bio (client-side; Algolia later)
  if (needle) {
    const haystack = [
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
    if (!haystack.includes(needle)) {
      return false;
    }
  }

  // vocab/symbol: .some = true if at least one selected pill is on this profile
  if (selected.majors.length && !selected.majors.includes(profile.major)) {
    return false;
  }
  if (
    selected.concentrations.length &&
    (!profile.concentration || !selected.concentrations.includes(profile.concentration))
  ) {
    return false;
  }
  if (selected.niches.length && !selected.niches.some((tag) => profile.careerNiche.includes(tag))) {
    return false;
  }
  if (
    selected.hobbies.length &&
    !selected.hobbies.some((tag) => profile.casualInterests.includes(tag))
  ) {
    return false;
  }
  if (
    selected.media.length &&
    !selected.media.some((tag) => profile.casualInterests.includes(tag))
  ) {
    return false;
  }
  if (selected.clubs.length && !selected.clubs.some((tag) => profile.clubs.includes(tag))) {
    return false;
  }
  if (
    selected.lookingFor.length &&
    !selected.lookingFor.some((tag) => profile.lookingFor.includes(tag))
  ) {
    return false;
  }
  if (selected.classYear.length && !selected.classYear.includes(profile.classRank)) {
    return false;
  }

  return true;
}
