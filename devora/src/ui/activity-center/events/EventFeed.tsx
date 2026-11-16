// Main events feed component.
// Renders the feed header, category chips, weekly grouped ticket feeds, and empty states.
// Applies GSAP cascading entrance with slight alternating rotation on mount.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import type { ActivityEventTag } from "@/types/activity-center";

import { useActivityCenter } from "../ActivityCenterContext";
import { CALENDAR_WEEKS } from "../placeholder-data";
import EmptyState from "../shared/EmptyState";
import EventFilter from "./EventFilter";
import EventTicket from "./EventTicket";
import PostEventModal from "./PostEventModal";

// ===== MAIN COMPONENT =====

export default function EventFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { events, eventFilter, openPostEventModal, isEventsLoading } =
    useActivityCenter();

  // Filter events based on active category chip
  const filteredEvents = events.filter(
    (e) => eventFilter === "all" || e.tags.includes(eventFilter as ActivityEventTag)
  );

  // Cascading entrance animation for all [data-in] elements
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = containerRef.current?.querySelectorAll("[data-in]");
        if (items && items.length > 0) {
          gsap.fromTo(
            items,
            {
              y: 34,
              autoAlpha: 0,
              rotation: (i: number) => (i % 2 === 0 ? 1.2 : -1.2),
            },
            {
              y: 0,
              autoAlpha: 1,
              rotation: 0,
              duration: 0.6,
              ease: "back.out(1.5)",
              stagger: 0.055,
              clearProps: "transform,opacity,visibility",
            }
          );
        }
      });
    },
    { dependencies: [eventFilter], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* Feed header */}
      <div
        data-in
        className="flex flex-wrap items-end justify-between gap-3.5 mb-5.5"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 mb-2 font-nb-mono text-[11px] font-bold tracking-[0.18em] uppercase text-nb-muted">
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full border-2 border-nb-ink bg-nb-brand flex-shrink-0"
            />
            <span>
              {isEventsLoading
                ? "Loading events..."
                : `${events.length} ${events.length === 1 ? "event" : "events"} scheduled`}
            </span>
          </p>
          <h2 className="m-0 text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.025em] leading-[1.05] text-nb-ink">
            Upcoming CECS events
          </h2>
          <p className="mt-2 text-base text-nb-muted max-w-[56ch]">
            Posted early, so you can plan around class and your commute. Save the
            ones you want on your week.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openPostEventModal}
            className="btn primary inline-flex items-center gap-2 min-h-[44px] px-5 rounded-nb border-nb border-nb-ink bg-nb-brand text-nb-ink font-bold text-sm tracking-normal shadow-nb transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Post an Event</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <EventFilter />

      {/* Feed Content */}
      {isEventsLoading ? (
        <div className="flex flex-col gap-4 py-6" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-nb-white/60 border-nb border-nb-ink/30 rounded-nb animate-pulse"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          statusTag={
            eventFilter === "all"
              ? "EVENTS // 0_SCHEDULED"
              : `FILTER // 0_${eventFilter.toUpperCase()}`
          }
          icon={
            <svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-nb-ink"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="12" cy="15" r="2" />
            </svg>
          }
          title={
            eventFilter === "all"
              ? "No events posted yet"
              : `No ${eventFilter} events found`
          }
          description={
            eventFilter === "all"
              ? "Be the first student to post an exam review, club meeting, or campus meetup!"
              : `No events currently match "${eventFilter}". Select another tag or post one now.`
          }
          action={
            <button
              type="button"
              onClick={openPostEventModal}
              className="btn primary inline-flex items-center gap-2 min-h-[44px] px-6 rounded-nb border-nb border-nb-ink bg-nb-brand text-nb-ink font-bold text-sm tracking-normal shadow-nb hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Post the first event</span>
            </button>
          }
        />
      ) : (
        /* Weeks groups */
        <div className="flex flex-col gap-7.5">
          {CALENDAR_WEEKS.map((week, weekIndex) => {
            const eventsInWeek = filteredEvents.filter((e) => {
              const w = typeof e.week === "number" ? e.week : 0;
              if (weekIndex === CALENDAR_WEEKS.length - 1) {
                return w >= weekIndex;
              }
              return w === weekIndex;
            });
            if (eventsInWeek.length === 0) return null;

            return (
              <section key={week.title}>
                {/* Week section header with ink line divider */}
                <div
                  data-in
                  className="flex items-center gap-3 mb-3.5 after:content-[''] after:flex-1 after:h-[3px] after:bg-nb-ink after:rounded-[3px]"
                >
                  <h3 className="m-0 text-lg font-bold whitespace-nowrap text-nb-ink">
                    {week.title}
                  </h3>
                  <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted whitespace-nowrap">
                    {week.range}
                  </span>
                </div>

                {week.note && (
                  <p data-in className="-mt-1 mb-3.5 text-[13px] text-nb-muted">
                    {week.note}
                  </p>
                )}

                {/* Tickets grid */}
                <div className="grid gap-4.5">
                  {eventsInWeek.map((event) => (
                    <EventTicket key={event.id} event={event} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Post Event Modal dialog */}
      <PostEventModal />
    </div>
  );
}
