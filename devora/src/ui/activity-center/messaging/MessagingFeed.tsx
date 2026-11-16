// Messaging tab container component.
// Houses ConversationList, ChatThread, QuickReplies, and MessageInput in a neo-brutalist dual pane card.
// Responsive: on small screens, inbox stacks on top as a horizontal strip.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useActivityCenter } from "../ActivityCenterContext";
import EmptyState from "../shared/EmptyState";
import ChatThread from "./ChatThread";
import ConversationList from "./ConversationList";
import MessageInput from "./MessageInput";
import QuickReplies from "./QuickReplies";

// ===== MAIN COMPONENT =====

export default function MessagingFeed() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { convoOrder } = useActivityCenter();

  // Cascading entrance animation for all [data-in] elements
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = containerRef.current?.querySelectorAll("[data-in]");
        if (items && items.length > 0) {
          gsap.fromTo(
            items,
            {
              y: 34,
              autoAlpha: 0,
              rotation: (i: number) => (i % 2 === 0 ? 1.2 : -1.2),
            },
            {
              y: 0,
              autoAlpha: 1,
              rotation: 0,
              duration: 0.6,
              ease: "back.out(1.5)",
              stagger: 0.055,
              clearProps: "transform,opacity,visibility",
            }
          );
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* Header */}
      <div data-in className="mb-5.5">
        <p className="flex items-center gap-2 mb-2 font-nb-mono text-[11px] font-bold tracking-[0.18em] uppercase text-nb-muted">
          <span
            aria-hidden="true"
            className="w-2.5 h-2.5 rounded-full border-2 border-nb-ink bg-nb-brand flex-shrink-0"
          />
          <span>1-on-1 with your connections</span>
        </p>
        <h2 className="m-0 text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.025em] leading-[1.05] text-nb-ink">
          Messages
        </h2>
        <p className="mt-2 text-base text-nb-muted max-w-[56ch]">
          Coordinate a study session without the cold approach. Only people you&apos;re
          connected with can message you.
        </p>
      </div>

      {convoOrder.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="You can message anyone you're connected with."
          action={
            <button
              type="button"
              onClick={() => router.push("/activity-center/connections")}
              className="btn min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-ink text-nb-white font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
            >
              Go to Connections
            </button>
          }
        />
      ) : (
        /* Dual-pane message center */
        <div
          data-in
          className="card dm grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] overflow-hidden h-auto md:h-[600px] border-nb border-nb-ink rounded-nb bg-nb-white shadow-nb-card"
        >
          <ConversationList />

          <div className="flex flex-col min-w-0 min-h-0 h-[520px] md:h-full">
            <ChatThread />
            <QuickReplies />
            <MessageInput />
          </div>
        </div>
      )}
    </div>
  );
}
