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
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-[5px] overflow-y-auto"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-[94vw] max-w-[860px] max-h-[92vh] overflow-y-auto rounded-[14px] border-[3px] p-4 sm:p-5 flex flex-col gap-3 text-left transition-colors shadow-[8px_8px_0px_#0a0a0a] ${
          isLight
            ? "bg-white border-[#0a0a0a] text-[#0a0a0a]"
            : "bg-[#0d0914] border-white/40 shadow-[8px_8px_0px_#000000] text-white"
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b-2 border-[#0a0a0a] dark:border-white/20">
          <div className="flex items-center gap-2.5">
            <h2
              id="modal-title"
              className="m-0 font-display uppercase font-black text-lg sm:text-xl tracking-tight leading-none text-[#0a0a0a] dark:text-white"
            >
              New study group
            </h2>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#0a0a0a] dark:border-white/40 bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a]">
              Campus Hub // Group Maker
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white flex items-center justify-center font-black shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2-Column Wide Landscape Layout (Smaller Height, Bigger Width) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
          {/* Left Column: Course & Topic */}
          <div className="flex flex-col gap-2.5">
            {/* Field: Course */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="f-course"
                className="inline-flex items-center gap-1 font-mono text-[11px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <BookOpen size={12} className="opacity-80" />
                <span>Course *</span>
              </label>
              <input
                id="f-course"
                required
                type="text"
                placeholder="e.g. CIS 350, ECE 270, MATH 115"
                value={course}
                onChange={(e) => setCourse(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-mono text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#fb923c] shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000]"
              />
              {/* Quick course presets */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">Common:</span>
                {COMMON_COURSES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCourse(c)}
                    className="min-h-[22px] px-2 rounded-[5px] border border-[#0a0a0a]/30 dark:border-white/30 bg-[#f4f4f5] dark:bg-[#1a1226] text-[#0a0a0a] dark:text-neutral-300 font-mono text-[9.5px] font-bold hover:bg-neutral-200 dark:hover:bg-[#251a36] cursor-pointer transition-colors"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Topic */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="f-topic"
                className="inline-flex items-center gap-1 font-mono text-[11px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <FileText size={12} className="opacity-80" />
                <span>Topic *</span>
              </label>
              <input
                ref={topicInputRef}
                id="f-topic"
                required
                placeholder="e.g. Exam 2 review, homework sets, project"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-9 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#fb923c] shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000]"
              />
            </div>

            {/* Field: Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="f-desc"
                className="font-mono text-[11px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                Description (Optional)
              </label>
              <textarea
                id="f-desc"
                rows={2}
                placeholder="What you'll work on, meeting times, or who it's for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded-[8px] h-[58px] min-h-[52px] max-h-[80px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#fb923c] shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] resize-none"
              />
            </div>
          </div>

          {/* Right Column: Meeting Preference & Coordination */}
          <div className="flex flex-col gap-2.5">
            {/* Field: Meeting preference */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200">
                Meeting preference *
              </span>
              <div
                className="flex gap-2 pt-0.5"
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
                      className={`flex-1 min-h-[34px] px-2.5 rounded-[7px] border-2 font-mono text-[11px] font-black tracking-wider uppercase transition-all duration-120 cursor-pointer inline-flex items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white dark:shadow-[2px_2px_0px_#000000]"
                          : "bg-white dark:bg-[#181026] text-[#0a0a0a] dark:text-neutral-300 border-[#0a0a0a]/40 dark:border-white/30 shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-neutral-100 dark:hover:bg-[#221636]"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                      <span>{pref.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field: Coordinate via */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="f-coord"
                className="inline-flex items-center gap-1 font-mono text-[11px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <MessageCircle size={12} className="opacity-80" />
                <span>Coordinate via</span>
              </label>
              <input
                id="f-coord"
                placeholder="e.g. Discord, WhatsApp, In Person — Library"
                value={coordinationMethod}
                onChange={(e) => setCoordinationMethod(e.target.value)}
                className="w-full h-9 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#fb923c] shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000]"
              />
              {/* Quick coordination presets */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">Presets:</span>
                {COORDINATION_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCoordinationMethod(m)}
                    className="min-h-[22px] px-2 rounded-[5px] border border-[#0a0a0a]/30 dark:border-white/30 bg-[#f4f4f5] dark:bg-[#1a1226] text-[#0a0a0a] dark:text-neutral-300 font-mono text-[9.5px] font-bold hover:bg-neutral-200 dark:hover:bg-[#251a36] cursor-pointer transition-colors"
                  >
                    + {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t-2 border-[#0a0a0a] dark:border-white/20">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[42px] px-5 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/40 bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white font-mono text-xs font-black uppercase tracking-wider shadow-[2.5px_2.5px_0px_#0a0a0a] dark:shadow-[2.5px_2.5px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center min-h-[42px] px-7 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] font-mono text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3.5px_3.5px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Create group</span>
          </button>
        </div>
      </form>
    </div>
  );
}
