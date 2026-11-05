// Cookie / analytics consent helpers for the site-wide banner.
// Flow: read localStorage → decide whether to show the banner → save Accept / Reject.
// Used by CookieConsentBanner and by usage-tracking before Firebase Analytics starts.
// Lives under backend/privacy so Firebase helpers do not import from ui/.
// Manipulate here: change STORAGE_KEY if you need to re-prompt every user after a policy rewrite.

// ===== NAMED CONSTANTS =====

export const COOKIE_CONSENT_STORAGE_KEY = "devora-cookie-consent";
export const COOKIE_CONSENT_ACCEPTED = "accepted";
export const COOKIE_CONSENT_REJECTED = "rejected";

// ===== TYPES =====

export type CookieConsentValue =
  | typeof COOKIE_CONSENT_ACCEPTED
  | typeof COOKIE_CONSENT_REJECTED
  | null;

// ===== MAIN FUNCTIONS =====

/**
 * Read the saved consent choice from localStorage.
 * @returns "accepted", "rejected", or null when the user has not chosen yet
 */
export function readCookieConsent(): CookieConsentValue {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // vocab: localStorage = browser key/value store for this origin
    const savedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (savedValue === COOKIE_CONSENT_ACCEPTED || savedValue === COOKIE_CONSENT_REJECTED) {
      return savedValue;
    }
    return null;
  } catch {
    // Private mode / blocked storage → treat as no choice yet.
    return null;
  }
}

/**
 * Save Accept or Reject so the banner can hide and analytics can gate itself.
 * @param consentValue - "accepted" or "rejected"
 */
export function writeCookieConsent(
  consentValue: typeof COOKIE_CONSENT_ACCEPTED | typeof COOKIE_CONSENT_REJECTED
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, consentValue);
  } catch {
    // If storage is blocked, the banner may reappear next visit — that is safer than failing open for analytics.
  }
}

/**
 * True only when the student explicitly accepted analytics cookies.
 * @returns Whether Firebase Analytics is allowed to initialize
 */
export function hasAcceptedAnalyticsConsent(): boolean {
  return readCookieConsent() === COOKIE_CONSENT_ACCEPTED;
}
