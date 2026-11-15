// Everything the second survey (OSL / ITS) might change lives here, not in the views.
// Rename the section, change the time blocks, or change who can see hours in one place.

export const ACTIVITY_CENTER_NAME = "Activity Center";

export const DAYS = [
  { id: "mon", short: "Mon", long: "Monday" },
  { id: "tue", short: "Tue", long: "Tuesday" },
  { id: "wed", short: "Wed", long: "Wednesday" },
  { id: "thu", short: "Thu", long: "Thursday" },
  { id: "fri", short: "Fri", long: "Friday" },
  { id: "sat", short: "Sat", long: "Saturday" },
  { id: "sun", short: "Sun", long: "Sunday" },
] as const;

export const TIME_BLOCKS = [
  { id: "morning", label: "Morning", range: "8 to 12" },
  { id: "afternoon", label: "Afternoon", range: "12 to 5" },
  { id: "evening", label: "Evening", range: "5 to 9" },
] as const;

export type DayId = (typeof DAYS)[number]["id"];
export type BlockId = (typeof TIME_BLOCKS)[number]["id"];
export type SlotId = `${DayId}-${BlockId}`;

export const slotId = (day: DayId, block: BlockId): SlotId => `${day}-${block}`;

export const describeSlot = (slot: SlotId) => {
  const [dayId, blockId] = slot.split("-") as [DayId, BlockId];
  const day = DAYS.find((d) => d.id === dayId);
  const block = TIME_BLOCKS.find((b) => b.id === blockId);
  return {
    day: day?.long ?? dayId,
    dayShort: day?.short ?? dayId,
    block: block?.label ?? blockId,
    range: block?.range ?? "",
  };
};

export const SHARE_OPTIONS = [
  {
    id: "only-me",
    label: "Only me",
    hint: "Nobody sees your hours. Devora still uses them to sort what fits you.",
  },
  {
    id: "connections",
    label: "My connections",
    hint: "People you are connected with can see your free blocks when picking a time.",
  },
  {
    id: "cecs",
    label: "CECS students",
    hint: "Any signed-in CECS student can see your free blocks on your profile.",
  },
] as const;

export type ShareId = (typeof SHARE_OPTIONS)[number]["id"];

// Default stays private until the second survey says students want to share.
export const DEFAULT_SHARE: ShareId = "only-me";

export const LINKS = {
  tutoring: {
    label: "Engineering Learning Center",
    href: "https://umdearborn.edu/cecs/undergraduate-programs/engineering-learning-center",
  },
  calendar: {
    label: "HelloRubric",
    href: "https://www.hellorubric.com",
  },
} as const;
