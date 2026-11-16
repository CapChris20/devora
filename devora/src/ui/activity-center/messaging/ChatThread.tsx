// Chat thread message list and header.
// Renders message bubbles (inbound white, outbound ink) with timestamps and animated bouncing typing dots.
// Automatically scrolls to bottom on new messages.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useActivityCenter } from "../ActivityCenterContext";
import Avatar from "../shared/Avatar";

// ===== MAIN COMPONENT =====

export default function ChatThread() {
  const threadRef = useRef<HTMLOListElement>(null);
  const typingDotsRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    activeConvoUid,
    messages,
    people,
    isPartnerTyping,
  } = useActivityCenter();

  const profile = people[activeConvoUid];
  const convoMessages = messages[activeConvoUid] || [];

  // Auto-scroll to bottom on conversation change or new message
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [convoMessages.length, isPartnerTyping, activeConvoUid]);

  // Entrance bubble cascade on conversation switch
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bubbles = threadRef.current?.querySelectorAll(".chat-bubble");
        if (bubbles && bubbles.length > 0) {
          gsap.from(bubbles, {
            y: 14,
            autoAlpha: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          });
        }
      });
    },
    { dependencies: [activeConvoUid], scope: containerRef }
  );

  // Typing indicator dot bounce animation
  useGSAP(
    () => {
      if (!isPartnerTyping || !typingDotsRef.current) return;

      const dots = typingDotsRef.current.querySelectorAll("i");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(dots, {
          y: -5,
          duration: 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.12,
        });
      });
    },
    { dependencies: [isPartnerTyping], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="chat flex flex-col min-w-0 flex-1 min-h-0">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b-nb border-nb-ink bg-nb-white">
        <Avatar uid={activeConvoUid} size="md" />
        <div className="min-w-0 flex-1">
          <b className="block text-base font-bold text-nb-ink truncate">
            {profile ? profile.name : activeConvoUid}
          </b>
          <span className="text-[13px] text-nb-muted truncate">
            {profile ? `${profile.major} · ${profile.year}` : "CECS Student"}
          </span>
        </div>
      </div>

      {/* Message thread */}
      <ol
        ref={threadRef}
        className="thread flex-1 min-h-0 overflow-y-auto p-4.5 flex flex-col gap-3 bg-nb-paper m-0 list-none"
      >
        {convoMessages.map((msg, index) => {
          const isMine = msg.senderId === "me";
          return (
            <li
              key={msg.id || index}
              className={`chat-bubble max-w-[78%] px-3.5 py-2.5 border-2 border-nb-ink rounded-2xl leading-[1.45] shadow-nb-sm overflow-anywhere ${
                isMine
                  ? "self-end bg-nb-ink text-nb-white rounded-br-[6px]"
                  : "self-start bg-nb-white text-nb-ink rounded-bl-[6px]"
              }`}
            >
              <span>{msg.text}</span>
              <span className="block mt-1 font-nb-mono text-[10px] opacity-65">
                {msg.timestamp}
              </span>
            </li>
          );
        })}

        {/* Typing indicator */}
        {isPartnerTyping && (
          <li
            aria-label={`${profile ? profile.name : "Partner"} is typing`}
            className="self-start inline-flex gap-1.5 px-3.5 py-3 border-2 border-nb-ink rounded-2xl rounded-bl-[6px] bg-nb-white shadow-nb-sm"
          >
            <span ref={typingDotsRef} className="inline-flex gap-1.5">
              <i className="w-[7px] h-[7px] rounded-full bg-nb-ink block" />
              <i className="w-[7px] h-[7px] rounded-full bg-nb-ink block" />
              <i className="w-[7px] h-[7px] rounded-full bg-nb-ink block" />
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}
