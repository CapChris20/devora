// Initialize Firebase once and export auth, Firestore, and Storage handles.
// Flow: read config → create/reuse app → export auth/db/storage for the rest of backend.
// Every backend file imports from here instead of calling initializeApp again.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { firebaseConfig } from "./env-keys";

// This function is the “boot” for Firebase — run once per page load.
// Hot reload in Next can re-run modules; we must not create a second app.
// vocab: FirebaseApp = the live connection object to our Firebase project
// vocab: hot reload = Next/dev refreshes code without a full browser restart
function createFirebaseApp(): FirebaseApp {
  // vocab/symbol: ternary (? :) — if an app already exists, get it; else create one
  // vocab: getApps() = list of Firebase apps already started in this page
  // vocab: getApp() = grab the default existing app (no second connect)
  // vocab: initializeApp = first-time connect using firebaseConfig keys from .env
  // Why this order? Reuse first — calling initializeApp twice with the same name crashes.
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

const app = createFirebaseApp();

export { app };
// vocab: auth = Firebase Authentication (who is signed in — uid, email, tokens)
export const auth = getAuth(app);
// vocab: Firestore / db = the NoSQL database where user profiles live (users/{uid})
export const db = getFirestore(app);
// vocab: Storage = cloud file storage for profile photos (users/{uid}/avatar.*)
export const storage = getStorage(app);
