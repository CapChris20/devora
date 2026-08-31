export { app, auth, db, storage } from "./start-firebase";
export { getFirebaseAnalytics } from "./usage-tracking";
export { firebaseConfig } from "./env-keys";
export {
  ALLOWED_EMAIL_DOMAIN,
  UMICH_ONLY_ERROR,
  isUmichEmail,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
} from "./auth";
