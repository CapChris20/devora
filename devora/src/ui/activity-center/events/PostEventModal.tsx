// Post Event modal dialog.
// Neo-Brutalist Design Law styling:
// Compact, centered modal (fits within 85vh, max-width 480px) with 3px ink borders and hard offset shadows.
// Allows authenticated students to submit a new event with title, description,
// date, time, location, tags, and an optional link.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import gsap from "gsap";
import { X, Calendar, Clock, MapPin, Link as LinkIcon, Tag } from "lucide-react";

import type { ActivityEventTag } from "@/types/activity-center";
import { useActivityCenter } from "../ActivityCenterContext";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

// ===== TAG OPTIONS =====

const AVAILABLE_TAGS: Array<{ id: ActivityEventTag; label: string }> = [
  { id: "academic", label: "Academic" },
  { id: "social", label: "Social" },
  { id: "workshop", label: "Workshop" },
  { id: "club", label: "Club" },
  { id: "hangout", label: "Hangout" },
];

export default function PostEventModal() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const { isPostEventModalOpen, closePostEventModal, postEvent } =
    useActivityCenter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<ActivityEventTag[]>([
    "academic",
  ]);
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setSelectedTags(["academic"]);
    setLink("");
    setErrorMessage(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (backdropRef.current && modalRef.current) {
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
            closePostEventModal();
            resetForm();
          },
        });
        return;
      }
      closePostEventModal();
      resetForm();
    });

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      closePostEventModal();
      resetForm();
    }
  }, [closePostEventModal, resetForm]);

  // Focus title input when opened
  useEffect(() => {
    if (isPostEventModalOpen) {
      setErrorMessage(null);
      setTimeout(() => titleInputRef.current?.focus(), 60);
    }
  }, [isPostEventModalOpen]);

  // Handle escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPostEventModalOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPostEventModalOpen, handleClose]);

  const toggleTag = (tagId: ActivityEventTag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please enter an event title.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please enter an event description.");
      return;
    }
    if (!date) {
      setErrorMessage("Please select a date for the event.");
      return;
    }
    if (!location.trim()) {
      setErrorMessage("Please enter a location or Zoom link.");
      return;
    }
    if (selectedTags.length === 0) {
      setErrorMessage("Please select at least one tag.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await postEvent({
        title: title.trim(),
        description: description.trim(),
        date,
        time: time.trim() || "TBA",
        location: location.trim(),
        tags: selectedTags,
        link: link.trim() || undefined,
      });
      handleClose();
    } catch (err: unknown) {
      console.error("Failed to post event:", err);
      const message =
        err instanceof Error ? err.message : "Failed to post event. Please try again.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  if (!isPostEventModalOpen) return null;

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-event-title"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-[4px] overflow-y-auto"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className={`relative w-full max-w-[620px] my-auto max-h-[90vh] overflow-y-auto rounded-[12px] border-[2.5px] p-3.5 sm:p-4 flex flex-col gap-2.5 text-left will-change-transform transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#0d0914] border-white/40 shadow-[6px_6px_0px_#000000] text-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#0a0a0a] dark:border-white/20 pb-2">
          <div className="flex items-center gap-2">
            <h3
              id="post-event-title"
              className="m-0 font-display uppercase font-black text-lg sm:text-xl tracking-tight leading-none text-[#0a0a0a] dark:text-white"
            >
              Post an Event
            </h3>
            <span className="font-mono text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border border-[#0a0a0a]/30 dark:border-white/30 text-[#0a0a0a]/60 dark:text-neutral-400">
              Activity Center
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="w-7 h-7 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-1.5 px-2 bg-[#fda4af] border-2 border-[#0a0a0a] rounded-[7px] font-mono text-[10.5px] font-bold text-[#0a0a0a] shadow-[1.5px_1.5px_0px_#0a0a0a]">
            {errorMessage}
          </div>
        )}

        {/* 2-Column Compact Body */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Left Column: Title, Description, Tags */}
          <div className="flex flex-col gap-2">
            {/* Title */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="event-title"
                className="font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                Title *
              </label>
              <input
                ref={titleInputRef}
                id="event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Study & Boba Social"
                className="w-full h-8 px-2.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="event-desc"
                className="font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                Description *
              </label>
              <textarea
                id="event-desc"
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should attendees expect? Agenda, details, etc."
                className="w-full p-2 rounded-[7px] h-[52px] min-h-[52px] max-h-[70px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000] resize-none"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200">
                <Tag size={11} className="opacity-80" />
                <span>Tags *</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      aria-pressed={isSelected}
                      className={`inline-flex items-center gap-1 h-6 px-2 rounded-[6px] border-[1.5px] font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[1.5px_1.5px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white dark:shadow-[1.5px_1.5px_0px_#000000]"
                          : "bg-white dark:bg-[#181026] text-[#0a0a0a] dark:text-neutral-300 border-[#0a0a0a] dark:border-white/30 shadow-[1px_1px_0px_#0a0a0a] dark:shadow-[1px_1px_0px_#000000] hover:bg-neutral-100 dark:hover:bg-[#221636]"
                      }`}
                    >
                      {isSelected && <span>✓</span>}
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Date & Time, Location, Optional Link */}
          <div className="flex flex-col gap-2">
            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <label
                  htmlFor="event-date"
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
                >
                  <Calendar size={11} className="opacity-80" />
                  <span>Date *</span>
                </label>
                <input
                  id="event-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-8 px-2 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-mono text-[11px] text-[#0a0a0a] dark:text-white focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label
                  htmlFor="event-time"
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
                >
                  <Clock size={11} className="opacity-80" />
                  <span>Time</span>
                </label>
                <input
                  id="event-time"
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 4:00 PM"
                  className="w-full h-8 px-2 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="event-location"
                className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
              >
                <MapPin size={11} className="opacity-80" />
                <span>Location *</span>
              </label>
              <input
                id="event-location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room 1030 or Zoom link"
                className="w-full h-8 px-2.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-body text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
              />
            </div>

            {/* Optional Link */}
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="event-link"
                className="inline-flex items-center gap-1 font-mono text-[10.5px] font-black tracking-[0.08em] uppercase text-[#0a0a0a]/70 dark:text-neutral-400"
              >
                <LinkIcon size={11} />
                <span>Optional Link</span>
              </label>
              <input
                id="event-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://... (Discord, RSVP, Form)"
                className="w-full h-8 px-2.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#120a1f] font-mono text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white shadow-[1.5px_1.5px_0px_#0a0a0a] dark:shadow-[1.5px_1.5px_0px_#000000]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            disabled={isSubmitting}
            className="inline-flex items-center justify-center min-h-[32px] px-4.5 rounded-[7px] border-2 border-[#0a0a0a] dark:border-white bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] dark:shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? "Posting…" : "Post Event"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
