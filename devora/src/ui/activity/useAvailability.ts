// Availability state and time-fit logic. Views only render what this hook returns.
// Hours stay on this device (localStorage) until Firestore holds them.

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_SHARE, TIME_BLOCKS, type ShareId, type SlotId } from "./config";
import type { Timed } from "./sample-data";

export type Fit = "fits" | "any" | "online" | "after" | "outside";

export const FIT_LABEL: Record<Fit, string> = {
  fits: "Fits your hours",
  any: "Any time, async",
  online: "Online option",
  after: "After class",
  outside: "Outside your hours",
};

// Lower sorts first: what you can make comes up top.
export const FIT_ORDER: Record<Fit, number> = { fits: 0, any: 1, online: 2, after: 3, outside: 4 };

const STORAGE_KEY = "devora-activity-hours-v1";
const EVENING: (typeof TIME_BLOCKS)[number]["id"] = "evening";

type Stored = { hours: SlotId[]; share: ShareId };

const readStored = (): Stored | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
};

export const useAvailability = (sampleHours: SlotId[]) => {
  const stored = useMemo(readStored, []);
  const [hours, setHours] = useState<Set<SlotId>>(() => new Set(stored?.hours ?? sampleHours));
  const [share, setShare] = useState<ShareId>(stored?.share ?? DEFAULT_SHARE);
  const [fitsOnly, setFitsOnly] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ hours: Array.from(hours), share }));
    } catch {
      // Storage blocked: the page still works for this visit.
    }
  }, [hours, share]);

  const setSlot = useCallback((slot: SlotId, free: boolean) => {
    setHours((prev) => {
      if (prev.has(slot) === free) return prev;
      const next = new Set(prev);
      if (free) next.add(slot);
      else next.delete(slot);
      return next;
    });
  }, []);

  const clear = useCallback(() => setHours(new Set()), []);
  const reset = useCallback(() => setHours(new Set(sampleHours)), [sampleHours]);

  const getFit = useCallback(
    (item: Timed): Fit => {
      if (item.async) return "any";
      if (item.slots.some((s) => hours.has(s))) return "fits";
      if (item.online) return "online";
      if (item.slots.length > 0 && item.slots.every((s) => s.endsWith(EVENING))) return "after";
      return "outside";
    },
    [hours],
  );

  const passesFilter = useCallback(
    (item: Timed) => {
      if (!fitsOnly) return true;
      const fit = getFit(item);
      return fit === "fits" || fit === "any";
    },
    [fitsOnly, getFit],
  );

  const overlapWith = useCallback(
    (partnerHours: SlotId[]) => partnerHours.filter((s) => hours.has(s)),
    [hours],
  );

  return {
    hours,
    freeCount: hours.size,
    isFree: (slot: SlotId) => hours.has(slot),
    setSlot,
    clear,
    reset,
    share,
    setShare,
    fitsOnly,
    setFitsOnly,
    getFit,
    passesFilter,
    overlapWith,
  };
};

export type Availability = ReturnType<typeof useAvailability>;
