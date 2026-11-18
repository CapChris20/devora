// /connections — students you're connected with. Own NavBar link (not an Campus Hub tab).
// Thin route file; the UI lives in src/ui/connections/ConnectionsScreen.tsx.

import type { Metadata } from "next";

import DesignLawPage from "@/ui/shared/design-law/DesignLawPage";
import ConnectionsScreen from "@/ui/connections/ConnectionsScreen";

export const metadata: Metadata = {
  title: "Connections — Devora",
  description: "CECS students you're connected with on Devora.",
};

export default function ConnectionsPage() {
  return (
    <DesignLawPage
      navLabel="Connections"
      eyebrow="Your network"
      title="Connections"
      blurb="Everyone you've connected with across CECS, one tap from a message."
    >
      <ConnectionsScreen />
    </DesignLawPage>
  );
}
