// Deactivate, reactivate, and permanently delete the signed-in student's account.
// Flow: Settings Danger zone → Firestore flags first; full wipe only on delete.
// Delete path: re-auth with Google → wipe Storage → wipe subcollections → delete user doc + Auth.

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
import { deleteUser } from "firebase/auth";

import { reauthenticateWithGoogle } from "./auth";
import { auth, db, storage } from "./start-firebase";

// Nested folders under users/{uid}/ that we wipe on hard delete.
// Manipulate here: add a collection name here if you create another users/{uid}/… folder
// vocab/symbol: as const = lock these names so TypeScript knows the exact strings
const USER_SUBCOLLECTIONS = ["projects", "notifications"] as const;

// Hide this profile from Discovery. Data stays so they can turn it back on later.
// vocab: uid = Firebase Auth user id (same as users/{uid} document id)
export async function deactivateAccount(uid: string): Promise<void> {
  // Why set isPublic false too? Discovery should hide deactivated students immediately.
  await setDoc(
    doc(db, "users", uid),
    {
      isDeactivated: true,
      isPublic: false,
      // vocab: serverTimestamp = Firebase fills the current time on the server
      deactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    // vocab: merge true = change these fields only; keep the rest of the profile
    { merge: true }
  );
}

// Undo deactivate — show on Discovery again.
export async function reactivateAccount(uid: string): Promise<void> {
  // Manipulate here: set isPublic: false if reactivated accounts should stay private
  await setDoc(
    doc(db, "users", uid),
    {
      isDeactivated: false,
      isPublic: true,
      // vocab/symbol: null = clear the old deactivatedAt timestamp
      deactivatedAt: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Remove files under users/{uid}/ in Storage (avatar, etc.).
// vocab: Storage = Firebase cloud file storage (not Firestore)
async function deleteUserUploads(uid: string): Promise<void> {
  // vocab: ref = pointer to a folder/file path in Storage
  const folder = ref(storage, `users/${uid}`);

  try {
    // List every file in the folder, then delete them all at once.
    // vocab: listAll = get every file under this Storage path
    // vocab: Promise.all = wait until every deleteObject finishes
    // vocab: listing.items = file refs (not subfolders); map each to deleteObject
    const listing = await listAll(folder);
    await Promise.all(listing.items.map((item) => deleteObject(item)));
  } catch {
    // Folder missing or already empty — keep going so Firestore/Auth still wipe.
    // Why swallow? Missing Storage folder should not block account deletion.
  }
}

// Delete one subcollection under users/{uid} (projects or notifications).
// vocab: subcollection = nested documents under a parent doc (users/{uid}/projects/…)
async function deleteUserSubcollection(
  uid: string,
  name: (typeof USER_SUBCOLLECTIONS)[number]
): Promise<void> {
  // vocab: getDocs = read all documents in a collection once
  // vocab: collection(db, "users", uid, name) = users/{uid}/{name}
  const snapshot = await getDocs(collection(db, "users", uid, name));

  // Nothing to delete in this subcollection.
  if (snapshot.empty) {
    return;
  }

  // Batch delete is faster/safer than deleting docs one by one.
  // vocab: writeBatch = group many deletes into one Firestore commit
  const batch = writeBatch(db);
  // vocab: forEach on snapshot.docs = each document in that subcollection
  snapshot.docs.forEach((item) => batch.delete(item.ref));
  // vocab: batch.commit() = actually send all those deletes to Firestore
  await batch.commit();
}

// Confirm with Google, then erase Storage + Firestore + Auth for this user.
// Order matters: Storage → nested docs → profile doc → Auth (Auth last so rules still allow writes).
export async function deleteOwnAccount(): Promise<void> {
  const user = auth.currentUser;

  // Must be signed in before we touch any of their data.
  // vocab/symbol: ! means NOT — runs when currentUser is missing
  if (!user) {
    throw new Error("You need to be signed in to delete your account.");
  }

  const uid = user.uid;

  // Google requires a fresh login before it will delete an auth user.
  // vocab: reauthenticateWithGoogle = popup that refreshes the login ticket
  await reauthenticateWithGoogle();

  const signedIn = auth.currentUser;

  // After re-auth, make sure it's still the same person.
  if (!signedIn || signedIn.uid !== uid) {
    throw new Error("Pick the same Google account that's signed in.");
  }

  // 1) Storage uploads (photos)
  await deleteUserUploads(uid);

  // 2) Nested Firestore collections under this user
  // vocab: for...of = loop through each subcollection name in order
  for (const name of USER_SUBCOLLECTIONS) {
    await deleteUserSubcollection(uid, name);
  }

  // 3) Main profile doc, then Firebase Auth user
  // vocab: deleteDoc = remove the users/{uid} document from Firestore
  // vocab: deleteUser = remove the Auth account so they can’t sign in again
  // Why Auth last? Once Auth is gone, Firestore rules that need auth.uid may fail mid-wipe.
  await deleteDoc(doc(db, "users", uid));
  await deleteUser(signedIn);
}
