// Peek overlay for a Discovery card — public fields only, until a real profile route exists.
// Flow: View profile → this dialog scales in → Connect (or Connect + optional note) → Close.
// Clubs + looking-for live here so faculty can talk through org/job-adjacent tags.

"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import type { DiscoveryProfile } from "../mock-profiles";
import DiscoveryAvatar from "./DiscoveryAvatar";
import { DiscoverySocialLinks } from "./DiscoveryProfileCard";

// How long an optional first message can be. Firestore DMs are not wired yet —
// this is the UI contract so the faculty demo can show both connect paths.
// Manipulate here: raise for longer notes; keep under ~300 so the peek still fits
const CONNECT_NOTE_MAX = 200;

type DiscoveryProfilePeekProps = {
  profile: DiscoveryProfile;
  onClose: () => void;
  // true after this student was already requested in this session
  requested?: boolean;
  // vocab: note = optional first message; empty string = Connect with no note
  onConnect: (note: string) => void;
};

export default function DiscoveryProfilePeek({
  profile,
  onClose,
  requested = false,
  onConnect,
}: DiscoveryProfilePeekProps) {
  // vocab: useReducedMotion = Framer hook — skip scale/slide when OS Reduce motion is on
  const reduceMotion = useReducedMotion();
  // true while the optional-note composer is open (second Connect button)
  const [composing, setComposing] = useState(false);
  const [note, setNote] = useState("");

  function sendConnect(withNote: boolean) {
    // Trim so whitespace-only notes count as “no message”
    onConnect(withNote ? note.trim() : "");
    setComposing(false);
    setNote("");
  }

  return (
    <motion.div
      className="discovery-peek-backdrop"
      onClick={onClose}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Stop backdrop clicks from closing when they hit the sheet itself */}
      <motion.div
        className="discovery-peek"
        data-accent={profile.accent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-peek-title"
        onClick={(e) => e.stopPropagation()}
        // vocab: scale = grow from 96% so it feels like the grid card opening up
        initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
        // Manipulate here: duration / ease — [0.16, 1, 0.3, 1] is the same snap as PageReveal
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          className="discovery-peek-close"
          aria-label="Close profile"
          onClick={onClose}
        >
          <X size={16} />
        </button>

        {/* Hero: PFP beside name / major / rank / socials (stacks on small screens). */}
        <header className="discovery-peek-hero">
          <DiscoveryAvatar
            id={profile.id}
            displayName={profile.displayName}
            accent={profile.accent}
            size="peek"
          />
          <div className="discovery-peek-copy">
            <h2 id="discovery-peek-title" className="discovery-card-name page-card-name">
              {profile.displayName}
            </h2>
            <p className="discovery-card-major">{profile.major}</p>
            <p className="discovery-card-rank">
              {profile.classRank}
              {profile.concentration ? ` · ${profile.concentration}` : ""}
            </p>
            <DiscoverySocialLinks links={profile.links} />
          </div>
        </header>

        <p className="discovery-peek-bio">{profile.bio}</p>

        <div className="discovery-peek-grid">
          <PeekBlock title="Career path" items={profile.careerNiche} />
          <PeekBlock title="Interests" items={profile.casualInterests} />
          <PeekBlock title="Looking for" items={profile.lookingFor} />
          <PeekBlock title="Clubs & orgs" items={profile.clubs} />
        </div>

        {/* Two connect paths: one-tap, or the same request with an optional first message.
            Firestore connection writes come later — this session just marks Requested. */}
        <div
          className={`discovery-peek-actions${requested || composing ? " discovery-peek-actions-single" : ""}`}
        >
          {requested ? (
            <button type="button" className="page-btn-outline page-btn-grad-logo" disabled>
              Requested
            </button>
          ) : composing ? (
            <div className="discovery-peek-compose">
              <label className="discovery-peek-compose-label" htmlFor="discovery-connect-note">
                First message{" "}
                <span className="discovery-peek-compose-optional">(optional)</span>
              </label>
              <textarea
                id="discovery-connect-note"
                className="sign-in-input discovery-peek-compose-input"
                placeholder={`Say hi to ${profile.displayName.split(" ")[0]}…`}
                value={note}
                maxLength={CONNECT_NOTE_MAX}
                rows={3}
                autoFocus
                onChange={(event) => setNote(event.target.value)}
              />
              <p className="discovery-peek-compose-count">
                {note.trim().length}/{CONNECT_NOTE_MAX}
              </p>
              <div className="discovery-peek-compose-row">
                <button
                  type="button"
                  className="page-btn-outline discovery-btn-violet"
                  onClick={() => {
                    setComposing(false);
                    setNote("");
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="page-btn-outline page-btn-grad-logo"
                  onClick={() => sendConnect(true)}
                >
                  Connect
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="page-btn-outline page-btn-grad-logo"
                onClick={() => sendConnect(false)}
              >
                Connect
              </button>
              <button
                type="button"
                className="page-btn-outline discovery-btn-ember"
                onClick={() => setComposing(true)}
              >
                Connect with a message
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PeekBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="discovery-peek-block">
      <p className="discovery-chip-label">{title}</p>
      <div className="discovery-tag-row">
        {items.map((item) => (
          <span key={item} className="discovery-tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
