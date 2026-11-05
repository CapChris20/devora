// Start Firebase once and share auth, Firestore, and Storage with the rest of the app.
// Flow: read config → reuse the app if hot reload already created it → export the handles.
// Every other backend file imports from here instead of calling initializeApp again.

// ===== IMPORTS =====

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { firebaseConfig } from "./env-keys";

// ===== HELPER FUNCTIONS =====

// Next.js hot reload re-runs this file. A second initializeApp with the same name crashes.
// vocab: FirebaseApp = the live connection to our Firebase project
// vocab: hot reload = dev refresh that reruns modules without a full browser restart
function createFirebaseApp(): FirebaseApp {
  const existingFirebaseApps = getApps();
  const hasExistingFirebaseApp = existingFirebaseApps.length > 0;

  if (hasExistingFirebaseApp) {
    // vocab: getApp = grab the Firebase app that is already running
    return getApp();
  }

  // vocab: initializeApp = first connect, using the keys from .env.local
  return initializeApp(firebaseConfig);
}

// ===== MAIN EXPORTS =====

const firebaseApp = createFirebaseApp();

export { firebaseApp as app };

/**
 * Firebase Authentication handle. This is who is signed in (uid, email, tokens).
 */
export const auth = getAuth(firebaseApp);

/**
 * Firestore database handle. Student profiles live at users/{uid}.
 */
export const db = getFirestore(firebaseApp);

/**
 * Cloud Storage handle. Profile photos live at users/{uid}/avatar.*.
 */
export const storage = getStorage(firebaseApp);
