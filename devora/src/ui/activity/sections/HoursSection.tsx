// My hours: the week grid every fit label on the page checks against.
// Tap a block, or press and drag across blocks with a mouse. Days flip to rows on phones.

import { forwardRef, useEffect, useRef } from "react";
import { Check, Eye, EyeOff, Users } from "lucide-react";

import { DAYS, SHARE_OPTIONS, TIME_BLOCKS, slotId, type ShareId, type SlotId } from "../config";
import type { Availability } from "../useAvailability";
import { SectionHeader } from "../primitives";
import { useMediaQuery } from "../useMediaQuery";
import { CountUp } from "../motion";

const SHARE_ICON: Record<ShareId, typeof Eye> = { "only-me": EyeOff, connections: Users, cecs: Eye };

type HoursSectionProps = {
  availability: Availability;
  fitCount: number;
  totalCount: number;
};

export const HoursSection = forwardRef<HTMLDivElement, HoursSectionProps>(({ availability, fitCount, totalCount }, gridRef) => {
  const { isFree, setSlot, freeCount, clear, reset, share, setShare, fitsOnly, setFitsOnly } = availability;
  const narrow = useMediaQuery("(max-width: 639px)");
  const paint = useRef<boolean | null>(null);
  const handledByPointer = useRef<string | null>(null);

  useEffect(() => {
    const stop = () => {
      paint.current = null;
      window.setTimeout(() => {
        handledByPointer.current = null;
      }, 0);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const onGridPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (paint.current === null || e.pointerType !== "mouse" || (e.buttons & 1) === 0) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const slot = target instanceof Element ? target.closest<HTMLElement>("[data-slot]")?.dataset.slot : undefined;
    if (slot) setSlot(slot as SlotId, paint.current);
  };

  const cell = (day: (typeof DAYS)[number], block: (typeof TIME_BLOCKS)[number]) => {
    const slot = slotId(day.id, block.id);
    const free = isFree(slot);
    return (
      <button
        key={slot}
        type="button"
        className={`nb-cell ${free ? "is-free" : ""}`}
        aria-pressed={free}
        aria-label={`${day.long} ${block.label.toLowerCase()}, ${block.range}`}
        data-slot={slot}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          const next = !free;
          paint.current = next;
          handledByPointer.current = slot;
          setSlot(slot, next);
        }}
        onClick={() => {
          if (handledByPointer.current === slot) {
            handledByPointer.current = null;
            return;
          }
          setSlot(slot, !isFree(slot));
        }}
      >
        <Check className="nb-cell-check" aria-hidden="true" />
      </button>
    );
  };

  const activeShare = SHARE_OPTIONS.find((o) => o.id === share) ?? SHARE_OPTIONS[0];

  return (
    <section className="nb-section" aria-labelledby="hours-title" id="hours">
      <SectionHeader id="hours-title" kicker="MY HOURS" title="When are you usually free?">
        Tap the blocks you are usually free, or drag across them. Every group and event below checks against these.
      </SectionHeader>

      <div className="nb-card nb-hours" data-reveal="">
        <fieldset className="nb-share">
          <legend className="nb-share-legend font-display">Who can see my hours</legend>
          <div className="nb-share-options" role="radiogroup" aria-label="Who can see my hours">
            {SHARE_OPTIONS.map((option) => {
              const Icon = SHARE_ICON[option.id];
              const on = option.id === share;
              return (
                <button key={option.id} type="button" role="radio" aria-checked={on} className={`nb-option ${on ? "is-on" : ""}`} onClick={() => setShare(option.id)}>
                  <Icon className="nb-option-icon" aria-hidden="true" />
                  <span className="font-display">{option.label}</span>
                </button>
              );
            })}
          </div>
          <p className="nb-share-hint" aria-live="polite">
            {activeShare.hint}
          </p>
        </fieldset>

        <div ref={gridRef} tabIndex={-1} className={`nb-grid ${narrow ? "is-narrow" : ""}`} role="group" aria-label="Weekly free hours" onPointerMove={onGridPointerMove}>
          {narrow ? (
            <>
              <span aria-hidden="true" />
              {TIME_BLOCKS.map((block) => (
                <span key={block.id} className="nb-grid-head" aria-hidden="true">
                  <span className="font-display">{block.label}</span>
                  <span className="nb-grid-range">{block.range}</span>
                </span>
              ))}
              {DAYS.map((day) => (
                <div key={day.id} className="nb-grid-row" role="group" aria-label={day.long}>
                  <span className="nb-grid-day font-display" aria-hidden="true">
                    {day.short}
                  </span>
                  {TIME_BLOCKS.map((block) => cell(day, block))}
                </div>
              ))}
            </>
          ) : (
            <>
              <span aria-hidden="true" />
              {DAYS.map((day) => (
                <span key={day.id} className="nb-grid-head font-display" aria-hidden="true">
                  {day.short}
                </span>
              ))}
              {TIME_BLOCKS.map((block) => (
                <div key={block.id} className="nb-grid-row" role="group" aria-label={block.label}>
                  <span className="nb-grid-block" aria-hidden="true">
                    <span className="font-display">{block.label}</span>
                    <span className="nb-grid-range">{block.range}</span>
                  </span>
                  {DAYS.map((day) => cell(day, block))}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="nb-hours-foot">
          <p className="nb-hours-count" aria-live="polite">
            <CountUp value={freeCount} className="nb-count font-display" />
            <span>
              {freeCount === 1 ? "block free" : "blocks free"}. {fitCount} of {totalCount} groups and events fit.
            </span>
          </p>
          <div className="nb-hours-controls">
            <label className="nb-switch-row">
              <span>Only show what fits</span>
              <button type="button" role="switch" aria-checked={fitsOnly} className={`nb-switch ${fitsOnly ? "is-on" : ""}`} onClick={() => setFitsOnly(!fitsOnly)}>
                <span className="nb-switch-thumb" />
              </button>
            </label>
            {freeCount > 0 ? (
              <button type="button" className="nb-text-btn" onClick={clear}>
                Clear all
              </button>
            ) : (
              <button type="button" className="nb-text-btn" onClick={reset}>
                Use sample hours
              </button>
            )}
          </div>
        </div>
        {freeCount === 0 ? (
          <p className="nb-empty-inline">No free blocks yet. Tap one to start, and the groups and events below will sort by what you can make.</p>
        ) : null}
        <p className="nb-hours-note">11 of 15 CECS students in our October survey commute, so this page starts with your time. In the mockup, hours stay on this device.</p>
      </div>
    </section>
  );
});

HoursSection.displayName = "HoursSection";
