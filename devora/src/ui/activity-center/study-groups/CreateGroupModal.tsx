// Create Study Group modal dialog.
// Lets students post a new study group for their course with meeting preference and coordination notes.
// Animates in with GSAP scale and back.out easing, respecting reduced motion settings.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import type { MeetingPreference } from "@/types/activity-center";

import { useActivityCenter } from "../ActivityCenterContext";
import { AVAILABLE_COURSES } from "../placeholder-data";

// ===== PREFERENCE SEGMENTS =====

const PREFERENCES: Array<{ id: MeetingPreference; label: string }> = [
  { id: "async", label: "Async" },
  { id: "in-person", label: "In person" },
  { id: "both", label: "Both" },
];

// ===== MAIN COMPONENT =====

export default function CreateGroupModal() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLFormElement>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);

  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
    courseFilter,
  } = useActivityCenter();

  // Form inputs
  const [course, setCourse] = useState(
    courseFilter !== "All" ? courseFilter : AVAILABLE_COURSES[0]
  );
  const [topic, setTopic] = useState("");
  const [meetingPreference, setMeetingPreference] =
    useState<MeetingPreference>("both");
  const [coordinationMethod, setCoordinationMethod] = useState("");
  const [description, setDescription] = useState("");

  // Sync course selection with filter when opening
  useEffect(() => {
    if (isCreateGroupModalOpen) {
      if (courseFilter !== "All") setCourse(courseFilter);
      setTimeout(() => topicInputRef.current?.focus(), 60);
    }
  }, [isCreateGroupModalOpen, courseFilter]);

  // Handle escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCreateGroupModalOpen) {
        closeCreateGroupModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreateGroupModalOpen, closeCreateGroupModal]);

  // Entrance GSAP animation
  useGSAP(
    () => {
      if (!isCreateGroupModalOpen) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (backdropRef.current && modalRef.current) {
          gsap.fromTo(
            backdropRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.2 }
          );
          gsap.fromTo(
            modalRef.current,
            { y: 40, scale: 0.92, rotation: -2 },
            {
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.5,
              ease: "back.out(1.6)",
              clearProps: "transform",
            }
          );
        }
      });
    },
    { dependencies: [isCreateGroupModalOpen] }
  );

  const handleClose = () => {
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isReducedMotion && modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        y: 30,
        scale: 0.95,
        duration: 0.18,
        ease: "power2.in",
      });
      gsap.to(backdropRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        onComplete: closeCreateGroupModal,
      });
    } else {
      closeCreateGroupModal();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      topicInputRef.current?.focus();
      return;
    }

    createGroup({
      course,
      topic,
      meetingPreference,
      coordinationMethod,
      description,
    });

    // Reset fields
    setTopic("");
    setCoordinationMethod("");
    setDescription("");
  };

  if (!isCreateGroupModalOpen) return null;

  return (
    <div
      ref={backdropRef}
      id="backdrop"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-nb-ink/45"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[540px] max-h-full overflow-y-auto p-5 sm:p-6 flex flex-col gap-3.5 bg-nb-white border-nb border-nb-ink rounded-xl shadow-nb-modal text-nb-ink"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <h2
            id="modal-title"
            className="font-nb-display font-normal uppercase text-[26px] leading-none text-nb-ink m-0"
          >
            New study group
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-[42px] h-[42px] grid place-items-center rounded-nb border-nb border-nb-ink bg-nb-white shadow-nb-sm transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Field: Course */}
        <label className="flex flex-col gap-1.5" htmlFor="f-course">
          <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
            Course
          </span>
          <select
            id="f-course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="min-h-[46px] px-3 py-2.5 rounded-nb border-nb border-nb-ink bg-nb-white text-[15px] outline-none focus:shadow-nb-sm"
          >
            {AVAILABLE_COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* Field: Topic */}
        <label className="flex flex-col gap-1.5" htmlFor="f-topic">
          <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
            Topic
          </span>
          <input
            ref={topicInputRef}
            id="f-topic"
            required
            placeholder="Exam 2 prep, lab help, weekly problem sets…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[46px] px-3 py-2.5 rounded-nb border-nb border-nb-ink bg-nb-white text-[15px] outline-none focus:shadow-nb-sm"
          />
        </label>

        {/* Field: Meeting preference */}
        <div className="flex flex-col gap-1.5">
          <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
            Meeting preference
          </span>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Meeting preference"
          >
            {PREFERENCES.map((pref) => {
              const isSelected = meetingPreference === pref.id;
              return (
                <button
                  key={pref.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setMeetingPreference(pref.id)}
                  className={`flex-1 min-h-[38px] px-4 rounded-full border-2 border-nb-ink font-nb-mono text-xs font-bold tracking-[0.08em] uppercase transition-all duration-120 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-sm active:translate-x-px active:translate-y-px ${
                    isSelected
                      ? "bg-nb-ink text-nb-white"
                      : "bg-nb-white text-nb-ink"
                  }`}
                >
                  {pref.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field: Coordination method */}
        <label className="flex flex-col gap-1.5" htmlFor="f-coord">
          <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
            How you&apos;ll coordinate
          </span>
          <input
            id="f-coord"
            placeholder="Discord server, GroupMe, group chat…"
            value={coordinationMethod}
            onChange={(e) => setCoordinationMethod(e.target.value)}
            className="min-h-[46px] px-3 py-2.5 rounded-nb border-nb border-nb-ink bg-nb-white text-[15px] outline-none focus:shadow-nb-sm"
          />
        </label>

        {/* Field: Description */}
        <label className="flex flex-col gap-1.5" htmlFor="f-desc">
          <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
            Description
          </span>
          <textarea
            id="f-desc"
            rows={3}
            placeholder="What you'll work on and who it's for"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 rounded-nb border-nb border-nb-ink bg-nb-white text-[15px] outline-none resize-y focus:shadow-nb-sm"
          />
        </label>

        {/* Modal Actions */}
        <div className="flex justify-end flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="btn ghost min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-white text-nb-ink font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-ink text-nb-white font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
          >
            Create group
          </button>
        </div>
      </form>
    </div>
  );
}
