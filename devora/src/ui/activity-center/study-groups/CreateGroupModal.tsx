// Create Study Group modal dialog.
// Neo-Brutalist Design Law styling:
// Centered modal (fits comfortably within 85vh, max-width 480px) with 3px ink borders and hard offset shadows.
// Lets students post a new study group for their course with meeting preference and coordination notes.

"use client";

import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X, BookOpen, MessageCircle, FileText, Check } from "lucide-react";

import type { MeetingPreference } from "@/types/activity-center";
import { useActivityCenter } from "../ActivityCenterContext";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

const PREFERENCES: Array<{ id: MeetingPreference; label: string }> = [
  { id: "async", label: "Async" },
  { id: "in-person", label: "In person" },
  { id: "both", label: "Both" },
];

const COMMON_COURSES = ["CIS 350", "CIS 200", "ECE 270", "ME 265", "MATH 115"];
const COORDINATION_PRESETS = ["Discord", "WhatsApp", "In Person — Library", "In Person — ELB"];

export default function CreateGroupModal() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLFormElement>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const {
    isCreateGroupModalOpen,
    closeCreateGroupModal,
    createGroup,
    courseFilter,
  } = useActivityCenter();

  // Form inputs
  const [course, setCourse] = useState(
    courseFilter !== "All" ? courseFilter : ""
  );
  const [topic, setTopic] = useState("");
  const [meetingPreference, setMeetingPreference] =
    useState<MeetingPreference>("both");
  const [coordinationMethod, setCoordinationMethod] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = useCallback(() => {
    setTopic("");
    setCoordinationMethod("");
    setDescription("");
  }, []);

  const handleClose = useCallback(() => {
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isReducedMotion && modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        y: 16,
        scale: 0.96,
        autoAlpha: 0,
        duration: 0.15,
        ease: "power2.in",
      });
      gsap.to(backdropRef.current, {
        autoAlpha: 0,
        duration: 0.15,
        onComplete: () => {
          closeCreateGroupModal();
          resetForm();
        },
      });
    } else {
      closeCreateGroupModal();
      resetForm();
    }
  }, [closeCreateGroupModal, resetForm]);

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
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreateGroupModalOpen, handleClose]);

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
            { y: 30, scale: 0.94, rotation: -1 },
            {
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.4,
              ease: "back.out(1.5)",
              clearProps: "transform",
            }
          );
        }
      });
    },
    { dependencies: [isCreateGroupModalOpen] }
  );

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

    handleClose();
  };

  if (!isCreateGroupModalOpen) return null;

  return (
    <div
      ref={backdropRef}
      id="backdrop"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-[4px] overflow-y-auto"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full max-w-[620px] my-auto max-h-[90vh] overflow-y-auto rounded-[12px] border-[2.5px] p-3.5 sm:p-4 flex flex-col gap-2.5 transition-colors ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#0d0914] border-white/40 shadow-[6px_6px_0px_#000000] text-white"
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b-2 border-[#0a0a0a] dark:border-white/20">
          <div className="flex items-center gap-2">
            <h2
              id="modal-title"
              className="m-0 font-display uppercase font-black text-lg sm:text-xl tracking-tight leading-none text-[#0a0a0a] dark:text-white"
            >
              New study group
            </h2>
            <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#0a0a0a]/30 dark:border-white/30 text-[#0a0a0a]/60 dark:text-neutral-400">
              Study Hub
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-7 h-7 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2-Column Compact Body */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Left Column: Course, Topic, Meeting Preference */}
          <div className="flex flex-col gap-2">
            {/* Field: Course */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="f-course"
                className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <BookOpen size={11} className="opacity-80" />
                <span>Course *</span>
              </label>
              <input
                id="f-course"
                required
                type="text"
                placeholder="e.g. CIS 350, ECE 270…"
                value={course}
                onChange={(e) => setCourse(e.target.value.toUpperCase())}
                className="w-full h-8 px-2.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-mono text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {COMMON_COURSES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCourse(c)}
                    className="h-4.5 px-1.5 rounded-[4px] border border-[#0a0a0a]/30 dark:border-white/30 bg-white dark:bg-[#160e22] text-[#0a0a0a] dark:text-neutral-300 font-mono text-[8.5px] font-bold hover:bg-neutral-100 dark:hover:bg-[#201532] cursor-pointer"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Topic */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="f-topic"
                className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <FileText size={11} className="opacity-80" />
                <span>Topic *</span>
              </label>
              <input
                ref={topicInputRef}
                id="f-topic"
                required
                placeholder="Exam 2 prep, lab help, problem sets…"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
              />
            </div>

            {/* Field: Meeting preference */}
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200">
                Meeting preference
              </span>
              <div
                className="flex gap-1.5 pt-0.5"
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
                      className={`flex-1 h-7 px-2 rounded-[6px] border-[1.5px] font-mono text-[10px] font-black tracking-[0.06em] uppercase transition-all duration-120 cursor-pointer inline-flex items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[1.5px_1.5px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white dark:shadow-[1.5px_1.5px_0px_#000000]"
                          : "bg-white dark:bg-[#181026] text-[#0a0a0a] dark:text-neutral-300 border-[#0a0a0a] dark:border-white/30 shadow-[1px_1px_0px_#0a0a0a] dark:shadow-[1px_1px_0px_#000000] hover:bg-neutral-100 dark:hover:bg-[#221636]"
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                      <span>{pref.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Coordinate via, Description */}
          <div className="flex flex-col gap-2">
            {/* Coordinate via */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="f-coord"
                className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <MessageCircle size={11} className="opacity-80" />
                <span>Coordinate via</span>
              </label>
              <input
                id="f-coord"
                placeholder="Discord, GroupMe, chat…"
                value={coordinationMethod}
                onChange={(e) => setCoordinationMethod(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {COORDINATION_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCoordinationMethod(m)}
                    className="h-4.5 px-1.5 rounded-[4px] border border-[#0a0a0a]/30 dark:border-white/30 bg-white dark:bg-[#160e22] text-[#0a0a0a] dark:text-neutral-300 font-mono text-[8.5px] font-bold hover:bg-neutral-100 dark:hover:bg-[#201532] cursor-pointer"
                  >
                    + {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="f-desc"
                className="font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                Description (Optional)
              </label>
              <textarea
                id="f-desc"
                rows={2}
                placeholder="What you'll work on and who it's for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded-[7px] h-[72px] min-h-[58px] max-h-[85px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t-2 border-[#0a0a0a] dark:border-white/20">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[32px] px-3.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/40 bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center min-h-[32px] px-4.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Create group</span>
          </button>
        </div>
      </form>
    </div>
  );
}
