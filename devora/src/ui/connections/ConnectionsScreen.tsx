// Connections page content (/connections): students you're connected with, with a Message button.
// Flow: placeholder connections → one card per student (avatar, name, major, year, Message).
// TODO(firestore): connections live at /users/{uid}/connections/{otherUid}. Read the signed-in
//   user's subcollection; the Message button should open (or create) their /conversations doc.

// ===== IMPORTS =====

import {
  NB_TONE_CYCLE,
  InitialsAvatar,
  NbCard,
  NbLinkButton,
  SectionHeader,
  StubNote,
  staggerStyle,
} from "@/ui/shared/design-law/nb-parts";

import { PLACEHOLDER_CONNECTIONS } from "./placeholder-data";

// ===== NAMED CONSTANTS =====

// Manipulate here: where Message sends people (later: /messages?with={uid})
const MESSAGES_PATH = "/messages";

// ===== MAIN COMPONENT =====

/**
 * Connections screen. Placeholder data only — see the TODO at the top of the file.
 */
export default function ConnectionsScreen() {
  return (
    <section aria-label="Connections">
      <SectionHeader
        eyebrow={`${PLACEHOLDER_CONNECTIONS.length} connected`}
        title="Your people"
        blurb="Students you've connected with. Find more by major, year and interests on the Discovery Grid."
        action={
          <NbLinkButton href="/find-students" tone="ink">
            Find students
          </NbLinkButton>
        }
      />

      {PLACEHOLDER_CONNECTIONS.length === 0 ? (
        <NbCard className="p-8 text-center">
          <p className="text-xl font-bold">No connections yet</p>
          <p className="mt-2 text-nb-muted">Start on the Discovery Grid.</p>
        </NbCard>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {PLACEHOLDER_CONNECTIONS.map((connection, index) => (
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
                {/* TODO: pass connection.uid so Messages opens the right thread */}
                <NbLinkButton href={MESSAGES_PATH} tone="white" className="shrink-0 px-4">
                  Message
                </NbLinkButton>
              </NbCard>
            </li>
          ))}
        </ul>
      )}

      <StubNote>
        Placeholder students. Wire up <code>/users/{"{uid}"}/connections</code> in Firestore.
      </StubNote>
    </section>
  );
}
