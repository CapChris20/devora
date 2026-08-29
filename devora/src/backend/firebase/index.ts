export { app, auth, db, storage } from "./client";
export { getFirebaseAnalytics } from "./analytics";
export { firebaseConfig } from "./config";
export {
  ALLOWED_EMAIL_DOMAIN,
  UMICH_ONLY_ERROR,
  isUmichEmail,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
} from "./auth";
