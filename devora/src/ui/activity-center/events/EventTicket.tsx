// Event ticket card component.
// Features 3-part layout: gradient date block, event details body, and perforated stub with notch cutouts.
// Responsive: on small screens (<= 760px), stub shifts underneath with a horizontal dashed border.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";

import type { ActivityEvent } from "@/types/activity-center";

import { useActivityCenter } from "../ActivityCenterContext";
import { TAG_TONE } from "../placeholder-data";
import Tag from "../shared/Tag";

// ===== TYPES =====

type EventTicketProps = {
  event: ActivityEvent;
};

// ===== MAIN COMPONENT =====

export default function EventTicket({ event }: EventTicketProps) {
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const { savedEventIds, toggleSaveEvent } = useActivityCenter();

  const isSaved = Boolean(savedEventIds[event.id]);
  const dateTone = TAG_TONE[event.tags[0]] || "bg-nb-sky";

  const handleSaveClick = () => {
    toggleSaveEvent(event.id);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (saveBtnRef.current) {
        gsap.fromTo(
          saveBtnRef.current,
          { scale: 0.86 },
          {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1.1, 0.45)",
            clearProps: "transform",
          }
        );
      }
    });
  };

  return (
    <article
      data-in
      data-event={event.id}
      className="card lift bg-nb-white border-nb border-nb-ink rounded-nb shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg grid grid-cols-[74px_minmax(0,1fr)] sm:grid-cols-[92px_minmax(0,1fr)_190px] overflow-hidden"
    >
      {/* Date block */}
      <div
        className={`flex flex-col items-center justify-center gap-0.5 p-3 sm:py-3.5 sm:px-2 border-r-nb border-nb-ink ${dateTone}`}
      >
        <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] text-nb-ink">
          {event.mon}
        </span>
        <span className="font-nb-display text-[30px] sm:text-[38px] leading-none text-nb-ink">
          {event.day}
        </span>
        <span className="font-nb-mono text-[10px] font-bold tracking-[0.12em] text-nb-ink">
          {event.dow}
        </span>
      </div>

      {/* Main details */}
      <div className="min-w-0 p-4 sm:px-4.5 sm:py-4 flex flex-col justify-center gap-1.5">
        <h4 className="m-0 text-lg font-bold leading-snug text-nb-ink">
          {event.title}
        </h4>
        <p className="m-0 text-sm text-nb-muted leading-relaxed">
          {event.description}
        </p>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[13px] font-medium text-nb-ink">
          <span className="inline-flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>{event.time}</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{event.location}</span>
          </span>

          <span className="inline-flex items-center gap-1.5" title="Posted by">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
              <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
              <path d="M18 14a6.5 6.5 0 0 1 3.5 6" />
            </svg>
            <span>{event.organizer}</span>
          </span>

          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline decoration-2 hover:text-nb-brand transition-colors"
            >
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Link</span>
            </a>
          )}
        </div>
      </div>

      {/* Perforated Stub */}
      <div className="relative col-span-2 sm:col-span-1 flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 p-4 bg-nb-paper border-t-nb sm:border-t-0 sm:border-l-3 sm:border-dashed sm:border-nb-ink">
        {/* Semicircle notches on desktop perforated line */}
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -top-3 -left-3 w-5 h-5 rounded-full bg-nb-paper border-nb border-nb-ink"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-3 -left-3 w-5 h-5 rounded-full bg-nb-paper border-nb border-nb-ink"
        />

        {/* Tag chips */}
        <div className="flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <Tag key={tag} tone={TAG_TONE[tag]}>
              {tag}
            </Tag>
          ))}
        </div>

        {/* Save button */}
        <button
          ref={saveBtnRef}
          type="button"
          onClick={handleSaveClick}
          aria-pressed={isSaved}
          className={`btn sm min-h-[40px] px-3.5 rounded-nb border-nb border-nb-ink font-bold text-sm tracking-normal whitespace-nowrap shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm ${
            isSaved
              ? "bg-nb-brand text-nb-ink"
              : "bg-nb-white text-nb-ink"
          }`}
        >
          {isSaved ? "Saved ✓" : "Save to my week"}
        </button>
      </div>
    </article>
  );
}
