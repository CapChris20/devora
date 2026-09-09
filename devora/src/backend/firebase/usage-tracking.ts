// Turns on Firebase Analytics in the browser when supported.
// Flow: skip on server → reuse instance → check isSupported → getAnalytics(app).
// Skipped on server and in browsers that don't support Analytics.

"use client";

import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

import { app } from "./start-firebase";

// Keep one shared instance so we don’t create Analytics twice.
// vocab: Analytics = Firebase usage-tracking object (page views, events)
let analyticsInstance: Analytics | null = null;

// This function is the safe on-ramp for Analytics — never crashes SSR or private browsers.
// Call it when you want to log events; null means “tracking unavailable, skip quietly.”
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  // Analytics only runs in the browser (not during Next.js server render).
  // vocab: typeof window === "undefined" = we’re on the server, not in a browser
  // Why return null? Server code must not touch browser-only APIs.
  if (typeof window === "undefined") {
    return null;
  }

  // Return the instance we already created (avoid double init on remounts).
  if (analyticsInstance) {
    return analyticsInstance;
  }

  // Some browsers / privacy modes don't support Analytics.
  // vocab: await = wait for the support check Promise to finish
  // vocab: isSupported = Firebase helper that returns true/false for this browser
  const supported = await isSupported();
  // Manipulate here: force `return null` above this block to disable Analytics everywhere
  if (!supported) {
    return null;
  }

  // vocab: getAnalytics(app) = attach Analytics to the same Firebase app as auth/db
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}
