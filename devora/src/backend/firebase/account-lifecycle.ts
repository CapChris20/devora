// Deactivate, reactivate, and permanently delete the signed-in student's account.
// Flow: Settings danger zone sets Firestore flags first. A full wipe happens only on delete.
// Delete order: re-auth with Google → wipe Storage → wipe subcollections → delete the profile → delete Auth.

// ===== IMPORTS =====

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, listAll, ref } from "firebase/storage";
import { deleteUser, type User } from "firebase/auth";

import { reauthenticateWithGoogle } from "./auth";
import {
  deleteDiscoveryProfileProjection,
  syncDiscoveryProfileProjection,
} from "./discovery-profile-sync";
import { auth, db, storage } from "./start-firebase";
import { getUserProfile } from "./user-profile";

// ===== NAMED CONSTANTS =====

// Nested folders under users/{uid}/ that a hard delete wipes.
// Manipulate here: add a collection name if you create another users/{uid}/… folder.
// vocab: as const = lock these names so TypeScript knows the exact strings
const USER_SUBCOLLECTIONS = ["projects", "notifications"] as const;

const MERGE_EXISTING_DOCUMENT_FIELDS = { merge: true } as const;

const NOT_SIGNED_IN_TO_DELETE_ERROR = "You need to be signed in to delete your account.";
const WRONG_GOOGLE_ACCOUNT_ERROR = "Pick the same Google account that's signed in.";

type UserSubcollectionName = (typeof USER_SUBCOLLECTIONS)[number];

// ===== HELPER FUNCTIONS =====

function requireSignedInUser(): User {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error(NOT_SIGNED_IN_TO_DELETE_ERROR);
  }

  return currentUser;
}

// Google requires a fresh login before it will delete an Auth user.
// After the popup, it must still be the same person.
async function requireSameUserAfterGoogleReauthentication(originalUserId: string): Promise<User> {
  // vocab: reauthenticateWithGoogle = popup that refreshes the login ticket
  await reauthenticateWithGoogle();

  const signedInUser = auth.currentUser;
  const isSameUser = Boolean(signedInUser) && signedInUser?.uid === originalUserId;
  if (!signedInUser || !isSameUser) {
    throw new Error(WRONG_GOOGLE_ACCOUNT_ERROR);
  }

  return signedInUser;
}

// A missing Storage folder should not block the rest of the wipe.
async function deleteUserUploads(userId: string): Promise<void> {
  // vocab: ref = pointer to a folder in Storage
  // vocab: Storage = Firebase cloud file storage, not Firestore
  const userFolderRef = ref(storage, `users/${userId}`);

  try {
    // vocab: listAll = every file under this path
    // vocab: Promise.all = wait until every delete finishes
    const storageFileListing = await listAll(userFolderRef);
    await Promise.all(
      storageFileListing.items.map((storageFile) => deleteObject(storageFile))
    );
  } catch {
    // Folder missing or already empty. Keep going so Firestore and Auth still wipe.
  }
}

async function deleteUserSubcollection(
  userId: string,
  subcollectionName: UserSubcollectionName
): Promise<void> {
  // vocab: subcollection = nested documents under a parent doc (users/{uid}/projects/…)
  // vocab: getDocs = read every document in that collection once
  const subcollectionSnapshot = await getDocs(
    collection(db, "users", userId, subcollectionName)
  );

  if (subcollectionSnapshot.empty) {
    return;
  }

  // vocab: writeBatch = group many deletes into one Firestore commit
  const deleteBatch = writeBatch(db);
  subcollectionSnapshot.docs.forEach((profileDocument) => {
    deleteBatch.delete(profileDocument.ref);
  });
  await deleteBatch.commit();
}

async function deleteStoredUserData(userId: string): Promise<void> {
  await deleteUserUploads(userId);

  for (const subcollectionName of USER_SUBCOLLECTIONS) {
    await deleteUserSubcollection(userId, subcollectionName);
  }

  await deleteDiscoveryProfileProjection(userId);

  // vocab: deleteDoc = remove the users/{uid} document
  await deleteDoc(doc(db, "users", userId));
}

// ===== MAIN FUNCTIONS =====

/**
 * Hide this profile from Discovery. The data stays so they can turn it back on later.
 * @param userId - Firebase Auth user id
 * @returns Resolves when the deactivated flags are saved
 */
export async function deactivateAccount(userId: string): Promise<void> {
  // Discovery projections key off isPublic, so both flags have to flip or they stay visible.
  await setDoc(
    doc(db, "users", userId),
    {
      isDeactivated: true,
      isPublic: false,
      // vocab: serverTimestamp = Firebase fills the current time on the server
      deactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    MERGE_EXISTING_DOCUMENT_FIELDS
  );

  const profile = await getUserProfile(userId);
  if (profile) {
    await syncDiscoveryProfileProjection(userId, profile);
  } else {
    await deleteDiscoveryProfileProjection(userId);
  }
}

/**
 * Undo deactivate and show the profile on Discovery again.
 * @param userId - Firebase Auth user id
 * @returns Resolves when the profile is public again
 */
export async function reactivateAccount(userId: string): Promise<void> {
  // Manipulate here: set isPublic false if reactivated accounts should stay private
  await setDoc(
    doc(db, "users", userId),
    {
      isDeactivated: false,
      isPublic: true,
      deactivatedAt: null,
      updatedAt: serverTimestamp(),
    },
    MERGE_EXISTING_DOCUMENT_FIELDS
  );

  const profile = await getUserProfile(userId);
  if (profile) {
    await syncDiscoveryProfileProjection(userId, profile);
  }
}

/**
 * Confirm with Google, then erase Storage, Firestore, and Auth for the signed-in user.
 * Auth is deleted last so security rules that need auth.uid still allow the wipe.
 * @returns Resolves when the account is gone
 */
export async function deleteOwnAccount(): Promise<void> {
  const currentUser = requireSignedInUser();
  const signedInUser = await requireSameUserAfterGoogleReauthentication(currentUser.uid);

  await deleteStoredUserData(signedInUser.uid);
  // vocab: deleteUser = remove the Auth account so they cannot sign in again
  await deleteUser(signedInUser);
}
