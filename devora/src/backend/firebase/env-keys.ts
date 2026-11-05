// Firebase connection settings read from environment variables (.env.local).
// NEXT_PUBLIC_* keys are visible in the browser. Firestore rules are what actually protect data.
// Flow: Next loads these at build/runtime → start-firebase.ts uses them to connect.

// ===== NAMED CONSTANTS =====

/**
 * The settings object Firebase needs to know which Google Cloud project this is.
 * Change .env.local, not this file, to point at a different Firebase project.
 */
export const firebaseConfig = {
  // vocab: process.env = the object that holds environment variables
  // vocab: NEXT_PUBLIC_* = values Next.js also exposes to browser JavaScript
  // vocab: apiKey = public client key. It is not a secret by itself; rules still protect data.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // vocab: authDomain = host for Firebase Auth (usually projectId.firebaseapp.com)
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // vocab: projectId = Firebase project name, same as in the Firebase Console
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // vocab: storageBucket = cloud folder for uploaded files (photos)
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // vocab: messagingSenderId = used for push messaging setup, even if unused yet
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // vocab: appId = identifies this web app inside the Firebase project
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // vocab: measurementId = optional Analytics id. Leave unset to skip usage tracking.
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
