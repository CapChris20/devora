"use client";

import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

import { app } from "./client";

let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}
