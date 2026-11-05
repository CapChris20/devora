// Turn on Firebase Analytics in the browser only after cookie consent and support checks.
// Flow: skip on server → require Accept analytics → reuse instance → isSupported → getAnalytics.
// Callers treat null as "tracking is unavailable, skip quietly."

"use client";

// ===== IMPORTS =====

import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

import { hasAcceptedAnalyticsConsent } from "@/backend/privacy/cookie-consent";
import { app } from "./start-firebase";

// ===== NAMED CONSTANTS =====

// One shared instance so a remount does not create Analytics twice.
// vocab: Analytics = Firebase's usage-tracking object (page views, events)
let analyticsInstance: Analytics | null = null;

// ===== MAIN FUNCTION =====

/**
 * Return the shared Analytics instance, or null when tracking cannot run.
 * Null on the server, when consent was not accepted, and in browsers that block Analytics.
 * @returns The Analytics object, or null when it should be skipped
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  // vocab: typeof window === "undefined" = this code is running on the server, not in a browser
  // Server render must not touch browser-only APIs.
  const isRunningOnServer = typeof window === "undefined";
  if (isRunningOnServer) {
    return null;
  }

  // Consent gate: never initialize Analytics until the student taps Accept analytics.
  if (!hasAcceptedAnalyticsConsent()) {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  // vocab: await = wait for this check to finish
  // vocab: isSupported = Firebase helper that returns true or false for this browser
  // Manipulate here: return null above this line to turn Analytics off everywhere
  const isAnalyticsSupported = await isSupported();
  if (!isAnalyticsSupported) {
    return null;
  }

  // vocab: getAnalytics(app) = attach Analytics to the same Firebase app as auth and Firestore
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}
