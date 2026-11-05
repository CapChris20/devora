// Firebase Auth helpers — Google sign-in, sign-out, and Michigan email checks.
// Flow: check the domain → open the Google popup → reject non-Michigan accounts → return the user.
// Login and signup cards call signInWithGoogle. Email/password helpers are reserved for later.

// ===== IMPORTS =====

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

// ===== NAMED CONSTANTS =====

// Kept for older imports. New checks should use ALLOWED_EMAIL_DOMAINS.
export const ALLOWED_EMAIL_DOMAIN = "@umich.edu";

// School domains we accept. Matching uses endsWith on a lowercased email.
// Manipulate here: add another "@campus.edu" string to allow a new school.
// vocab: as const = freeze this list so TypeScript knows the exact strings
export const ALLOWED_EMAIL_DOMAINS = ["@umich.edu", "@umd.umich.edu"] as const;

const DEARBORN_EMAIL_SUFFIX = "@umd.umich.edu";
const ANN_ARBOR_EMAIL_SUFFIX = "@umich.edu";
const DEARBORN_HOSTED_DOMAIN = "umd.umich.edu";
const ANN_ARBOR_HOSTED_DOMAIN = "umich.edu";

// Always show the account picker. Auto-picking the last Google account caused wrong-school logins.
const GOOGLE_ACCOUNT_PICKER_PROMPT = "select_account";

export const UMICH_ONLY_ERROR =
  "Only University of Michigan (@umich.edu or @umd.umich.edu) email addresses are allowed.";

const GOOGLE_ACCOUNT_MISMATCH_ERROR =
  "Use the same Michigan Google account you entered above.";

const NOT_SIGNED_IN_ERROR = "You need to be signed in.";

// ===== HELPER FUNCTIONS =====

// Compare emails without caring about spaces or capital letters.
function normalizeEmailAddress(emailAddress: string): string {
  // vocab: trim = remove spaces at the start and end; toLowerCase = ignore capitals
  return emailAddress.trim().toLowerCase();
}

// Google popup hints. hd = school domain, login_hint = the email they typed.
function createGoogleSignInProvider(schoolEmail?: string): GoogleAuthProvider {
  const googleProvider = new GoogleAuthProvider();
  // vocab: Record<string, string> = an object whose keys and values are both strings
  const googlePopupParameters: Record<string, string> = {
    prompt: GOOGLE_ACCOUNT_PICKER_PROMPT,
  };

  // vocab: ?. = only call trim when schoolEmail actually exists
  const typedSchoolEmail = schoolEmail?.trim() ?? "";
  if (!typedSchoolEmail) {
    googleProvider.setCustomParameters(googlePopupParameters);
    return googleProvider;
  }

  const hostedDomain = getUmichHostedDomain(typedSchoolEmail);
  if (hostedDomain) {
    googlePopupParameters.hd = hostedDomain;
    googlePopupParameters.login_hint = normalizeEmailAddress(typedSchoolEmail);
  }

  // vocab: setCustomParameters = attach those hints to the Google popup
  googleProvider.setCustomParameters(googlePopupParameters);
  return googleProvider;
}

function assertEmailIsUmich(emailAddress: string): void {
  if (!isUmichEmail(emailAddress)) {
    throw new Error(UMICH_ONLY_ERROR);
  }
}

// Popup already created a session. Sign out before throwing so a Gmail account is not left logged in.
async function rejectGoogleAccountThatIsNotMichigan(googleEmail: string): Promise<void> {
  if (isUmichEmail(googleEmail)) {
    return;
  }

  await signOut(auth);
  throw new Error(UMICH_ONLY_ERROR);
}

// They typed one Michigan email and picked a different Google account.
// Manipulate here: delete the call to this function if any Michigan Google account should be allowed.
async function rejectGoogleAccountThatDoesNotMatchTypedEmail(
  googleEmail: string,
  schoolEmail?: string
): Promise<void> {
  const typedSchoolEmail = schoolEmail?.trim() ?? "";
  if (!typedSchoolEmail) {
    return;
  }

  const pickedEmail = normalizeEmailAddress(googleEmail);
  const typedEmail = normalizeEmailAddress(typedSchoolEmail);
  if (pickedEmail === typedEmail) {
    return;
  }

  await signOut(auth);
  throw new Error(GOOGLE_ACCOUNT_MISMATCH_ERROR);
}

// ===== MAIN FUNCTIONS =====

