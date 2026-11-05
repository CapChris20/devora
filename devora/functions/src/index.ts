// Blocking Auth functions — only Michigan school emails may create or sign in.
// Flow: beforeUserCreated / beforeUserSignedIn → assert email domain → allow or deny.
// Deploy with Firebase Functions. Keep domains aligned with client isUmichEmail().

import { beforeUserCreated, beforeUserSignedIn } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";

const UMICH_EMAIL_SUFFIX = "@umich.edu";
const UM_DEARBORN_EMAIL_SUFFIX = "@umd.umich.edu";

function assertUmichEmail(email: string | undefined): void {
  const normalized = email?.trim().toLowerCase() ?? "";
  const isAllowed =
    normalized.endsWith(UMICH_EMAIL_SUFFIX) ||
    normalized.endsWith(UM_DEARBORN_EMAIL_SUFFIX);

  if (!isAllowed) {
    throw new HttpsError(
      "permission-denied",
      "Only University of Michigan (@umich.edu or @umd.umich.edu) email addresses are allowed."
    );
  }
}

export const blockNonUmichSignUp = beforeUserCreated((event) => {
  assertUmichEmail(event.data?.email);
});

export const blockNonUmichSignIn = beforeUserSignedIn((event) => {
  assertUmichEmail(event.data?.email);
});
