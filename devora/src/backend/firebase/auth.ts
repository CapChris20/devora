// Firebase Auth helpers — Google sign-in, sign-out, UMich email checks.
// Flow: check domain → open Google popup → reject non-UMich → return signed-in user.
// UI uses Google only; email/password functions exist for future use.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";

import { auth } from "./start-firebase";

// Kept for older imports; prefer ALLOWED_EMAIL_DOMAINS below.
export const ALLOWED_EMAIL_DOMAIN = "@umich.edu";

// School domains we accept. Matching uses endsWith on a lowercased email.
// Manipulate here: add another "@campus.edu" string to allow a new school
// vocab/symbol: as const = freeze this list so TypeScript knows the exact strings
export const ALLOWED_EMAIL_DOMAINS = ["@umich.edu", "@umd.umich.edu"] as const;

export const UMICH_ONLY_ERROR =
  "Only University of Michigan (@umich.edu or @umd.umich.edu) email addresses are allowed.";

// True when email ends with @umich.edu or @umd.umich.edu.
export function isUmichEmail(email: string): boolean {
  // vocab: trim/toLowerCase = remove spaces and ignore capital letters for matching
  const normalized = email.trim().toLowerCase();
  // vocab/symbol: .some — true if any domain in the list matches
  // vocab: endsWith(domain) = email must finish with that suffix (not just contain it)
  return ALLOWED_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
}

// Pick the hosted domain Google should show for this email.
// vocab: hosted domain = Google Workspace school (umich.edu vs umd.umich.edu)
export function getUmichHostedDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();

  // Dearborn campus emails use the umd.umich.edu Google workspace.
  // Why before @umich.edu? umd.umich.edu also ends with umich.edu — check the longer one first.
  if (normalized.endsWith("@umd.umich.edu")) {
    return "umd.umich.edu";
  }

  // Ann Arbor / main campus emails use umich.edu.
  if (normalized.endsWith("@umich.edu")) {
    return "umich.edu";
  }

  // vocab/symbol: null = “no match” — caller knows we didn’t recognize the domain
  return null;
}

// Configure Google popup — hint which UMich account to pick from the form email.
// vocab: GoogleAuthProvider = Firebase object that opens “Sign in with Google”
function createGoogleProvider(schoolEmail?: string): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  // vocab: Record<string, string> = plain object of string keys → string values
  const params: Record<string, string> = {
    // Always let them pick which Google account (don’t auto-pick the last one).
    // Manipulate here: remove prompt to let Google auto-select the last used account
    prompt: "select_account",
  };

  // If they typed a school email, tell Google which domain + account to prefer.
  // vocab/symbol: ?. = optional chaining — only call trim if schoolEmail exists
  if (schoolEmail?.trim()) {
    const normalized = schoolEmail.trim().toLowerCase();
    const hostedDomain = getUmichHostedDomain(normalized);

    // Only set hints when we recognize a Michigan domain.
    if (hostedDomain) {
      // vocab: hd = Google “hosted domain” hint; login_hint pre-fills the email box
      params.hd = hostedDomain;
      params.login_hint = normalized;
    }
  }

  // vocab: setCustomParameters = attach those hints to the Google popup request
  provider.setCustomParameters(params);
  return provider;
}

// Throw if email isn't a Michigan school address.
function assertUmichEmail(email: string): void {
  // vocab/symbol: ! means NOT — runs when isUmichEmail is false
  if (!isUmichEmail(email)) {
    throw new Error(UMICH_ONLY_ERROR);
  }
}

// Email/password signup — reserved for future use (UI currently uses Google only).
// vocab: async/await = wait for Firebase to finish before continuing
// vocab: UserCredential = Firebase result with the signed-in user attached
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  assertUmichEmail(email);
  // vocab: createUserWithEmailAndPassword = Firebase Auth email/password account create
  return createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
}

// Email/password login — reserved for future use.
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  assertUmichEmail(email);
  // vocab: signInWithEmailAndPassword = Firebase Auth email/password login
  return signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
}

// Open Google popup, then reject login if account isn't UMich or doesn't match typed email.
// This is the main auth entry the login/signup cards call.
export async function signInWithGoogle(
  schoolEmail?: string
): Promise<UserCredential> {
  const provider = createGoogleProvider(schoolEmail);
  // vocab: signInWithPopup = opens Google window and waits until they finish or cancel
  const result = await signInWithPopup(auth, provider);
  // vocab/symbol: ?? means if email is missing, use empty string instead
  const email = result.user.email ?? "";

  // Google account isn't Michigan — sign them out and stop.
  // Why signOut? Popup already created a session; we must clear it before throwing.
  if (!isUmichEmail(email)) {
    await signOut(auth);
    throw new Error(UMICH_ONLY_ERROR);
  }

  // They typed one email but picked a different Google account.
  // Manipulate here: delete this whole if-block to allow any UMich Google vs typed email
  if (schoolEmail?.trim() && email.toLowerCase() !== schoolEmail.trim().toLowerCase()) {
    await signOut(auth);
    throw new Error("Use the same Michigan Google account you entered above.");
  }

  return result;
}

// Sign out of Firebase Auth (clears the current session).
export async function signOutUser(): Promise<void> {
  // vocab: signOut(auth) = clear Firebase’s signed-in user for this browser
  return signOut(auth);
}

// Ask Google again so Firebase will allow account deletion.
// vocab: reauthenticate = prove it’s still you before sensitive actions (delete)
// vocab: User = Firebase’s signed-in person object (has uid, email, etc.)
export async function reauthenticateWithGoogle(): Promise<User> {
  // vocab: auth.currentUser = whoever is signed in right now (or null)
  const user = auth.currentUser;

  // No one is signed in — can't re-confirm.
  if (!user) {
    throw new Error("You need to be signed in.");
  }

  // vocab: reauthenticateWithPopup = Google popup that refreshes the login ticket
  const result = await reauthenticateWithPopup(
    user,
    createGoogleProvider(user.email ?? undefined)
  );
  return result.user;
}
