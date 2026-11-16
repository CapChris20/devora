// Post Event modal dialog.
// Allows authenticated students to submit a new event with title, description,
// date, time, location, tags, and an optional link.
// Writes directly to /events/{eventId} in Firestore with createdBy: uid and createdAt: serverTimestamp.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import type { ActivityEventTag } from "@/types/activity-center";

import { useActivityCenter } from "../ActivityCenterContext";

// ===== TAG OPTIONS =====

const AVAILABLE_TAGS: Array<{ id: ActivityEventTag; label: string }> = [
  { id: "academic", label: "Academic" },
  { id: "social", label: "Social" },
  { id: "workshop", label: "Workshop" },
  { id: "club", label: "Club" },
  { id: "hangout", label: "Hangout" },
];

// ===== MAIN COMPONENT =====

export default function PostEventModal() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

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
        closePostEventModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPostEventModalOpen, closePostEventModal]);

  // Entrance GSAP animation
  useGSAP(
    () => {
      if (!isPostEventModalOpen) return;

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
            { y: 40, scale: 0.92, rotation: -1.5 },
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
    { dependencies: [isPostEventModalOpen] }
  );

  const handleClose = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (backdropRef.current && modalRef.current) {
        gsap.to(modalRef.current, {
          y: 20,
          scale: 0.96,
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
        });
        gsap.to(backdropRef.current, {
          autoAlpha: 0,
          duration: 0.2,
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
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setSelectedTags(["academic"]);
    setLink("");
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const toggleTag = (tagId: ActivityEventTag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        if (prev.length === 1) return prev; // Keep at least one tag
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nb-ink/65 overflow-y-auto"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className="relative w-full max-w-[560px] my-8 p-6 sm:p-7 bg-nb-paper border-nb border-nb-ink rounded-nb shadow-nb-card flex flex-col gap-5 text-left text-nb-ink will-change-transform"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b-nb border-nb-ink pb-4">
          <div>
            <span className="font-nb-mono text-[11px] font-bold tracking-[0.16em] uppercase text-nb-muted">
              Student Event
            </span>
            <h3
              id="post-event-title"
              className="m-0 text-2xl font-bold tracking-tight text-nb-ink"
            >
              Post an Event
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="w-9 h-9 grid place-items-center rounded-full border-2 border-nb-ink bg-nb-white font-bold text-base transition-transform duration-100 hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-3 bg-nb-blush border-2 border-nb-ink rounded-nb text-xs font-bold text-nb-ink">
            {errorMessage}
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="event-title"
            className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink"
          >
            Title <span className="text-nb-brand">*</span>
          </label>
          <input
            ref={titleInputRef}
            id="event-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Study & Boba Social, CIS 350 Midterm Review"
            className="w-full h-11 px-3.5 rounded-nb border-2 border-nb-ink bg-nb-white font-medium text-sm text-nb-ink placeholder:text-nb-muted focus:outline-none focus:ring-2 focus:ring-nb-brand"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="event-desc"
            className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink"
          >
            Description <span className="text-nb-brand">*</span>
          </label>
          <textarea
            id="event-desc"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should attendees expect or bring? Add details about class, agenda, or snacks."
            className="w-full p-3 rounded-nb border-2 border-nb-ink bg-nb-white font-medium text-sm text-nb-ink placeholder:text-nb-muted resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-nb-brand"
          />
        </div>

        {/* Date and Time row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="event-date"
              className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink"
            >
              Date <span className="text-nb-brand">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-nb border-2 border-nb-ink bg-nb-white font-medium text-sm text-nb-ink focus:outline-none focus:ring-2 focus:ring-nb-brand"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="event-time"
              className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink"
            >
              Time
            </label>
            <input
              id="event-time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 4:00–5:30 PM"
              className="w-full h-11 px-3.5 rounded-nb border-2 border-nb-ink bg-nb-white font-medium text-sm text-nb-ink placeholder:text-nb-muted focus:outline-none focus:ring-2 focus:ring-nb-brand"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="event-location"
            className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink"
          >
            Location <span className="text-nb-brand">*</span>
          </label>
          <input
            id="event-location"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Engineering Lab Building Rm 1030, or Zoom link"
            className="w-full h-11 px-3.5 rounded-nb border-2 border-nb-ink bg-nb-white font-medium text-sm text-nb-ink placeholder:text-nb-muted focus:outline-none focus:ring-2 focus:ring-nb-brand"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink">
            Tags (select all that apply) <span className="text-nb-brand">*</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[36px] px-3.5 rounded-full border-2 border-nb-ink font-nb-mono text-xs font-bold tracking-[0.08em] uppercase transition-all duration-120 ${
                    isSelected
                      ? "bg-nb-ink text-nb-white shadow-nb-sm -translate-y-0.5"
                      : "bg-nb-white text-nb-ink hover:-translate-y-0.5"
                  }`}
                >
                  {isSelected ? `✓ ${tag.label}` : tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Link */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="event-link"
            className="font-nb-mono text-xs font-bold tracking-[0.08em] uppercase text-nb-ink"
          >
            Optional Link
          </label>
          <input
            id="event-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://... (Discord, Zoom, RSVP, or Form)"
            className="w-full h-11 px-3.5 rounded-nb border-2 border-nb-ink bg-nb-white font-medium text-sm text-nb-ink placeholder:text-nb-muted focus:outline-none focus:ring-2 focus:ring-nb-brand"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-nb border-nb-ink">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn min-h-[44px] px-5 rounded-nb border-nb border-nb-ink bg-nb-white text-nb-ink font-bold text-sm tracking-normal shadow-nb hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn primary min-h-[44px] px-6 rounded-nb border-nb border-nb-ink bg-nb-brand text-[#0A0A0A] font-bold text-sm tracking-normal shadow-nb hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-lg active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

