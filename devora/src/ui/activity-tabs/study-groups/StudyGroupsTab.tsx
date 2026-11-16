// Study Groups tab (/activity/study-groups): browse, filter by course, join, or create a group.
// Flow: placeholder groups → course filter chips → card grid (cascades in). "New group" opens a stub form.
// TODO(firestore): groups live at /studyGroups/{groupId} — swap PLACEHOLDER_STUDY_GROUPS for a
//   query (where courseCode == selected) and make Join / Create write to that collection.

"use client";

// ===== IMPORTS =====

import { useState, type FormEvent } from "react";

import type { StudyGroup } from "@/types/activity";
import {
  NB_FOCUS,
  NB_TONE_CYCLE,
  NbButton,
  NbCard,
  SectionHeader,
  TagPill,
  staggerStyle,
} from "@/ui/shared/design-law/nb-parts";

import { PLACEHOLDER_COURSES } from "../placeholder-data";

// ===== NAMED CONSTANTS =====

const ALL_COURSES = "All";

const MODE_LABEL: Record<StudyGroup["meetingMode"], string> = {
  "in-person": "In person",
  online: "Online",
  hybrid: "Hybrid",
};

const FIELD_CLASS = `w-full rounded-nb border-nb border-nb-ink bg-nb-white px-3 py-2.5 text-[15px] text-nb-ink placeholder:text-nb-muted/70 transition-shadow focus:shadow-nb-sm focus:outline-none`;
const LABEL_CLASS = "flex flex-col gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted";

// ===== HELPER COMPONENTS =====

/**
 * One study group card: course tag, name, description, seats bar, schedule, Join button.
 * @param props.isMember - true once the signed-in student has joined (placeholder: local state)
 */
function StudyGroupCard({
  group,
  index,
  isMember,
  onToggleJoin,
}: {
  group: StudyGroup;
  index: number;
  isMember: boolean;
  onToggleJoin: () => void;
}) {
  const memberCount = group.memberIds.length + (isMember ? 1 : 0);
  const isFull = memberCount >= group.maxMembers && !isMember;
  // Seats bar width as a percentage (0–100)
  const fillPercent = Math.min(100, Math.round((memberCount / group.maxMembers) * 100));

  return (
    <NbCard interactive style={staggerStyle(index)} className="flex flex-col gap-4 p-5 motion-safe:animate-nb-rise">
      <div className="flex flex-wrap items-center gap-2">
        <TagPill tone={NB_TONE_CYCLE[index % NB_TONE_CYCLE.length]}>{group.courseCode}</TagPill>
        <TagPill tone="white">{MODE_LABEL[group.meetingMode]}</TagPill>
      </div>

      <div>
        <h3 className="text-xl font-bold leading-tight tracking-[-0.01em]">{group.name}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-nb-muted">{group.description}</p>
      </div>

      <dl className="mt-auto space-y-3 border-t-2 border-nb-ink pt-4 text-sm">
        <div>
          <div className="flex items-baseline justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Seats</dt>
            {/* vocab: tabular-nums = digits all the same width so "3 / 6" doesn't wobble */}
            <dd className="font-semibold tabular-nums">
              {memberCount} / {group.maxMembers}
            </dd>
          </div>
          {/* Seats bar: gradient fill grows with membership */}
          <div aria-hidden="true" className="mt-2 h-3 overflow-hidden rounded-full border-2 border-nb-ink bg-nb-soft">
            <div
              className="h-full border-r-2 border-nb-ink bg-nb-brand motion-safe:transition-[width] motion-safe:duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Meets</dt>
          <dd className="text-right font-semibold">{group.meetingSchedule}</dd>
        </div>
      </dl>

      {/* TODO(firestore): add/remove my uid in /studyGroups/{groupId}.memberIds (arrayUnion / arrayRemove) */}
      <NbButton tone={isMember ? "white" : "ink"} onClick={onToggleJoin} disabled={isFull}>
        {isMember ? "Joined ✓  ·  Leave" : isFull ? "Group full" : "Join group"}
      </NbButton>
    </NbCard>
  );
}

/**
 * Stub "new group" form. Collects the fields, but submitting does nothing yet.
 */
function CreateGroupForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // vocab: preventDefault = stop the browser's default full-page form submit
    event.preventDefault();
    // TODO(firestore): addDoc(collection(db, "studyGroups"), { name, courseCode, ..., createdBy: uid })
    onClose();
  };

  return (
    <NbCard className="mb-8 p-5 motion-safe:animate-nb-rise">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASS}>
          Group name
          <input name="name" required className={FIELD_CLASS} placeholder="Algorithms Night Owls" />
        </label>
        <label className={LABEL_CLASS}>
          Course
          <select name="courseCode" className={FIELD_CLASS} defaultValue={PLACEHOLDER_COURSES[0]}>
            {PLACEHOLDER_COURSES.map((course) => (
              <option key={course}>{course}</option>
            ))}
          </select>
        </label>
        <label className={`${LABEL_CLASS} sm:col-span-2`}>
          Description
          <textarea name="description" rows={2} className={FIELD_CLASS} placeholder="What you'll work on together" />
        </label>
        <label className={`${LABEL_CLASS} sm:col-span-2`}>
          Meeting schedule
          <input name="meetingSchedule" className={FIELD_CLASS} placeholder="Tue & Thu · 6–7:30pm" />
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <NbButton type="submit" tone="ink">
            Create group (stub)
          </NbButton>
          <NbButton tone="white" onClick={onClose}>
            Cancel
          </NbButton>
        </div>
      </form>
    </NbCard>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Study Groups tab. Placeholder data only — see the TODO at the top of the file.
 */
export default function StudyGroupsTab() {
  const [selectedCourse, setSelectedCourse] = useState(ALL_COURSES);
  const [isCreating, setIsCreating] = useState(false);
  const [studyGroups] = useState<StudyGroup[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);

  const visibleGroups =
    selectedCourse === ALL_COURSES
      ? studyGroups
      : studyGroups.filter((group) => group.courseCode === selectedCourse);

  const toggleJoin = (groupId: string) => {
    setJoinedGroupIds((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]
    );
  };

  return (
    <section aria-label="Study Groups">
      <SectionHeader
        eyebrow={`${studyGroups.length} open groups`}
        title="Study groups"
        blurb="Find a group for your course, or start one. Pick times that work around your commute."
        action={
          <NbButton tone="ink" onClick={() => setIsCreating((open) => !open)} aria-expanded={isCreating}>
            {isCreating ? "Close" : "+ New group"}
          </NbButton>
        }
      />

      {isCreating ? <CreateGroupForm onClose={() => setIsCreating(false)} /> : null}

      {/* Course filter chips — selected = solid ink, others white (black-and-white chrome) */}
      <div role="group" aria-label="Filter by course" className="mb-7 flex flex-wrap gap-2">
        {[ALL_COURSES, ...PLACEHOLDER_COURSES].map((course) => {
          const isSelected = course === selectedCourse;
          return (
            <button
              key={course}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedCourse(course)}
              className={`min-h-[38px] rounded-full border-2 px-4 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-150 ${NB_FOCUS} ${
                isSelected
                  ? "border-nb-ink bg-nb-ink text-nb-white"
                  : "border-nb-ink bg-nb-white text-nb-ink hover:shadow-nb-sm"
              }`}
            >
              {course}
            </button>
          );
        })}
      </div>

      {visibleGroups.length === 0 ? (
        <NbCard className="flex flex-col items-center justify-center p-10 text-center motion-safe:animate-nb-rise">
          <div className="w-12 h-12 rounded-full border-2 border-nb-ink bg-nb-brand grid place-items-center text-xl font-bold mb-2">
            📚
          </div>
          <p className="text-xl font-bold">
            {selectedCourse === ALL_COURSES ? "No study groups yet" : `No ${selectedCourse} groups yet`}
          </p>
          <p className="mt-2 text-nb-muted">
            {selectedCourse === ALL_COURSES
              ? "Start the first study group for your course to collaborate with classmates."
              : `Be the first to start a group for ${selectedCourse}.`}
          </p>
          <NbButton tone="ink" className="mt-4" onClick={() => setIsCreating(true)}>
            + Start a group
          </NbButton>
        </NbCard>
      ) : (
        // key={selectedCourse} re-mounts the grid on filter change so the cascade replays
        <div key={selectedCourse} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGroups.map((group, index) => (
            <StudyGroupCard
              key={group.id}
              group={group}
              index={index}
              isMember={joinedGroupIds.includes(group.id)}
              onToggleJoin={() => toggleJoin(group.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
