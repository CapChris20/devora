import { beforeUserCreated, beforeUserSignedIn } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";

const ALLOWED_DOMAIN = "@umich.edu";

function assertUmichEmail(email: string | undefined): void {
  const normalized = email?.trim().toLowerCase() ?? "";

  if (!normalized.endsWith(ALLOWED_DOMAIN)) {
    throw new HttpsError(
      "permission-denied",
      "Only University of Michigan (@umich.edu) email addresses are allowed."
    );
  }
}

export const blockNonUmichSignUp = beforeUserCreated((event) => {
  assertUmichEmail(event.data?.email);
});

export const blockNonUmichSignIn = beforeUserSignedIn((event) => {
  assertUmichEmail(event.data?.email);
});
