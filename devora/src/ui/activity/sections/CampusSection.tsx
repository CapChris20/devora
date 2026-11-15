// Campus: CECS events sorted by time fit, plus link-outs for tutoring and the full calendar.
// No HelloRubric integration; it is a plain link until that is approved.

import { useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, Check, Clock, GraduationCap, MapPin, Users } from "lucide-react";

import { LINKS } from "../config";
import type { Availability } from "../useAvailability";
import { FIT_ORDER } from "../useAvailability";
import type { CampusEvent } from "../sample-data";
import { ASCII_WEEK, Ascii, FitChip, SectionHeader } from "../primitives";
import { useFlipList } from "../motion";
import { Modal } from "../Modal";

type CampusSectionProps = {
  availability: Availability;
  events: CampusEvent[];
};

const fitSentence = (fit: string) => {
  if (fit === "fits") return "This is during one of your free blocks.";
  if (fit === "online") return "This is not in your hours, but there is a video call option.";
  if (fit === "after") return "This is in the evening, after most classes. It is not in your hours yet.";
  return "This is outside your free hours. Add the block if you want to make it.";
};

export const CampusSection = ({ availability, events }: CampusSectionProps) => {
  const { getFit, passesFilter, setFitsOnly } = availability;
  const [going, setGoing] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const visible = events.filter(passesFilter).sort((a, b) => FIT_ORDER[getFit(a)] - FIT_ORDER[getFit(b)]);
  const hidden = events.length - visible.length;
  useFlipList(listRef, visible.map((e) => e.id).join("|"));

  const toggle = (id: string) =>
    setGoing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rsvpButton = (event: CampusEvent, size: "sm" | "md" = "sm") =>
    going.has(event.id) ? (
      <button type="button" className={`nb-btn nb-btn-quiet ${size === "sm" ? "nb-btn-sm" : ""}`} aria-pressed="true" onClick={() => toggle(event.id)} aria-label={`Going to ${event.title}. Undo`}>
        <Check className="h-4 w-4" aria-hidden="true" />
        Going
      </button>
    ) : (
      <button type="button" className={`nb-btn ${size === "sm" ? "nb-btn-sm" : "nb-btn-primary"}`} onClick={() => toggle(event.id)} aria-label={`RSVP to ${event.title}`}>
        RSVP
      </button>
    );

  const open = events.find((e) => e.id === openId);

  return (
    <section className="nb-section" aria-labelledby="campus-title" id="campus">
      <SectionHeader id="campus-title" kicker="CAMPUS" title="CECS events that fit your week" sample>
        Events are sorted by fit first, so the ones you can make between or after class come up top.
      </SectionHeader>

      <div className="nb-campus-grid">
        <ul ref={listRef} className="nb-events">
          {visible.map((event) => (
            <li key={event.id} data-flip-id={event.id} className="nb-card nb-card-lift nb-event" data-reveal="">
              <div className="nb-event-date" aria-hidden="true">
                <span className="nb-event-dow font-mono">{event.date.slice(0, 3).toUpperCase()}</span>
                <span className="nb-event-day font-display">{event.date.split(" ").pop()}</span>
              </div>
              <div className="nb-event-body">
                <FitChip fit={getFit(event)} />
                <h3 className="nb-event-title font-display">
                  <button type="button" className="nb-card-link" onClick={() => setOpenId(event.id)}>
                    {event.title}
                    <ArrowUpRight className="nb-card-link-icon" aria-hidden="true" />
                  </button>
                </h3>
                <p className="nb-meta">
                  {event.date}, {event.time}. {event.where}
                </p>
                <p className="nb-meta nb-faint">
                  {event.host}. {event.posted}.
                </p>
              </div>
              <div className="nb-event-action">
                <span className="nb-tag">{event.tag}</span>
                {rsvpButton(event)}
              </div>
            </li>
          ))}
          {visible.length === 0 ? (
            <li className="nb-card nb-empty">
              <p className="nb-empty-title">No events fit your hours this week.</p>
              <p>This list is for CECS events you can actually make. Show every event to see what is coming up.</p>
              <div className="nb-empty-actions">
                <button type="button" className="nb-btn nb-btn-primary" onClick={() => setFitsOnly(false)}>
                  Show all events
                </button>
              </div>
            </li>
          ) : null}
        </ul>
        <div className="nb-links">
          <a className="nb-card nb-card-lift nb-link-card" href={LINKS.tutoring.href} target="_blank" rel="noreferrer" data-reveal="">
            <span className="nb-link-top">
              <span className="nb-icon-disc" aria-hidden="true">
                <GraduationCap className="h-5 w-5" />
              </span>
              <ArrowUpRight className="nb-link-arrow" aria-hidden="true" />
            </span>
            <span className="nb-card-title font-display">Free tutoring at the {LINKS.tutoring.label}</span>
            <span className="nb-muted">Drop-in help for CECS courses, exam prep, and study sessions. Opens the ELC page.</span>
            <Ascii art={ASCII_WEEK} className="nb-ascii-week" />
          </a>
          <a className="nb-card nb-card-lift nb-link-card" href={LINKS.calendar.href} target="_blank" rel="noreferrer" data-reveal="">
            <span className="nb-link-top">
              <span className="nb-icon-disc" aria-hidden="true">
                <CalendarDays className="h-5 w-5" />
              </span>
              <ArrowUpRight className="nb-link-arrow" aria-hidden="true" />
            </span>
            <span className="nb-card-title font-display">Full CECS calendar on {LINKS.calendar.label}</span>
            <span className="nb-muted">Every club and college event, including ones Devora does not list yet. Opens {LINKS.calendar.label}.</span>
          </a>
        </div>
      </div>
      {hidden > 0 ? (
        <p className="nb-footnote">
          {hidden} {hidden === 1 ? "event is" : "events are"} hidden by your filter.{" "}
          <button type="button" className="nb-text-btn nb-text-inline" onClick={() => setFitsOnly(false)}>
            Show all
          </button>
        </p>
      ) : null}

      <Modal
        open={Boolean(open)}
        onOpenChange={(o) => !o && setOpenId(null)}
        kicker={open ? `${open.tag.toUpperCase()} / ${open.host.toUpperCase()}` : undefined}
        title={open?.title ?? ""}
        description={open?.about}
        footer={open ? rsvpButton(open, "md") : null}
      >
        {open ? (
          <div className="nb-modal-grid">
            <div className="nb-modal-block">
              <p className="nb-modal-label">When and where</p>
              <ul className="nb-facts">
                <li>
                  <Clock className="nb-fact-icon" aria-hidden="true" />
                  {open.date}, {open.time}
                </li>
                <li>
                  <MapPin className="nb-fact-icon" aria-hidden="true" />
                  {open.where}
                </li>
                <li>
                  <Users className="nb-fact-icon" aria-hidden="true" />
                  Hosted by {open.host}. {open.posted}.
                </li>
              </ul>
            </div>
            <div className="nb-modal-block">
              <p className="nb-modal-label">How it fits your week</p>
              <FitChip fit={getFit(open)} />
              <p className="nb-modal-text">{fitSentence(getFit(open))}</p>
              <a className="nb-text-btn nb-text-inline" href={LINKS.calendar.href} target="_blank" rel="noreferrer">
                See it on the full calendar
              </a>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};
