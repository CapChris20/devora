// Decides whether a campus event is already over, so past events never show in any list.
// Events store their day in a few shapes: "2026-12-03", { mon: "DEC", day: "3" }, or "Wed, Nov 12".
// Rule: an event stays visible through the whole day it happens, and disappears the next morning.

// ===== NAMED CONSTANTS =====

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
// A month/day with no year that lands more than this many days before today is read as next year
// (a "JAN 8" event seen on Dec 20 is next January, not last January).
// Manipulate here: widen or shrink how far back a year-less date may be before it rolls forward
const YEARLESS_ROLLOVER_DAYS = 180;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// ===== HELPER FUNCTIONS =====

function startOfDay(someDate: Date): Date {
  return new Date(someDate.getFullYear(), someDate.getMonth(), someDate.getDate());
}

function readMonthIndex(monthText: string): number {
  return MONTH_NAMES.indexOf(monthText.trim().slice(0, 3).toUpperCase());
}

function readIsoDate(isoText: string): Date | null {
  const dateParts = isoText.trim().split("-").map(Number);
  const hasThreeNumbers = dateParts.length === 3 && dateParts.every((part) => Number.isFinite(part));
  if (!hasThreeNumbers) return null;
  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
}

function readYearlessDate(monthText: string, dayText: string, today: Date): Date | null {
  const monthIndex = readMonthIndex(monthText);
  const dayNumber = Number.parseInt(dayText, 10);
  if (monthIndex < 0 || !Number.isFinite(dayNumber)) return null;

  const sameYearDate = new Date(today.getFullYear(), monthIndex, dayNumber);
  const daysBeforeToday = (today.getTime() - sameYearDate.getTime()) / MILLISECONDS_PER_DAY;
  if (daysBeforeToday > YEARLESS_ROLLOVER_DAYS) {
    return new Date(today.getFullYear() + 1, monthIndex, dayNumber);
  }
  return sameYearDate;
}

// "Wed, Nov 12" → month "Nov", day "12"
function readWrittenOutDate(writtenDate: string, today: Date): Date | null {
  const words = writtenDate.replace(",", " ").trim().split(/\s+/);
  if (words.length < 2) return null;
  const dayText = words[words.length - 1];
  const monthText = words[words.length - 2];
  return readYearlessDate(monthText, dayText, today);
}

// ===== MAIN FUNCTIONS =====

type EventDateFields = { date?: string; mon?: string; day?: string };

/**
 * Work out which calendar day an event happens on.
 * @returns The event's day at midnight, or null when no date can be read
 */
export function readEventDay(event: EventDateFields, today: Date = new Date()): Date | null {
  const todayStart = startOfDay(today);
  const dateText = event.date?.trim() ?? "";

  // 1. Exact ISO date from the post-event form ("2026-12-03")
  const isoDate = dateText ? readIsoDate(dateText) : null;
  if (isoDate) return isoDate;

  // 2. Month + day fields ("DEC" + "3")
  if (event.mon && event.day) return readYearlessDate(event.mon, event.day, todayStart);

  // 3. Written-out date ("Wed, Nov 12")
  if (dateText) return readWrittenOutDate(dateText, todayStart);

  return null;
}

/**
 * True when the event's day is before today. Events with no readable date are kept.
 */
export function isPastEvent(event: EventDateFields, today: Date = new Date()): boolean {
  const eventDay = readEventDay(event, today);
  if (!eventDay) return false;
  return eventDay.getTime() < startOfDay(today).getTime();
}

/**
 * Keep only events happening today or later.
 */
export function keepUpcomingEvents<EventShape extends EventDateFields>(
  events: EventShape[],
  today: Date = new Date()
): EventShape[] {
  return events.filter((event) => !isPastEvent(event, today));
}

/**
 * Upcoming events in date order (soonest first). Events with no readable date go last.
 */
export function sortEventsSoonestFirst<EventShape extends EventDateFields>(
  events: EventShape[],
  today: Date = new Date()
): EventShape[] {
  const readSortTime = (event: EventShape) => readEventDay(event, today)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return [...events].sort((firstEvent, secondEvent) => readSortTime(firstEvent) - readSortTime(secondEvent));
}
