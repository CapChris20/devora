// Keep stored and rendered social links on the safe https scheme only.
// Flow: trim → reject blank → parse → allow https only → optional host check for known sites.
// Used when saving onboarding/editor links and when rendering Discovery / Account anchors.
// WHY: javascript: and data: URLs in href cause stored XSS when a classmate clicks the icon.

// ===== NAMED CONSTANTS =====

const HTTPS_PROTOCOL = "https:";
const EMPTY_URL = "";

// Hosts we accept for the three social fields. www. is stripped before compare.
const GITHUB_HOSTS = ["github.com"] as const;
const LINKEDIN_HOSTS = ["linkedin.com"] as const;
const INSTAGRAM_HOSTS = ["instagram.com"] as const;

// ===== TYPES =====

export type SocialLinkKind = "github" | "linkedin" | "instagram";

// ===== HELPER FUNCTIONS =====

function readHostWithoutWww(hostname: string): string {
  // vocab: toLowerCase = treat GitHub.com the same as github.com
  const lowerHost = hostname.toLowerCase();
  if (lowerHost.startsWith("www.")) {
    return lowerHost.slice(4);
  }
  return lowerHost;
}

function doesHostMatchAllowlist(hostname: string, allowedHosts: readonly string[]): boolean {
  const normalizedHost = readHostWithoutWww(hostname);
  return allowedHosts.some(
    (allowedHost) =>
      normalizedHost === allowedHost || normalizedHost.endsWith(`.${allowedHost}`)
  );
}

function readAllowedHostsForKind(kind: SocialLinkKind): readonly string[] {
  if (kind === "github") {
    return GITHUB_HOSTS;
  }
  if (kind === "linkedin") {
    return LINKEDIN_HOSTS;
  }
  return INSTAGRAM_HOSTS;
}

// ===== MAIN FUNCTIONS =====

/**
 * Return a safe https URL, or an empty string when the value is missing or unsafe.
 * Rejects javascript:, data:, and any non-https scheme so href cannot run script.
 * @param rawUrl - Whatever the student typed or what Firestore already stored
 * @returns A normalized https URL, or "" when it must not be rendered or saved
 */
export function sanitizeSafeHttpsUrl(rawUrl: string | undefined | null): string {
  const trimmedUrl = (rawUrl ?? "").trim();
  if (!trimmedUrl) {
    return EMPTY_URL;
  }

  // Students often paste "github.com/user" without a scheme. Assume https for that case.
  const urlWithScheme = trimmedUrl.includes("://") ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    // vocab: URL = browser/Node parser that splits protocol, host, path
    const parsedUrl = new URL(urlWithScheme);
    if (parsedUrl.protocol !== HTTPS_PROTOCOL) {
      return EMPTY_URL;
    }
    return parsedUrl.toString();
  } catch {
    // Malformed strings must never become href values.
    return EMPTY_URL;
  }
}

/**
 * Same as sanitizeSafeHttpsUrl, plus a host allowlist for one social network.
 * @param rawUrl - Typed or stored link
 * @param kind - Which social field this value belongs to
 * @returns Safe https URL on an allowed host, or ""
 */
export function sanitizeSocialProfileUrl(
  rawUrl: string | undefined | null,
  kind: SocialLinkKind
): string {
  const safeUrl = sanitizeSafeHttpsUrl(rawUrl);
  if (!safeUrl) {
    return EMPTY_URL;
  }

  const parsedUrl = new URL(safeUrl);
  const allowedHosts = readAllowedHostsForKind(kind);
  if (!doesHostMatchAllowlist(parsedUrl.hostname, allowedHosts)) {
    return EMPTY_URL;
  }

  return safeUrl;
}
