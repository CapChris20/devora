// Root URL (/) sends visitors straight to the landing page at /home.
// Flow: browser hits "/" → Next server redirect → the user lands on /home.

// ===== IMPORTS =====

import { redirect } from "next/navigation";

// ===== NAMED CONSTANTS =====

// Manipulate here: change this path if the marketing landing moves.
const LANDING_PAGE_PATH = "/home";

// ===== MAIN COMPONENT =====

/**
 * Server redirect from the site root to the marketing homepage.
 * @returns Never renders. Next sends the browser to /home.
 */
export default function Home() {
  // vocab: redirect = Next.js helper that sends the browser to another path
  redirect(LANDING_PAGE_PATH);
}