/**
 * True when the email ends with @umich.edu or @umd.umich.edu.
 * @param emailAddress - Address from the form or from Google
 * @returns True for a Michigan school email, false otherwise
 */
export function isUmichEmail(emailAddress: string): boolean {
  const normalizedEmailAddress = normalizeEmailAddress(emailAddress);
  // vocab: .some = true if any domain in the list matches
  // vocab: endsWith = the email must finish with that suffix, not merely contain it
  return ALLOWED_EMAIL_DOMAINS.some((emailDomain) =>
    normalizedEmailAddress.endsWith(emailDomain)
  );
}

/**
 * Pick the Google Workspace domain for this email.
 * Dearborn is checked first because umd.umich.edu also ends with umich.edu.
 * @param emailAddress - School email from the form
 * @returns "umd.umich.edu", "umich.edu", or null when the domain is not Michigan
 */
export function getUmichHostedDomain(emailAddress: string): string | null {
  const normalizedEmailAddress = normalizeEmailAddress(emailAddress);

  if (normalizedEmailAddress.endsWith(DEARBORN_EMAIL_SUFFIX)) {
    return DEARBORN_HOSTED_DOMAIN;
  }

  if (normalizedEmailAddress.endsWith(ANN_ARBOR_EMAIL_SUFFIX)) {
    return ANN_ARBOR_HOSTED_DOMAIN;
  }

  return null;
}

/**
 * Create an email/password account. The UI uses Google today; this is reserved for later.
 * @param emailAddress - Must already be a Michigan school email
 * @param password - Password Firebase will store for this account
 * @returns Firebase credential for the new user
 */
export async function signUpWithEmail(
  emailAddress: string,
  password: string
): Promise<UserCredential> {
  assertEmailIsUmich(emailAddress);
  // vocab: createUserWithEmailAndPassword = Firebase email/password account create
  // vocab: async/await = wait for Firebase before continuing
  return createUserWithEmailAndPassword(
    auth,
    normalizeEmailAddress(emailAddress),
    password
  );
}

/**
 * Sign in with email and password. The UI uses Google today; this is reserved for later.
 * @param emailAddress - Must already be a Michigan school email
 * @param password - Password for that account
 * @returns Firebase credential for the signed-in user
 */
export async function signInWithEmail(
  emailAddress: string,
  password: string
): Promise<UserCredential> {
  assertEmailIsUmich(emailAddress);
  // vocab: signInWithEmailAndPassword = Firebase email/password login
  return signInWithEmailAndPassword(
    auth,
    normalizeEmailAddress(emailAddress),
    password
  );
}

/**
 * Open the Google popup, then reject the login if the account is not Michigan
 * or does not match the email typed on the form.
 * @param schoolEmail - Optional email from the login or signup field, used as a Google hint
 * @returns Firebase credential for the signed-in Michigan user
 */
export async function signInWithGoogle(schoolEmail?: string): Promise<UserCredential> {
  const googleProvider = createGoogleSignInProvider(schoolEmail);
  // vocab: signInWithPopup = open the Google window and wait until they finish or cancel
  const signInResult = await signInWithPopup(auth, googleProvider);
  // vocab: ?? = if email is missing, use an empty string
  const googleEmail = signInResult.user.email ?? "";

  await rejectGoogleAccountThatIsNotMichigan(googleEmail);
  await rejectGoogleAccountThatDoesNotMatchTypedEmail(googleEmail, schoolEmail);

  return signInResult;
}

/**
 * Sign out of Firebase Auth and clear the current browser session.
 * @returns Resolves when the session is cleared
 */
export async function signOutUser(): Promise<void> {
  // vocab: signOut(auth) = clear Firebase's signed-in user for this browser
  return signOut(auth);
}

/**
 * Ask Google again so Firebase will allow a sensitive action such as account deletion.
 * @returns The same user after Google confirms it is still them
 */
export async function reauthenticateWithGoogle(): Promise<User> {
  // vocab: auth.currentUser = whoever is signed in right now, or null
  // vocab: reauthenticate = prove it is still you before delete
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(NOT_SIGNED_IN_ERROR);
  }

  // vocab: reauthenticateWithPopup = Google popup that refreshes the login ticket
  const reauthenticationResult = await reauthenticateWithPopup(
    currentUser,
    createGoogleSignInProvider(currentUser.email ?? undefined)
  );
  return reauthenticationResult.user;
}
