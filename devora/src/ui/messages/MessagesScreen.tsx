// Messages page content (/messages): 1:1 DMs. Conversation list on the left, open chat on the right.
// Flow: placeholder conversations → pick one → show its messages + a composer.
// Phones: list and chat stack — picking a conversation slides the chat in with a Back button.
// TODO(firestore): conversations live at /conversations/{conversationId} with a `messages`
//   subcollection (/conversations/{id}/messages/{messageId}). Use onSnapshot for live updates.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { Message } from "@/types/activity";
import {
  NB_FOCUS,
  NB_TONE_CYCLE,
  InitialsAvatar,
  NbButton,
  NbCard,
  StubNote,
} from "@/ui/shared/design-law/nb-parts";

import { PLACEHOLDER_CONVERSATIONS, PLACEHOLDER_MESSAGES, PLACEHOLDER_MY_UID } from "./placeholder-data";

// ===== HELPER FUNCTIONS =====

// "2026-11-14T21:10:00Z" → "Nov 14" (short date for the list)
function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Same gradient for the same person everywhere on the page
function avatarToneFor(conversationIndex: number) {
  return NB_TONE_CYCLE[conversationIndex % NB_TONE_CYCLE.length];
}

// ===== MAIN COMPONENT =====

/**
 * Messages screen. Placeholder data only — see the TODO at the top of the file.
 */
export default function MessagesScreen() {
  const [selectedId, setSelectedId] = useState(PLACEHOLDER_CONVERSATIONS[0]?.id ?? "");
  // Phones only: true = chat is showing, false = list is showing. Desktop shows both always.
  const [isChatOpenOnPhone, setIsChatOpenOnPhone] = useState(false);
  // Local-only copy so the composer visibly works. Not saved anywhere.
  const [messages, setMessages] = useState<Message[]>(PLACEHOLDER_MESSAGES);
  const [draft, setDraft] = useState("");
  // vocab: useRef = a box that holds the chat scroll element between renders
  const threadRef = useRef<HTMLOListElement>(null);

  const selectedIndex = PLACEHOLDER_CONVERSATIONS.findIndex((convo) => convo.id === selectedId);
  const selectedConversation = PLACEHOLDER_CONVERSATIONS[selectedIndex];
  const visibleMessages = messages.filter((message) => message.conversationId === selectedId);

  // Keep the newest message in view when switching chats or sending.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [selectedId, visibleMessages.length]);

  const openConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setIsChatOpenOnPhone(true);
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedId) return;
    // TODO(firestore): addDoc(collection(db, "conversations", selectedId, "messages"), {...})
    //   and update lastMessagePreview / lastMessageAt on the parent conversation doc.
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        conversationId: selectedId,
        senderId: PLACEHOLDER_MY_UID,
        text,
        sentAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  return (
    <section aria-label="Messages">
      {/* vocab: md:grid-cols-[340px_1fr] = from tablet width up, a fixed list column + a flexible chat column */}
      <div className="grid gap-6 md:grid-cols-[340px_1fr]">
        {/* ── Conversation list (hidden on phones while a chat is open) ── */}
        <NbCard
          className={`overflow-hidden motion-safe:animate-nb-rise ${isChatOpenOnPhone ? "hidden md:block" : ""}`}
        >
          <div className="flex items-center justify-between border-b-nb border-nb-ink px-5 py-4">
            <h2 className="text-lg font-bold">Inbox</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">
              {PLACEHOLDER_CONVERSATIONS.length} chats
            </span>
          </div>
          <ul className="p-2">
            {PLACEHOLDER_CONVERSATIONS.map((convo, index) => {
              const isSelected = convo.id === selectedId;
              return (
                <li key={convo.id}>
                  <button
                    type="button"
                    onClick={() => openConversation(convo.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className={`relative flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left transition-colors duration-150 ${NB_FOCUS} ${
                      isSelected ? "bg-nb-soft" : "hover:bg-nb-paper"
                    }`}
                  >
                    {/* Gradient rail marks the open chat */}
                    {isSelected ? (
                      <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1.5 rounded-full border border-nb-ink bg-nb-brand" />
                    ) : null}
                    <InitialsAvatar name={convo.otherParticipantName} tone={avatarToneFor(index)} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">{convo.otherParticipantName}</span>
                        <span className="shrink-0 font-mono text-[11px] text-nb-muted">
                          {formatShortDate(convo.lastMessageAt)}
                        </span>
                      </span>
                      <span className={`block truncate text-sm ${convo.unreadCount > 0 ? "font-semibold text-nb-ink" : "text-nb-muted"}`}>
                        {convo.lastMessagePreview}
                      </span>
                    </span>
                    {convo.unreadCount > 0 ? (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-nb-ink bg-nb-brand px-1.5 font-mono text-[11px] font-bold text-nb-ink">
                        {convo.unreadCount}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </NbCard>

        {/* ── Active chat (hidden on phones until a conversation is picked) ── */}
        <NbCard
          className={`flex h-[min(70vh,600px)] min-h-[440px] flex-col overflow-hidden motion-safe:animate-nb-rise [animation-delay:90ms] ${
            isChatOpenOnPhone ? "" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <>
              <div className="flex items-center gap-3 border-b-nb border-nb-ink px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => setIsChatOpenOnPhone(false)}
                  className={`rounded-full border-2 border-nb-ink bg-nb-white px-3 py-1 text-sm font-bold md:hidden ${NB_FOCUS}`}
                >
                  ← Back
                </button>
                <InitialsAvatar name={selectedConversation.otherParticipantName} tone={avatarToneFor(selectedIndex)} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{selectedConversation.otherParticipantName}</p>
                  <p className="truncate text-sm text-nb-muted">{selectedConversation.otherParticipantMajor}</p>
                </div>
              </div>

              {/* Bubbles — mine: solid ink on the right; theirs: white with ink outline on the left.
                  key={selectedId} replays the entrance when switching chats. */}
              <ol key={selectedId} ref={threadRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-nb-paper p-4 sm:p-5">
                {visibleMessages.map((message, index) => {
                  const isMine = message.senderId === PLACEHOLDER_MY_UID;
                  return (
                    <li
                      key={message.id}
                      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                      className={`max-w-[78%] rounded-2xl border-2 px-4 py-2.5 text-[15px] leading-snug motion-safe:animate-nb-rise ${
                        isMine
                          ? "self-end rounded-br-md border-nb-ink bg-nb-ink text-nb-white shadow-nb-sm"
                          : "self-start rounded-bl-md border-nb-ink bg-nb-white shadow-nb-sm"
                      }`}
                    >
                      {message.text}
                    </li>
                  );
                })}
              </ol>

              <form onSubmit={sendMessage} className="flex gap-2 border-t-2 border-nb-ink p-3 sm:p-4">
                <label htmlFor="message-draft" className="sr-only">
                  Message
                </label>
                <input
                  id="message-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message ${selectedConversation.otherParticipantName.split(" ")[0]}…`}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-nb border-nb border-nb-ink bg-nb-white px-4 text-[15px] placeholder:text-nb-muted/70 transition-shadow focus:shadow-nb-sm focus:outline-none"
                />
                <NbButton type="submit" tone="ink" disabled={!draft.trim()}>
                  Send
                </NbButton>
              </form>
            </>
          ) : (
            <p className="m-auto p-6 text-nb-muted">Pick a conversation</p>
          )}
        </NbCard>
      </div>

      <StubNote>
        Placeholder chats; sent messages only live until refresh. Wire up{" "}
        <code>/conversations/{"{conversationId}"}/messages</code> in Firestore.
      </StubNote>
    </section>
  );
}
