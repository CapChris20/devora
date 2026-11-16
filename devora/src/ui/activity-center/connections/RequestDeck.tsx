// RequestDeck component for incoming connection requests.
// Renders card deck with ghost cards behind the top card.
// Animates Accept with right-fling and Decline with left-fling using GSAP power2.in ease.

"use client";

// ===== IMPORTS =====

import { useRef } from "react";
import gsap from "gsap";

import { useActivityCenter } from "../ActivityCenterContext";
import Avatar from "../shared/Avatar";
import EmptyState from "../shared/EmptyState";

// ===== MAIN COMPONENT =====

export default function RequestDeck() {
  const cardRef = useRef<HTMLElement>(null);
  const { requests, people, acceptRequest, declineRequest } = useActivityCenter();

  const handleDecision = (accept: boolean) => {
    if (!requests.length) return;
    const currentRequest = requests[0];

    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      if (accept) {
        acceptRequest(currentRequest.uid);
      } else {
        declineRequest(currentRequest.uid);
      }
    };

    if (isReducedMotion || !cardRef.current) {
      finish();
    } else {
      gsap.to(cardRef.current, {
        x: accept ? 220 : -220,
        y: -24,
        rotation: accept ? 12 : -12,
        autoAlpha: 0,
        duration: 0.45,
        ease: "power2.in",
        onComplete: finish,
      });
    }
  };

  return (
    <section aria-label="Requests" data-in className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3.5 after:content-[''] after:flex-1 after:h-[3px] after:bg-nb-ink after:rounded-[3px]">
        <h3 className="m-0 text-lg font-bold whitespace-nowrap text-nb-ink">
          Requests
        </h3>
        <span className="font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted whitespace-nowrap">
          {requests.length} pending
        </span>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="New connection requests will land here."
        />
      ) : (
        <div>
          {/* Deck with ghost cards */}
          <div className="relative pb-4.5">
            {/* Ghost card layer 2 */}
            {requests.length > 2 && (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 bottom-4.5 border-nb border-nb-ink rounded-nb bg-nb-paper translate-x-4 translate-y-4.5 rotate-3"
              />
            )}

            {/* Ghost card layer 1 */}
            {requests.length > 1 && (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 bottom-4.5 border-nb border-nb-ink rounded-nb bg-nb-soft translate-x-2 translate-y-2.25 rotate-[1.5deg]"
              />
            )}

            {/* Active top request card */}
            <article
              ref={cardRef}
              id="request-card"
              className="card request relative z-10 p-5.5 flex flex-col gap-3.5 bg-nb-white border-nb border-nb-ink rounded-nb shadow-nb-card"
            >
              {(() => {
                const topRequest = requests[0];
                const profile = people[topRequest.uid];
                return (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Avatar uid={topRequest.uid} size="lg" />
                      <div className="min-w-0">
                        <p className="m-0 text-xl font-bold text-nb-ink leading-tight">
                          {profile ? profile.name : topRequest.uid}
                        </p>
                        <p className="mt-0.5 font-nb-mono text-[11px] font-bold tracking-[0.14em] uppercase text-nb-muted">
                          {profile
                            ? `${profile.major} · ${profile.year}`
                            : "CECS Student"}
                        </p>
                      </div>
                    </div>

                    <p className="m-0 p-2.5 sm:px-3 sm:py-2.5 border-2 border-nb-ink rounded-md bg-nb-paper text-sm text-nb-ink leading-normal">
                      {topRequest.note}
                    </p>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDecision(true)}
                        className="btn flex-1 min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-ink text-nb-white font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(false)}
                        className="btn ghost flex-1 min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-white text-nb-ink font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </>
                );
              })()}
            </article>
          </div>

          {requests.length > 1 && (
            <p className="mt-2.5 text-[13px] text-nb-muted">
              {requests.length - 1} more waiting behind this one
            </p>
          )}
        </div>
      )}
    </section>
  );
}
