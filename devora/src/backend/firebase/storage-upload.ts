// Upload a profile photo to Firebase Storage and return the public URL.
// Flow: pick extension → write users/{uid}/avatar.ext → return download URL for photoURL.
// Saved on the user's Firestore profile as photoURL.

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "./start-firebase";

// This function is how a picked image becomes a URL on the profile.
// UI calls it, then writes the returned string into photoURL via user-profile helpers.
// vocab: uid = Firebase Auth user id (folder name under users/)
// vocab: File = browser file object from an <input type="file">
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  // Keep the original extension (jpg/png/webp); default to jpg if missing.
  // vocab/symbol: split(".").pop() = last piece after the final dot (“png” from “me.png”)
  // vocab/symbol: || = if pop() is empty/undefined, use "jpg"
  // Manipulate here: change default "jpg" if you prefer another fallback type
  const extension = file.name.split(".").pop() || "jpg";

  // Path layout: users/{uid}/avatar.{ext} — one avatar per user (overwrites previous).
  // Manipulate here: change `avatar` to another name if you want multiple photo slots
  // vocab: ref = Storage path pointer; uploadBytes = send the file bytes there
  const photoRef = ref(storage, `users/${uid}/avatar.${extension}`);
  await uploadBytes(photoRef, file);

  // vocab: getDownloadURL = public https link the <img> tag can load
  // Why return URL? Firestore stores a string; the browser loads the image from Storage.
  return getDownloadURL(photoRef);
}
