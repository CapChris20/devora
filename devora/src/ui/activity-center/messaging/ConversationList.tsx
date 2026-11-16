// Conversation list component for the Messaging screen inbox.
// Shows 1-on-1 chats with last message preview, timestamp, unread badge, and selection highlight.
// Responsive: on small screens, renders as a horizontal scrolling strip above the chat thread.

"use client";

// ===== IMPORTS =====

import { useActivityCenter } from "../ActivityCenterContext";
import Avatar from "../shared/Avatar";

// ===== MAIN COMPONENT =====

export default function ConversationList() {
  const {
    convoOrder,
    activeConvoUid,
    setActiveConvoUid,
    messages,
    unreadCounts,
    people,
  } = useActivityCenter();

  return (
    <div className="inbox border-b-nb md:border-b-0 md:border-r-nb border-nb-ink flex flex-col min-w-0 bg-nb-white">
      {/* Inbox Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b-nb border-nb-ink">
        <h3 className="m-0 text-lg font-bold text-nb-ink">Inbox</h3>
        <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
          {convoOrder.length} chats
        </span>
      </div>

      {/* Conversations scroll area */}
      <div className="flex flex-row md:flex-col gap-1 p-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto">
        {convoOrder.map((uid) => {
          const profile = people[uid];
          const convoMessages = messages[uid] || [];
          const lastMsg = convoMessages[convoMessages.length - 1];
          const unread = unreadCounts[uid] || 0;
          const isActive = uid === activeConvoUid;

          return (
            <button
              key={uid}
              type="button"
              aria-current={isActive}
              onClick={() => setActiveConvoUid(uid)}
              className={`relative flex items-center gap-3 w-full min-w-[220px] md:min-w-0 p-2.5 rounded-lg border-2 text-left transition-colors duration-120 ${
                isActive
                  ? "bg-nb-soft border-nb-ink"
                  : "border-transparent bg-transparent hover:bg-nb-paper"
              }`}
            >
              <Avatar uid={uid} size="md" />

              <span className="flex-1 min-w-0 flex flex-col">
                <span className="flex justify-between gap-2">
                  <span className="font-bold text-nb-ink truncate">
                    {profile ? profile.name : uid}
                  </span>
                  <span className="flex-shrink-0 font-nb-mono text-[11px] text-nb-muted">
                    {lastMsg ? lastMsg.timestamp : "New"}
                  </span>
                </span>

                <span
                  className={`text-[13px] truncate ${
                    unread > 0
                      ? "text-nb-ink font-bold"
                      : "text-nb-muted"
                  }`}
                >
                  {lastMsg ? lastMsg.text : "Say hi to start the conversation"}
                </span>
              </span>

              {unread > 0 && (
                <span className="min-w-[22px] h-[22px] px-1.5 grid place-items-center rounded-full border-2 border-nb-ink bg-nb-brand font-nb-mono text-[11px] font-bold text-nb-ink flex-shrink-0">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
