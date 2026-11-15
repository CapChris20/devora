// Study: groups by course. Each card shows fit, format, members, and spots left.
// Lists re-flow with Flip when the filter or your hours change. A card opens a detail modal.

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Clock, Laptop, MapPin, MessagesSquare, Plus, Radio } from "lucide-react";

import type { Availability } from "../useAvailability";
import { FIT_ORDER } from "../useAvailability";
import type { Person, StudyGroup } from "../sample-data";
import { Avatar, FitChip, SectionHeader } from "../primitives";
import { DAYS, TIME_BLOCKS, describeSlot, slotId, type SlotId } from "../config";
import { useFlipList } from "../motion";
import { Modal } from "../Modal";
import { IsoWeek, type CubeKind } from "../IsoWeek";

type FormatFilter = "all" | "live" | "async";

type StudySectionProps = {
  availability: Availability;
  people: Person[];
  initialGroups: StudyGroup[];
  courses: string[];
  onFocusHours: () => void;
};

const fitSentence = (fit: string, group: StudyGroup) => {
  if (fit === "fits") return `${group.when} is one of your free blocks.`;
  if (fit === "any") return "It is async, so you can take part whenever you have time.";
  if (fit === "online") return `${group.when} is not in your hours, but it meets online, so you can join from anywhere.`;
  if (fit === "after") return `${group.when} is after class time and not in your hours yet.`;
  return `${group.when} is outside your free hours.`;
};

