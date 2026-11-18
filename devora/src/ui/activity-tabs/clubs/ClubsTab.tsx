// Clubs Directory tab (/activity/clubs): static list of CECS-related student orgs.
// Flow: CLUBS from clubs-list.ts → one card each (gradient header, description, meeting info, link/contact).
// Meeting info and links are placeholders until verified — cards say so with a "To verify" tag.

// ===== IMPORTS =====

import {
  NB_TONE,
  NB_TONE_CYCLE,
  NbCard,
  SectionHeader,
  StubNote,
  TagPill,
  staggerStyle,
} from "@/ui/shared/design-law/nb-parts";

import { CLUBS } from "./clubs-list";

// ===== MAIN COMPONENT =====

/**
 * Clubs Directory tab. Static data — edit src/ui/activity-tabs/clubs/clubs-list.ts.
 */
export default function ClubsTab() {
  return (
    <section aria-label="Clubs Directory">
      <SectionHeader
        eyebrow={`${CLUBS.length} student orgs`}
        title="Clubs directory"
        blurb="CECS-related student organizations at UM-Dearborn. Details are being verified."
      />

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CLUBS.map((club, index) => (
          <li key={club.id} style={staggerStyle(index)} className="motion-safe:animate-nb-rise">
            <NbCard interactive className="flex h-full flex-col overflow-hidden">
              {/* Gradient header band. Manipulate here: NB_TONE_CYCLE order sets the colors */}
              <div
                className={`flex items-center justify-between gap-3 border-b-nb border-nb-ink px-5 py-4 ${
                  NB_TONE[NB_TONE_CYCLE[index % NB_TONE_CYCLE.length]]
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[9px] border-2 border-nb-ink bg-white p-1 shadow-[2px_2px_0px_#0a0a0a] overflow-hidden flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/clubs/logos/${club.id}.png`}
                      alt={`${club.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement)?.style.setProperty("display", "none");
                      }}
                    />
                  </div>
                  <span className="font-nb-display text-2xl tracking-[-0.01em]">{club.shortName}</span>
                </div>
                {club.verified ? null : <TagPill tone="white">To verify</TagPill>}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-lg font-bold leading-snug">{club.name}</h3>
                <p className="text-[15px] leading-relaxed text-nb-muted">{club.description}</p>

                <dl className="mt-auto space-y-2 border-t-2 border-nb-ink pt-4 text-sm">
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Meetings</dt>
                    <dd className="mt-0.5">{club.meetingInfo}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Contact</dt>
                    <dd className="mt-0.5">
                      {/* Only real, verified links get rendered as anchors */}
                      {club.link ? (
                        <a
                          href={club.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] border-2 border-nb-ink bg-white font-mono text-xs font-black uppercase tracking-wider text-nb-ink shadow-[2.5px_2.5px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                        >
                          <span>View Official Page</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        club.contactNote
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </NbCard>
          </li>
        ))}
      </ul>

      <StubNote>
        Meeting times and links are placeholders. Confirm each club&apos;s details, then fill in{" "}
        <code>clubs-list.ts</code> and set <code>verified: true</code>.
      </StubNote>
    </section>
  );
}
