// Chat composer input form.
// Text field and Send button for sending direct messages to connected students.

"use client";

// ===== IMPORTS =====

import { useState, type FormEvent } from "react";

import { useActivityCenter } from "../ActivityCenterContext";

// ===== MAIN COMPONENT =====

export default function MessageInput() {
  const [draft, setDraft] = useState("");
  const { activeConvoUid, people, sendMessage } = useActivityCenter();

  const profile = people[activeConvoUid];
  const firstName = profile ? profile.name.split(" ")[0] : "peer";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 p-3 bg-nb-white">
      <label htmlFor="draft" className="sr-only">
        Message {profile ? profile.name : activeConvoUid}
      </label>
      <input
        id="draft"
        type="text"
        autoComplete="off"
        placeholder={`Message ${firstName}…`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="flex-1 min-w-0 min-h-[46px] px-3.5 rounded-nb border-nb border-nb-ink bg-nb-white text-[15px] text-nb-ink outline-none focus:shadow-nb-sm"
      />
      <button
        type="submit"
        className="btn min-h-[46px] px-4.5 rounded-nb border-nb border-nb-ink bg-nb-ink text-nb-white font-bold text-[15px] shadow-nb transition-all duration-120 hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-nb-sm"
      >
        Send
      </button>
    </form>
  );
}
