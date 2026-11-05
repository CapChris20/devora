// Fixed cookie consent bar — disclose essential storage and gate optional analytics.
// Flow: mount → read consent → show bar until Accept or Reject → persist choice.
// Used from AppWrapper so every route can honor the choice. Analytics stay off until Accept.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_REJECTED,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentValue,
} from "@/backend/privacy/cookie-consent";

// ===== NAMED CONSTANTS =====

const COOKIES_POLICY_PATH = "/cookies-page";
const PRIVACY_POLICY_PATH = "/privacy-page";
const BANNER_TITLE = "Cookies & privacy";
const BANNER_BODY =
  "Devora uses essential browser storage to keep you signed in and remember dark/light mode. Optional analytics stay off unless you accept. ";
const LEARN_MORE_LABEL = "Cookie Policy";
const PRIVACY_LINK_LABEL = "Privacy Policy";
const ACCEPT_LABEL = "Accept analytics";
const REJECT_LABEL = "Essential only";
const OPEN_SETTINGS_EVENT = "devora:open-cookie-settings";

const BANNER_CLASS =
  "cookie-consent-banner fixed inset-x-0 bottom-0 z-[80] border-t px-4 py-4 sm:px-6";
const INNER_CLASS =
  "mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6";
const COPY_CLASS = "flex max-w-3xl flex-col gap-1 text-left";
const TITLE_CLASS = "font-display text-sm font-bold theme-heading";
const BODY_CLASS = "theme-muted font-display text-xs leading-relaxed sm:text-sm";
const LINK_CLASS = "font-semibold text-[#ff5ca8] underline-offset-2 hover:text-[#22d3ee] hover:underline";
const ACTIONS_CLASS = "flex flex-wrap items-center gap-2";
const PRIMARY_BUTTON_CLASS = "cookie-consent-accept font-display text-xs font-bold uppercase tracking-[0.12em]";
const SECONDARY_BUTTON_CLASS =
  "cookie-consent-reject font-display text-xs font-bold uppercase tracking-[0.12em]";

// ===== HELPER FUNCTIONS =====

function readInitialConsent(): CookieConsentValue {
  return readCookieConsent();
}

// ===== MAIN COMPONENT =====

/**
 * Site-wide cookie banner. Hidden after the student accepts or rejects analytics.
 * @returns The banner, or null when a choice is already saved
 */
export default function CookieConsentBanner() {
  // null = still checking storage; string = saved; "pending" means show the bar
  const [consentValue, setConsentValue] = useState<CookieConsentValue | "pending">(null);

  useEffect(() => {
    setConsentValue(readInitialConsent() ?? "pending");

    // Footer “Cookie settings” can re-open the bar without a full reload.
    // vocab: CustomEvent = app-wide signal that does not need a global state library
    const openSettings = () => {
      setConsentValue("pending");
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => {
      window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const saveConsent = (
    nextValue: typeof COOKIE_CONSENT_ACCEPTED | typeof COOKIE_CONSENT_REJECTED
  ) => {
    writeCookieConsent(nextValue);
    setConsentValue(nextValue);
  };

  if (consentValue !== "pending") {
    return null;
  }

  return (
    // site styles for glass/border live in globals.css under .cookie-consent-*
    <div className={BANNER_CLASS} role="dialog" aria-label={BANNER_TITLE} aria-live="polite">
      <div className={INNER_CLASS}>
        <div className={COPY_CLASS}>
          <p className={TITLE_CLASS}>{BANNER_TITLE}</p>
          <p className={BODY_CLASS}>
            {BANNER_BODY}
            <Link href={COOKIES_POLICY_PATH} className={LINK_CLASS}>
              {LEARN_MORE_LABEL}
            </Link>
            {" · "}
            <Link href={PRIVACY_POLICY_PATH} className={LINK_CLASS}>
              {PRIVACY_LINK_LABEL}
            </Link>
          </p>
        </div>

        <div className={ACTIONS_CLASS}>
          <button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            onClick={() => saveConsent(COOKIE_CONSENT_REJECTED)}
          >
            {REJECT_LABEL}
          </button>
          <button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            onClick={() => saveConsent(COOKIE_CONSENT_ACCEPTED)}
          >
            {ACCEPT_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Ask the banner to show again (footer Cookie settings link).
 */
export function openCookieConsentSettings(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
