// Connect: messages that agree on a time, and people with one next step each.
// Proposals only offer blocks free for both people. A person opens a profile modal.

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarCheck, Check, Clock, MessageCircle, SendHorizontal, UserPlus } from "lucide-react";

import { describeSlot, type SlotId } from "../config";
import type { Availability } from "../useAvailability";
import type { ConnectionState, Conversation, Message, Person } from "../sample-data";
import { ASCII_NETWORK, Ascii, Avatar, SectionHeader } from "../primitives";
import { useMediaQuery } from "../useMediaQuery";
import { IsoWeek, type CubeKind } from "../IsoWeek";
import { Modal } from "../Modal";

type ConnectSectionProps = {
  availability: Availability;
  people: Person[];
  initialConversations: Conversation[];
  initialConnections: Record<string, ConnectionState>;
  onFocusHours: () => void;
};

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const firstName = (p: Person) => p.name.split(" ")[0];
const slotText = (slot: SlotId) => {
  const s = describeSlot(slot);
  return `${s.day} ${s.block.toLowerCase()}, ${s.range}`;
};

export const compareCubes = (mine: (s: SlotId) => boolean, theirs: SlotId[], all: SlotId[]) => {
  const cubes: Partial<Record<SlotId, CubeKind>> = {};
  all.forEach((s) => {
    const a = mine(s);
    const b = theirs.includes(s);
    if (a && b) cubes[s] = "match";
    else if (a) cubes[s] = "free";
    else if (b) cubes[s] = "other";
  });
  return cubes;
};

