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
      className="card lift bg-nb-white dark:bg-[#120a1f] border-nb border-nb-ink dark:border-white/30 rounded-[12px] shadow-nb-card transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[105px_minmax(0,1fr)_240px] overflow-hidden"
    >
      {/* Date block */}
      <div
        className={`flex flex-col items-center justify-center gap-1 p-3.5 sm:py-6 sm:px-3 border-r-nb border-nb-ink ${dateTone}`}
      >
        <span className="font-mono text-xs font-black tracking-[0.16em] uppercase text-[#0A0A0A]">
          {event.mon}
        </span>
        <span className="font-display font-black text-[34px] sm:text-[44px] leading-none text-[#0A0A0A] my-0.5">
          {event.day}
        </span>
        <span className="font-mono text-[11px] font-black tracking-[0.14em] uppercase text-[#0A0A0A]/90">
          {event.dow}
        </span>
      </div>

      {/* Main details */}
      <div className="min-w-0 p-5 sm:p-6 flex flex-col justify-center gap-2.5">
        <h4 className="m-0 text-lg sm:text-[20px] font-display font-black leading-snug tracking-tight text-nb-ink dark:text-white">
          {event.title}
        </h4>
        <p className="m-0 text-sm sm:text-[14.5px] font-body text-nb-ink/80 dark:text-neutral-300 leading-relaxed max-w-[70ch]">
          {event.description}
        </p>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1 text-xs sm:text-[13px] font-mono font-bold text-nb-ink/90 dark:text-neutral-200">
          <span className="inline-flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#fb923c] shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>{event.time}</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#fb923c] shrink-0"
            >
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{event.location}</span>
          </span>

          <span className="inline-flex items-center gap-1.5" title="Host Organization">
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#fb923c] shrink-0"
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
              className="inline-flex items-center gap-1.5 underline underline-offset-2 decoration-2 hover:text-[#fb923c] transition-colors"
            >
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
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
      <div className="relative col-span-2 sm:col-span-1 flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 p-3.5 sm:p-4.5 bg-nb-paper dark:bg-[#181026] border-t-nb sm:border-t-0 sm:border-l-3 sm:border-dashed sm:border-nb-ink dark:sm:border-white/20">
        {/* Semicircle notches on desktop perforated line */}
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -top-3 -left-3 w-5 h-5 rounded-full bg-nb-paper dark:bg-[#120a1f] border-nb border-nb-ink dark:border-white/30"
        />
        <span
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-3 -left-3 w-5 h-5 rounded-full bg-nb-paper dark:bg-[#120a1f] border-nb border-nb-ink dark:border-white/30"
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
          className={`w-full min-h-[44px] px-3.5 py-2 rounded-[9px] border-[2.5px] font-body text-xs sm:text-[13px] font-extrabold whitespace-nowrap transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 ${
            isSaved
              ? "bg-[#10b981] text-white border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
              : "bg-white dark:bg-[#1f1530] text-nb-ink dark:text-white border-nb-ink dark:border-white shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000]"
          }`}
        >
          {isSaved ? "Saved to week ✓" : "+ Save to my week"}
        </button>
      </div>
    </article>
  );
}
