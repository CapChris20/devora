// /messages — 1:1 DMs. Own NavBar link (not an Activity Center tab).
// Thin route file; the UI lives in src/ui/messages/MessagesScreen.tsx.

import type { Metadata } from "next";

import DesignLawPage from "@/ui/shared/design-law/DesignLawPage";
import MessagesScreen from "@/ui/messages/MessagesScreen";

export const metadata: Metadata = {
  title: "Messages — Devora",
  description: "Direct messages with CECS students you've connected with.",
};

export default function MessagesPage() {
  return (
    <DesignLawPage
      navLabel="Messages"
      eyebrow="Direct messages"
      title="Messages"
      blurb="Pick up where you left off with classmates and study partners."
    >
      <MessagesScreen />
    </DesignLawPage>
  );
}
