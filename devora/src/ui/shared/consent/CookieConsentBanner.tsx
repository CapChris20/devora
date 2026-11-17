// Fixed cookie consent bar — disclose essential storage and gate optional analytics.
// Flow: mount → read consent → show bar until Accept or Reject → persist choice.
// Used from AppWrapper so every route can honor the choice. Analytics stay off until Accept.
// Neo-brutalist styling matching Devora design law: solid opaque surface, crisp borders, zero transparent bleed.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

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
  "Devora uses essential browser storage to keep you signed in and remember your dark/light mode preference. Optional analytics stay off unless you accept.";
const LEARN_MORE_LABEL = "Cookie Policy";
const PRIVACY_LINK_LABEL = "Privacy Policy";
const ACCEPT_LABEL = "Accept analytics";
const REJECT_LABEL = "Essential only";
const OPEN_SETTINGS_EVENT = "devora:open-cookie-settings";

// ===== HELPER FUNCTIONS =====

function readInitialConsent(): CookieConsentValue {
  return readCookieConsent();
}

// ===== MAIN COMPONENT =====

/**
 * Site-wide cookie banner. Hidden after the student accepts or rejects analytics.
 * Built with solid neo-brutalist surfaces, high contrast, and crisp borders.
 */
export default function CookieConsentBanner() {
  const [consentValue, setConsentValue] = useState<CookieConsentValue | "pending">(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    setConsentValue(readInitialConsent() ?? "pending");

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
    <aside
      className={`fixed inset-x-0 bottom-0 z-[100] px-4 py-4 sm:px-8 transition-colors duration-200 ${
        isLight
          ? "bg-white border-t-[3px] border-[#0a0a0a] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] text-[#0a0a0a]"
          : "bg-[#0e0918] border-t-[2.5px] border-[#ff5ca8] shadow-[0_-8px_30px_rgba(0,0,0,0.85)] text-white"
      }`}
      role="dialog"
      aria-label={BANNER_TITLE}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex max-w-3xl flex-col gap-1 text-left">
          <p
            className={`font-mono text-sm font-extrabold uppercase tracking-[0.08em] ${
              isLight ? "text-[#0a0a0a]" : "text-[#ffd76f]"
            }`}
          >
            {BANNER_TITLE}
          </p>
          <p
            className={`font-mono text-xs sm:text-[13px] leading-relaxed ${
              isLight ? "text-[#374151]" : "text-[#d1c7d8]"
            }`}
          >
            {BANNER_BODY}{" "}
            <Link
              href={COOKIES_POLICY_PATH}
              className={`font-bold underline underline-offset-2 ${
                isLight
                  ? "text-[#c2185b] hover:text-[#0a0a0a]"
                  : "text-[#ff5ca8] hover:text-[#ffd76f]"
              }`}
            >
              {LEARN_MORE_LABEL}
            </Link>
            {" · "}
            <Link
              href={PRIVACY_POLICY_PATH}
              className={`font-bold underline underline-offset-2 ${
                isLight
                  ? "text-[#c2185b] hover:text-[#0a0a0a]"
                  : "text-[#ff5ca8] hover:text-[#ffd76f]"
              }`}
            >
              {PRIVACY_LINK_LABEL}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            className={`h-10 px-4.5 rounded-lg font-mono text-xs font-bold uppercase tracking-[0.08em] cursor-pointer transition-all duration-150 select-none ${
              isLight
                ? "bg-[#f4f4f2] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-[#e5e5e0] active:translate-x-0.5 active:translate-y-0.5"
                : "bg-[#18121d] text-white border-2 border-[rgba(255,255,255,0.2)] shadow-[2px_2px_0px_#000000] hover:border-[#ff5ca8] active:translate-x-0.5 active:translate-y-0.5"
            }`}
            onClick={() => saveConsent(COOKIE_CONSENT_REJECTED)}
          >
            {REJECT_LABEL}
          </button>
          <button
            type="button"
            className={`h-10 px-5 rounded-lg font-mono text-xs font-extrabold uppercase tracking-[0.08em] cursor-pointer transition-all duration-150 select-none bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5`}
            onClick={() => saveConsent(COOKIE_CONSENT_ACCEPTED)}
          >
            {ACCEPT_LABEL}
          </button>
        </div>
      </div>
    </aside>
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
