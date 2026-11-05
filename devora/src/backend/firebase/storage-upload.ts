// Upload a profile photo to Firebase Storage and return the public URL.
// Flow: keep the file extension → write users/{uid}/avatar.ext → return the download URL.
// The account editor saves that URL on the Firestore profile as photoURL.

// ===== IMPORTS =====

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "./start-firebase";

// ===== NAMED CONSTANTS =====

const DEFAULT_PHOTO_EXTENSION = "jpg";
const PROFILE_PHOTO_FILE_NAME = "avatar";
// Keep in sync with storage.rules image/* + size cap.
const MAXIMUM_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_PREFIX = "image/";
const PROFILE_PHOTO_TOO_LARGE_MESSAGE = "Profile photo must be under 5 MB.";
const PROFILE_PHOTO_TYPE_MESSAGE = "Profile photo must be an image file.";

// ===== HELPER FUNCTIONS =====

// "me.photo.png" → "png". Missing extension falls back to jpg so Storage always has a suffix.
function readPhotoFileExtension(fileName: string): string {
  // vocab: split(".").pop() = the last piece after the final dot
  const fileExtension = fileName.split(".").pop();
  if (!fileExtension) {
    return DEFAULT_PHOTO_EXTENSION;
  }

  return fileExtension;
}

// ===== MAIN FUNCTION =====

/**
 * Upload one profile photo and return the https URL an img tag can load.
 * A second upload for the same student overwrites the previous avatar.
 * @param userId - Firebase Auth user id (folder name under users/)
 * @param photoFile - Browser file from an input type="file"
 * @returns Public download URL to store as photoURL
 */
export async function uploadProfilePhoto(userId: string, photoFile: File): Promise<string> {
  if (!photoFile.type.startsWith(ALLOWED_IMAGE_MIME_PREFIX)) {
    throw new Error(PROFILE_PHOTO_TYPE_MESSAGE);
  }
  if (photoFile.size > MAXIMUM_PROFILE_PHOTO_BYTES) {
    throw new Error(PROFILE_PHOTO_TOO_LARGE_MESSAGE);
  }

  const fileExtension = readPhotoFileExtension(photoFile.name);
  // Manipulate here: change PROFILE_PHOTO_FILE_NAME if you want a different photo slot
  // vocab: ref = Storage path pointer; uploadBytes = send the file bytes there
  const photoStorageRef = ref(
    storage,
    `users/${userId}/${PROFILE_PHOTO_FILE_NAME}.${fileExtension}`
  );

  await uploadBytes(photoStorageRef, photoFile);

  // Firestore stores a string. The browser loads the image from this Storage URL.
  // vocab: getDownloadURL = public https link
  return getDownloadURL(photoStorageRef);
}
