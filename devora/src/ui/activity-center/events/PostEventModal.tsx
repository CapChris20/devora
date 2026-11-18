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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-[2px] overflow-y-auto"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className={`relative w-full max-w-[490px] my-auto max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-[12px] border-[3px] flex flex-col gap-3.5 text-left will-change-transform transition-all ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#140e22] border-2 border-white/30 shadow-[8px_8px_0px_#000000] text-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#0a0a0a] dark:border-white/20 pb-3">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase text-[#575757] dark:text-neutral-400">
              Activity Center
            </span>
            <h3
              id="post-event-title"
              className="m-0 font-display uppercase font-normal text-xl sm:text-2xl tracking-tight leading-tight text-[#0a0a0a] dark:text-white"
            >
              Post an Event
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_#0a0a0a] hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-2.5 bg-[#fda4af] border-2 border-[#0a0a0a] rounded-[8px] font-mono text-xs font-bold text-[#0a0a0a]">
            {errorMessage}
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="event-title"
            className="font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
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
            placeholder="e.g. Study & Boba Social, CIS 350 Midterm Review"
            className="w-full h-9.5 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-body text-xs sm:text-sm text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-400 focus:outline-none focus:border-[#fb923c] shadow-[1.5px_1.5px_0px_#0a0a0a]"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="event-desc"
            className="font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
          >
            Description *
          </label>
          <textarea
            id="event-desc"
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should attendees expect? Add details about class, agenda, or snacks."
            className="w-full p-2.5 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-body text-xs sm:text-sm text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-400 focus:outline-none focus:border-[#fb923c] shadow-[1.5px_1.5px_0px_#0a0a0a]"
          />
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-date"
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
            >
              <Calendar size={12} className="text-[#fb923c]" />
              <span>Date *</span>
            </label>
            <input
              id="event-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9.5 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-mono text-xs text-[#0a0a0a] dark:text-white focus:outline-none focus:border-[#fb923c] shadow-[1.5px_1.5px_0px_#0a0a0a]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-time"
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
            >
              <Clock size={12} className="text-[#fb923c]" />
              <span>Time</span>
            </label>
            <input
              id="event-time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 4:00–5:30 PM"
              className="w-full h-9.5 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-body text-xs sm:text-sm text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-400 focus:outline-none focus:border-[#fb923c] shadow-[1.5px_1.5px_0px_#0a0a0a]"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="event-location"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200"
          >
            <MapPin size={12} className="text-[#fb923c]" />
            <span>Location *</span>
          </label>
          <input
            id="event-location"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Engineering Lab Building Rm 1030, or Zoom link"
            className="w-full h-9.5 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-body text-xs sm:text-sm text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-400 focus:outline-none focus:border-[#fb923c] shadow-[1.5px_1.5px_0px_#0a0a0a]"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] dark:text-neutral-200">
            <Tag size={12} className="text-[#fb923c]" />
            <span>Tags (Select all that apply) *</span>
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1 min-h-[30px] px-3 rounded-full border-2 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[1.5px_1.5px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white"
                      : "bg-[#f2f2f0] dark:bg-[#1f1630] text-[#0a0a0a] dark:text-neutral-300 border-[#0a0a0a] dark:border-white/30 shadow-[1.5px_1.5px_0px_#0a0a0a] hover:bg-white"
                  }`}
                >
                  {isSelected && <span>✓</span>}
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Link */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="event-link"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-[#575757] dark:text-neutral-400"
          >
            <LinkIcon size={12} />
            <span>Optional Link</span>
          </label>
          <input
            id="event-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://... (Discord, Zoom, RSVP, or Form)"
            className="w-full h-9.5 px-3 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-[#faf8f5] dark:bg-[#1a1328] font-mono text-xs text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-400 focus:outline-none focus:border-[#fb923c] shadow-[1.5px_1.5px_0px_#0a0a0a]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t-2 border-[#0a0a0a] dark:border-white/20">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[38px] px-4 rounded-[8px] border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#1a1328] text-[#0a0a0a] dark:text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center min-h-[38px] px-5 rounded-[8px] border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? "Posting…" : "Post Event"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
