// Root URL (/) — immediately redirects visitors to the landing page at /home.
// Flow: browser hits "/" → Next server redirect → user lands on /home.

import { redirect } from "next/navigation";

// Server redirect: anyone hitting "/" lands on the marketing homepage.
// vocab: redirect = Next.js App Router helper that sends a 307 to another path
// Manipulate here: change "/home" to another path if the marketing landing moves
export default function Home() {
  redirect("/home");
}