export const StudySection = ({ availability, people, initialGroups, courses, onFocusHours }: StudySectionProps) => {
  const { getFit, passesFilter, fitsOnly, setFitsOnly, hours, isFree } = availability;
  const [groups, setGroups] = useState(initialGroups);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<FormatFilter>("all");
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState(courses[0] ?? "");
  const [newFormat, setNewFormat] = useState<"live" | "async">("live");
  const [newSlot, setNewSlot] = useState<SlotId>(Array.from(hours)[0] ?? "tue-afternoon");
  const [openId, setOpenId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const personById = new Map(people.map((p) => [p.id, p]));

  const visible = groups
    .filter((g) => format === "all" || g.format === format)
    .filter(passesFilter)
    .sort((a, b) => FIT_ORDER[getFit(a)] - FIT_ORDER[getFit(b)]);
  const hiddenByFit = groups.filter((g) => (format === "all" || g.format === format) && !passesFilter(g)).length;

  useFlipList(listRef, visible.map((g) => g.id).join("|") + `|${creating}`);

  const toggleJoin = (id: string) =>
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const createGroup = (e: FormEvent) => {
    e.preventDefault();
    const s = describeSlot(newSlot);
    const group: StudyGroup = {
      id: `g-new-${Date.now()}`,
      course: newCourse,
      title: newFormat === "async" ? "Shared question thread" : "Study session",
      format: newFormat,
      where: newFormat === "async" ? "Shared thread, reply when you can" : "Place to be picked by the group",
      when: newFormat === "async" ? "Any time this week" : `${s.day} ${s.block.toLowerCase()}`,
      slots: newFormat === "async" ? [] : [newSlot],
      async: newFormat === "async",
      memberIds: [],
      capacity: 5,
      mine: true,
      about: "You started this group. Classmates in the course can find it and join.",
    };
    setGroups((prev) => [group, ...prev]);
    setJoined((prev) => new Set(prev).add(group.id));
    setCreating(false);
  };

  const membersOf = (g: StudyGroup) => g.memberIds.map((id) => personById.get(id)).filter((p): p is Person => Boolean(p));
  const open = groups.find((g) => g.id === openId);

  const joinButton = (group: StudyGroup, size: "sm" | "md" = "sm") => {
    const isJoined = joined.has(group.id);
    const count = membersOf(group).length + (isJoined ? 1 : 0);
    const full = count >= group.capacity && !isJoined;
    if (isJoined)
      return (
        <button type="button" className={`nb-btn nb-btn-quiet ${size === "sm" ? "nb-btn-sm" : ""}`} aria-pressed="true" onClick={() => toggleJoin(group.id)} aria-label={`Joined ${group.course}. Leave group`}>
          {group.mine ? "Your group" : "Joined"}
        </button>
      );
    return (
      <button type="button" className={`nb-btn ${size === "sm" ? "nb-btn-sm" : "nb-btn-primary"}`} onClick={() => toggleJoin(group.id)} disabled={full} aria-label={`Join ${group.course} ${group.title}`}>
        {full ? "Full" : "Join"}
      </button>
    );
  };

  const modalCubes: Partial<Record<SlotId, CubeKind>> = {};
  if (open) {
    DAYS.forEach((d) =>
      TIME_BLOCKS.forEach((b) => {
        const s = slotId(d.id, b.id);
        const mine = isFree(s);
        const theirs = open.slots.includes(s);
        if (mine && theirs) modalCubes[s] = "match";
        else if (mine) modalCubes[s] = "free";
        else if (theirs) modalCubes[s] = "other";
      }),
    );
  }

  return (
    <section className="nb-section" aria-labelledby="study-title" id="study">
      <SectionHeader
        id="study-title"
        kicker="STUDY"
        title="Study groups by course"
        sample
        aside={
          <div className="nb-segment" role="radiogroup" aria-label="Group format">
            {(["all", "live", "async"] as const).map((f) => (
              <button key={f} type="button" role="radio" aria-checked={format === f} className={`nb-segment-btn ${format === f ? "is-on" : ""}`} onClick={() => setFormat(f)}>
                {f === "all" ? "All" : f === "live" ? "Live" : "Async"}
              </button>
            ))}
          </div>
        }
      >
        Each group says if it meets live or works async, who is in it, how many spots are left, and if it fits your hours.
      </SectionHeader>

      <ul ref={listRef} className="nb-groups">
        {visible.map((group) => {
          const fit = getFit(group);
          const isJoined = joined.has(group.id);
          const members = membersOf(group);
          const count = members.length + (isJoined ? 1 : 0);
          const spots = Math.max(0, group.capacity - count);
          return (
            <li key={group.id} data-flip-id={group.id} className="nb-card nb-card-lift nb-group" data-reveal="">
              <div className="nb-group-top">
                <FitChip fit={fit} />
                <span className="nb-format">
                  {group.format === "async" ? <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" /> : <Radio className="h-3.5 w-3.5" aria-hidden="true" />}
                  {group.format === "async" ? "Async" : "Live"}
                </span>
              </div>
              <h3 className="nb-group-course font-display">
                <button type="button" className="nb-card-link" onClick={() => setOpenId(group.id)}>
                  {group.course}
                  <ArrowUpRight className="nb-card-link-icon" aria-hidden="true" />
                </button>
              </h3>
              <p className="nb-group-title">{group.title}</p>
              <ul className="nb-facts">
                <li>
                  {group.online ? <Laptop className="nb-fact-icon" aria-hidden="true" /> : <MapPin className="nb-fact-icon" aria-hidden="true" />}
                  {group.where}
                </li>
                <li>
                  <Clock className="nb-fact-icon" aria-hidden="true" />
                  {group.when}
                </li>
              </ul>
              <div className="nb-capacity" aria-label={`${count} of ${group.capacity} spots taken`}>
                {Array.from({ length: group.capacity }, (_, i) => (
                  <span key={i} className={`nb-seat ${i < count ? "is-taken" : ""}`} />
                ))}
              </div>
              <div className="nb-group-foot">
                <div className="nb-members">
                  <span className="nb-stack" aria-hidden="true">
                    {members.slice(0, 4).map((m) => (
                      <Avatar key={m.id} initials={m.initials} size="sm" />
                    ))}
                  </span>
                  <span className="nb-members-text">
                    <span>
                      {count} of {group.capacity}
                    </span>
                    <span className="nb-faint">{spots === 0 ? "Full" : `${spots} ${spots === 1 ? "spot" : "spots"} left`}</span>
                  </span>
                </div>
                {joinButton(group)}
              </div>
            </li>
          );
        })}

        <li data-flip-id="new" className="nb-card nb-group nb-group-new" data-reveal="">
          {creating ? (
            <form className="nb-new-form" onSubmit={createGroup}>
              <p className="nb-card-title font-display">Start a group</p>
              <label className="nb-field">
                <span className="nb-field-label">Course</span>
                <select className="nb-select" value={newCourse} onChange={(e) => setNewCourse(e.target.value)}>
                  {courses.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <div className="nb-field">
                <span className="nb-field-label" id="new-format-label">
                  Format
                </span>
                <div className="nb-segment" role="radiogroup" aria-labelledby="new-format-label">
                  {(["live", "async"] as const).map((f) => (
                    <button key={f} type="button" role="radio" aria-checked={newFormat === f} className={`nb-segment-btn ${newFormat === f ? "is-on" : ""}`} onClick={() => setNewFormat(f)}>
                      {f === "live" ? "Live" : "Async"}
                    </button>
                  ))}
                </div>
              </div>
              {newFormat === "live" ? (
                <label className="nb-field">
                  <span className="nb-field-label">When</span>
                  <select className="nb-select" value={newSlot} onChange={(e) => setNewSlot(e.target.value as SlotId)}>
                    {DAYS.flatMap((d) =>
                      TIME_BLOCKS.map((b) => {
                        const id = slotId(d.id, b.id);
                        return (
                          <option key={id} value={id}>
                            {d.long} {b.label.toLowerCase()}
                            {hours.has(id) ? " (you are free)" : ""}
                          </option>
                        );
                      }),
                    )}
                  </select>
                </label>
              ) : null}
              <div className="nb-new-actions">
                <button type="submit" className="nb-btn nb-btn-primary">
                  Start group
                </button>
                <button type="button" className="nb-text-btn" onClick={() => setCreating(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="nb-new-trigger" onClick={() => setCreating(true)}>
              <span className="nb-new-plus" aria-hidden="true">
                <Plus className="h-5 w-5" />
              </span>
              <span className="nb-card-title font-display">Start a group</span>
              <span className="nb-muted">Pick a course and a time you are free. Classmates in that course can join.</span>
            </button>
          )}
        </li>
      </ul>

      {visible.length === 0 ? (
        <div className="nb-card nb-empty nb-empty-wide">
          <p className="nb-empty-title">No groups fit your hours right now.</p>
          <p>Study groups are for meeting classmates at a time you can make. Add a free block or show every group.</p>
          <div className="nb-empty-actions">
            <button type="button" className="nb-btn nb-btn-primary" onClick={onFocusHours}>
              Add free hours
            </button>
            {fitsOnly ? (
              <button type="button" className="nb-text-btn" onClick={() => setFitsOnly(false)}>
                Show all groups
              </button>
            ) : null}
          </div>
        </div>
      ) : hiddenByFit > 0 ? (
        <p className="nb-footnote">
          {hiddenByFit} {hiddenByFit === 1 ? "group is" : "groups are"} hidden because {hiddenByFit === 1 ? "it does" : "they do"} not fit your hours.{" "}
          <button type="button" className="nb-text-btn nb-text-inline" onClick={() => setFitsOnly(false)}>
            Show all
          </button>
        </p>
      ) : null}

      <Modal
        open={Boolean(open)}
        onOpenChange={(o) => !o && setOpenId(null)}
        kicker={open ? `${open.course} STUDY GROUP` : undefined}
        title={open?.title ?? ""}
        description={open?.about}
        footer={open ? joinButton(open, "md") : null}
      >
        {open ? (
          <div className="nb-modal-grid">
            <div className="nb-modal-block">
              <p className="nb-modal-label">How it fits your week</p>
              <div className="nb-modal-fit">
                <FitChip fit={getFit(open)} />
              </div>
              <p className="nb-modal-text">{fitSentence(getFit(open), open)}</p>
              {open.slots.length > 0 ? <IsoWeek cubes={modalCubes} size="sm" label="Your free hours next to this group's meeting time" /> : null}
            </div>
            <div className="nb-modal-block">
              <p className="nb-modal-label">Details</p>
              <ul className="nb-facts">
                <li>
                  {open.online ? <Laptop className="nb-fact-icon" aria-hidden="true" /> : <MapPin className="nb-fact-icon" aria-hidden="true" />}
                  {open.where}
                </li>
                <li>
                  <Clock className="nb-fact-icon" aria-hidden="true" />
                  {open.when}
                </li>
              </ul>
              <p className="nb-modal-label">Who is in it</p>
              {membersOf(open).length === 0 && !joined.has(open.id) ? (
                <p className="nb-modal-text">Nobody yet. Share it with classmates in {open.course}.</p>
              ) : (
                <ul className="nb-member-list">
                  {joined.has(open.id) ? (
                    <li>
                      <Avatar initials="You" size="sm" />
                      <span>You</span>
                    </li>
                  ) : null}
                  {membersOf(open).map((m) => (
                    <li key={m.id}>
                      <Avatar initials={m.initials} size="sm" />
                      <span>
                        {m.name}
                        <span className="nb-faint"> {m.major}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};
