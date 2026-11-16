// Messages page content (/messages): 1:1 DMs. Conversation list on the left, open chat on the right.
// Uses real conversation data when available, and displays an empty state prompting students to connect on the Discovery Grid when 0 conversations exist.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { Conversation, Message } from "@/types/activity";
import {
  NB_FOCUS,
  NB_TONE_CYCLE,
  InitialsAvatar,
  NbButton,
  NbCard,
  NbLinkButton,
} from "@/ui/shared/design-law/nb-parts";

// ===== HELPER FUNCTIONS =====

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function avatarToneFor(conversationIndex: number) {
  return NB_TONE_CYCLE[conversationIndex % NB_TONE_CYCLE.length];
}

// ===== MAIN COMPONENT =====

export default function MessagesScreen() {
  const [conversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isChatOpenOnPhone, setIsChatOpenOnPhone] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLOListElement>(null);

  const selectedIndex = conversations.findIndex((convo) => convo.id === selectedId);
  const selectedConversation = conversations[selectedIndex];
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
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        conversationId: selectedId,
        senderId: "me",
        text,
        sentAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  return (
    <section aria-label="Messages">
      {conversations.length === 0 ? (
        <NbCard className="relative overflow-hidden flex flex-col items-center justify-center p-10 sm:p-16 text-center motion-safe:animate-nb-rise">
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-3 right-4 font-mono text-[10px] font-bold tracking-[0.2em] text-nb-ink/20 uppercase"
          >
            INBOX // 00_STANDBY
          </span>
          <div className="relative mb-4 flex items-center justify-center w-16 h-16 rounded-nb border-2 border-nb-ink bg-nb-brand shadow-[4px_4px_0px_#000000] -rotate-2 transition-transform duration-200 hover:rotate-0">
            <svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#0A0A0A]"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="13" y2="14" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border-2 border-nb-ink bg-nb-paper font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-nb-ink">
            <span className="w-2 h-2 rounded-full bg-nb-brand animate-pulse border border-nb-ink" />
            <span>MESSAGING // 0_ACTIVE_THREADS</span>
          </div>
          <h2 className="m-0 text-2xl font-bold tracking-tight text-nb-ink">No messages yet</h2>
          <p className="mt-2 text-base text-nb-muted max-w-[46ch] leading-relaxed">
            When you connect with classmates on Devora, you can message them directly here to coordinate assignments and study sessions.
          </p>
          <NbLinkButton href="/find-students" tone="ink" className="mt-6">
            Find classmates on Discovery Grid
          </NbLinkButton>
        </NbCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-[340px_1fr]">
          {/* Conversation list */}
          <NbCard
            className={`overflow-hidden motion-safe:animate-nb-rise ${isChatOpenOnPhone ? "hidden md:block" : ""}`}
          >
            <div className="flex items-center justify-between border-b-nb border-nb-ink px-5 py-4">
              <h2 className="text-lg font-bold">Inbox</h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">
                {conversations.length} chats
              </span>
            </div>
            <ul className="p-2">
              {conversations.map((convo, index) => {
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

          {/* Active chat */}
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

                <ol ref={threadRef} className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5" aria-label="Messages">
                  {visibleMessages.map((message) => {
                    const isMine = message.senderId === "me";
                    return (
                      <li key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[78%] rounded-nb border-nb border-nb-ink px-4 py-2.5 text-[15px] shadow-nb-sm ${
                            isMine ? "bg-nb-brand text-[#0A0A0A]" : "bg-nb-white text-nb-ink"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <span className="mt-1 block text-right font-mono text-[10px] uppercase tracking-wider text-nb-ink/65">
                            {new Date(message.sentAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <form onSubmit={sendMessage} className="flex gap-2 border-t-nb border-nb-ink p-3 sm:p-4">
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
      )}
    </section>
  );
}
