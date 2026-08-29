import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type UserCredential,
} from "firebase/auth";

import { auth } from "./client";

export const ALLOWED_EMAIL_DOMAIN = "@umich.edu";

export const UMICH_ONLY_ERROR =
  "Only University of Michigan Dearborn (@umich.edu) email addresses are allowed.";

export function isUmichEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
}

function assertUmichEmail(email: string): void {
  if (!isUmichEmail(email)) {
    throw new Error(UMICH_ONLY_ERROR);
  }
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  assertUmichEmail(email);
  return createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  assertUmichEmail(email);
  return signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<UserCredential> {
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email ?? "";

  if (!isUmichEmail(email)) {
    await signOut(auth);
    throw new Error(UMICH_ONLY_ERROR);
  }

  return result;
}

export async function signOutUser(): Promise<void> {
  return signOut(auth);
}
