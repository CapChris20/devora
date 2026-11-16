// Connections page content (/connections): students you're connected with, with a Message button.
// Uses real connection data when available, and displays an empty state prompting students to explore the Discovery Grid when 0 connections exist.

"use client";

// ===== IMPORTS =====

import { useState } from "react";
import type { Connection } from "@/types/activity";
import {
  NB_TONE_CYCLE,
  InitialsAvatar,
  NbCard,
  NbLinkButton,
  SectionHeader,
  staggerStyle,
} from "@/ui/shared/design-law/nb-parts";

// ===== NAMED CONSTANTS =====

const MESSAGES_PATH = "/messages";

// ===== MAIN COMPONENT =====

export default function ConnectionsScreen() {
  const [connections] = useState<Connection[]>([]);

  return (
    <section aria-label="Connections">
      <SectionHeader
        eyebrow={`${connections.length} connected`}
        title="Your people"
        blurb="Students you've connected with. Find more by major, year and interests on the Discovery Grid."
        action={
          <NbLinkButton href="/find-students" tone="ink">
            Find students
          </NbLinkButton>
        }
      />

      {connections.length === 0 ? (
        <NbCard className="relative overflow-hidden flex flex-col items-center justify-center p-10 sm:p-14 text-center motion-safe:animate-nb-rise">
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-3 right-4 font-mono text-[10px] font-bold tracking-[0.2em] text-nb-ink/20 uppercase"
          >
            NETWORK // 00_NULL
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
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border-2 border-nb-ink bg-nb-paper font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-nb-ink">
            <span className="w-2 h-2 rounded-full bg-nb-brand animate-pulse border border-nb-ink" />
            <span>DIRECTORY // 0_CONNECTIONS</span>
          </div>
          <h3 className="m-0 text-2xl font-bold tracking-tight text-nb-ink">No connections yet</h3>
          <p className="mt-2 text-base text-nb-muted max-w-[44ch] leading-relaxed">
            You haven&apos;t connected with any classmates yet. Explore students by major, year, and courses on the Discovery Grid to build your study network!
          </p>
          <NbLinkButton href="/find-students" tone="ink" className="mt-5">
            Browse Discovery Grid
          </NbLinkButton>
        </NbCard>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {connections.map((connection, index) => (
            <li key={connection.uid} style={staggerStyle(index)} className="motion-safe:animate-nb-rise">
              <NbCard interactive className="flex items-center gap-4 p-4 sm:p-5">
                <InitialsAvatar name={connection.displayName} tone={NB_TONE_CYCLE[index % NB_TONE_CYCLE.length]} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold leading-tight">{connection.displayName}</p>
                  <p className="mt-1 truncate text-sm text-nb-muted">{connection.major}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted/80">
                    {connection.year}
                  </p>
                </div>
                <NbLinkButton href={MESSAGES_PATH} tone="white" className="shrink-0 px-4">
                  Message
                </NbLinkButton>
              </NbCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
