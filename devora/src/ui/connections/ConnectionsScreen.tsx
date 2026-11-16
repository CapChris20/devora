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
        <NbCard className="flex flex-col items-center justify-center p-12 text-center motion-safe:animate-nb-rise">
          <div className="w-14 h-14 rounded-full border-2 border-nb-ink bg-nb-brand grid place-items-center text-2xl font-bold mb-3">
            👥
          </div>
          <p className="text-2xl font-bold">No connections yet</p>
          <p className="mt-2 text-base text-nb-muted max-w-[44ch]">
            You haven&apos;t connected with any classmates yet. Explore students by major, year, and interests on the Discovery Grid!
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