export const ConnectSection = ({ availability, people, initialConversations, initialConnections, onFocusHours }: ConnectSectionProps) => {
  const { overlapWith, isFree, hours } = availability;
  const narrow = useMediaQuery("(max-width: 899px)");
  const [conversations, setConversations] = useState(initialConversations);
  const [connections, setConnections] = useState(initialConnections);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id ?? "");
  const [showThread, setShowThread] = useState(false);
  const [proposalSlot, setProposalSlot] = useState<SlotId | null>(null);
  const [draft, setDraft] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const messagesEl = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLInputElement>(null);
  const messagesCardRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const partner = selected ? personById.get(selected.personId) : undefined;
  const shared = partner ? overlapWith(partner.hours) : [];
  const allSlots = useMemo(() => people.flatMap((p) => p.hours).concat(Array.from(hours)), [people, hours]);

  useEffect(() => {
    setProposalSlot((current) => (current && shared.includes(current) ? current : shared[0] ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, shared.join("|")]);

  useEffect(() => {
    const list = messagesEl.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [selected?.messages.length, selectedId, showThread]);

  const openConversation = (id: string) => {
    setSelectedId(id);
    setShowThread(true);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const append = (conversationId: string, message: Message) =>
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, lastTime: "now", messages: [...c.messages, message] } : c)));

  const sendProposal = () => {
    if (!selected || !proposalSlot || !partner) return;
    const id = `p-${Date.now()}`;
    const conversationId = selected.id;
    append(conversationId, { id, from: "me", text: "", time: nowLabel(), proposal: { slot: proposalSlot, status: "sent" } });
    timers.current.push(
      window.setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: [
                    ...c.messages.map((m) => (m.id === id && m.proposal ? { ...m, proposal: { ...m.proposal, status: "accepted" as const } } : m)),
                    { id: `${id}-r`, from: "them" as const, text: "That works for me. See you then.", time: nowLabel() },
                  ],
                },
          ),
        );
      }, 1600),
    );
  };

  const sendNote = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selected) return;
    append(selected.id, { id: `n-${Date.now()}`, from: "me", text, time: nowLabel() });
    setDraft("");
  };

  const messagePerson = (personId: string) => {
    setProfileId(null);
    const existing = conversations.find((c) => c.personId === personId);
    if (existing) openConversation(existing.id);
    else {
      const fresh: Conversation = { id: `c-${personId}`, personId, unread: false, lastTime: "now", messages: [] };
      setConversations((prev) => [fresh, ...prev]);
      setSelectedId(fresh.id);
      setShowThread(true);
    }
    window.setTimeout(() => messagesCardRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 60);
  };

  const cycleConnection = (personId: string) =>
    setConnections((prev) => {
      const state = prev[personId];
      return { ...prev, [personId]: state === "none" ? "requested" : state === "requested" ? "none" : state };
    });

  const sortedPeople = [...people].sort((a, b) => {
    const rank = (s: ConnectionState) => (s === "none" ? 0 : s === "requested" ? 1 : 2);
    return rank(connections[a.id]) - rank(connections[b.id]);
  });

  const actionFor = (person: Person, size: "sm" | "md" = "sm") => {
    const state = connections[person.id] ?? "none";
    if (state === "connected")
      return (
        <button type="button" className={`nb-btn ${size === "sm" ? "nb-btn-sm" : "nb-btn-primary"}`} onClick={() => messagePerson(person.id)}>
          Message
        </button>
      );
    if (state === "requested")
      return (
        <button type="button" className={`nb-btn nb-btn-quiet ${size === "sm" ? "nb-btn-sm" : ""}`} aria-pressed="true" aria-label={`Requested. Cancel request to ${person.name}`} onClick={() => cycleConnection(person.id)}>
          <Check className="h-4 w-4" aria-hidden="true" />
          Requested
        </button>
      );
    return (
      <button type="button" className={`nb-btn ${size === "sm" ? "nb-btn-sm" : "nb-btn-primary"}`} onClick={() => cycleConnection(person.id)}>
        Connect
      </button>
    );
  };

  const listView = (
    <ul className="nb-convo-list" aria-label="Conversations">
      {conversations.map((c) => {
        const person = personById.get(c.personId);
        if (!person) return null;
        const last = c.messages[c.messages.length - 1];
        const lastText = last ? (last.proposal ? `Proposed ${describeSlot(last.proposal.slot).day}` : last.text) : "No messages yet";
        const isSelected = c.id === selected?.id && !narrow;
        return (
          <li key={c.id}>
            <button type="button" className={`nb-convo ${isSelected ? "is-selected" : ""}`} aria-current={isSelected ? "true" : undefined} onClick={() => openConversation(c.id)}>
              <Avatar initials={person.initials} size="sm" />
              <span className="nb-convo-copy">
                <span className="nb-convo-name font-display">{person.name}</span>
                <span className="nb-convo-last">{lastText}</span>
              </span>
              <span className="nb-convo-meta">
                <span>{c.lastTime}</span>
                {c.unread ? <span className="nb-unread" aria-label="Unread" /> : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const threadView =
    selected && partner ? (
      <div className="nb-thread">
        <div className="nb-thread-head">
          {narrow ? (
            <button type="button" className="nb-icon-btn" aria-label="Back to conversations" onClick={() => setShowThread(false)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <Avatar initials={partner.initials} />
          <button type="button" className="nb-link-name" onClick={() => setProfileId(partner.id)}>
            <span className="font-display">{partner.name}</span>
            <span className="nb-meta">
              {partner.major}, {partner.year}
            </span>
          </button>
        </div>

        <div ref={messagesEl} className="nb-messages" aria-live="polite" aria-label={`Messages with ${partner.name}`}>
          {selected.messages.length === 0 ? <p className="nb-thread-empty">Start with a time that works for both of you, or say hi.</p> : null}
          {selected.messages.map((m) =>
            m.proposal ? (
              <div key={m.id} className={`nb-proposal nb-pop ${m.from === "me" ? "is-me" : ""} ${m.proposal.status === "accepted" ? "is-accepted" : ""}`}>
                <CalendarCheck className="nb-proposal-icon" aria-hidden="true" />
                <div>
                  <p className="nb-proposal-title font-display">Study time proposed</p>
                  <p>{slotText(m.proposal.slot)}</p>
                  <p className="nb-proposal-status">
                    {m.proposal.status === "accepted" ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> {firstName(partner)} accepted
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Waiting for {firstName(partner)}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div key={m.id} className={`nb-bubble nb-pop ${m.from === "me" ? "is-me" : ""}`}>
                <p>{m.text}</p>
                <span className="nb-bubble-time">{m.time}</span>
              </div>
            ),
          )}
        </div>

        <div className="nb-propose">
          <div className="nb-propose-board">
            <IsoWeek cubes={compareCubes(isFree, partner.hours, allSlots)} size="sm" label={`Your week compared with ${partner.name}'s`} />
            <ul className="nb-legend" aria-hidden="true">
              <li><i data-kind="match" /> Both free</li>
              <li><i data-kind="free" /> You</li>
              <li><i data-kind="other" /> {firstName(partner)}</li>
            </ul>
          </div>
          <div className="nb-propose-main">
            <p className="nb-propose-title font-display">Propose a time</p>
            {shared.length > 0 ? (
              <>
                <div className="nb-slots" role="radiogroup" aria-label={`Blocks free for you and ${partner.name}`}>
                  {shared.map((slot) => {
                    const s = describeSlot(slot);
                    const on = slot === proposalSlot;
                    return (
                      <button key={slot} type="button" role="radio" aria-checked={on} className={`nb-slot ${on ? "is-on" : ""}`} onClick={() => setProposalSlot(slot)}>
                        <span className="font-display">
                          {s.dayShort} {s.block.toLowerCase()}
                        </span>
                        <span className="nb-slot-range">{s.range}</span>
                      </button>
                    );
                  })}
                </div>
                <button type="button" className="nb-btn nb-btn-primary" onClick={sendProposal} disabled={!proposalSlot}>
                  <CalendarCheck className="nb-btn-icon" aria-hidden="true" />
                  Send proposal
                </button>
              </>
            ) : (
              <div className="nb-empty">
                <p className="nb-empty-title">You and {firstName(partner)} have no free blocks in common yet.</p>
                <p>Add more hours to find one, or send a note to pick a time together.</p>
                <div className="nb-empty-actions">
                  <button type="button" className="nb-btn nb-btn-primary nb-btn-sm" onClick={onFocusHours}>
                    Add more hours
                  </button>
                  <button type="button" className="nb-text-btn" onClick={() => draftRef.current?.focus()}>
                    Write a note instead
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <form className="nb-composer" onSubmit={sendNote}>
          <label htmlFor="nb-draft" className="sr-only">
            Message {partner.name}
          </label>
          <input id="nb-draft" ref={draftRef} className="nb-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${firstName(partner)}`} autoComplete="off" />
          <button type="submit" className="nb-icon-btn nb-icon-btn-primary" aria-label="Send message" disabled={!draft.trim()}>
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    ) : null;

  const profile = profileId ? personById.get(profileId) : undefined;
  const profileShared = profile ? overlapWith(profile.hours) : [];

  return (
    <section className="nb-section" aria-labelledby="connect-title" id="connect">
      <SectionHeader id="connect-title" kicker="CONNECT" title="Agree on a time in one message" sample>
        Propose a block that is free for both of you. Devora only offers times you share, so there is no back and forth.
      </SectionHeader>

      <div className="nb-connect-grid">
        <div ref={messagesCardRef} className="nb-card nb-messages-card" data-reveal="">
          <div className="nb-card-head">
            <h3 className="nb-card-title font-display">
              <MessageCircle className="nb-card-icon" aria-hidden="true" />
              Messages
            </h3>
          </div>
          {narrow ? (showThread ? threadView : listView) : (
            <div className="nb-messages-split">
              {listView}
              {threadView}
            </div>
          )}
        </div>

        <div className="nb-card nb-people-card" data-reveal="">
          <div className="nb-card-head">
            <h3 className="nb-card-title font-display">
              <UserPlus className="nb-card-icon" aria-hidden="true" />
              People in your classes
            </h3>
            <Ascii art={ASCII_NETWORK} className="nb-ascii-network" />
          </div>
          <ul className="nb-people">
            {sortedPeople.map((person) => {
              const state = connections[person.id] ?? "none";
              const sharedFree = overlapWith(person.hours).length;
              return (
                <li key={person.id} className="nb-person">
                  <Avatar initials={person.initials} />
                  <div className="nb-person-copy">
                    <button type="button" className="nb-link-name" onClick={() => setProfileId(person.id)} aria-label={`View ${person.name}'s profile`}>
                      <span className="font-display">{person.name}</span>
                      {state === "connected" ? <span className="nb-state">Connected</span> : null}
                    </button>
                    <p className="nb-meta">
                      {person.sharedClasses.join(" and ")}
                      {sharedFree > 0 ? `. ${sharedFree} free ${sharedFree === 1 ? "block" : "blocks"} in common` : ". No free blocks in common"}
                    </p>
                  </div>
                  {actionFor(person)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Modal
        open={Boolean(profile)}
        onOpenChange={(open) => !open && setProfileId(null)}
        kicker="CLASSMATE"
        title={profile?.name ?? ""}
        description={profile ? `${profile.major}, ${profile.year}` : undefined}
        footer={profile ? actionFor(profile, "md") : null}
      >
        {profile ? (
          <div className="nb-modal-grid">
            <div className="nb-modal-block">
              <p className="nb-modal-label">Classes you share</p>
              <ul className="nb-chip-row">
                {profile.sharedClasses.map((c) => (
                  <li key={c} className="nb-chip">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="nb-modal-block">
              <p className="nb-modal-label">Your week next to {firstName(profile)}&apos;s</p>
              <IsoWeek cubes={compareCubes(isFree, profile.hours, allSlots)} size="sm" label={`Your week compared with ${profile.name}'s`} />
              <p className="nb-modal-text">
                {profileShared.length > 0
                  ? `You are both free ${profileShared.map((s) => { const d = describeSlot(s); return `${d.day} ${d.block.toLowerCase()}`; }).join(", ")}.`
                  : `No shared free time yet. ${firstName(profile)} is free ${profile.hours.map((s) => { const d = describeSlot(s); return `${d.day} ${d.block.toLowerCase()}`; }).join(", ")}.`}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};
