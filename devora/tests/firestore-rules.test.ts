// Emulator tests for the users/{userId} read rules in firestore.rules.
// Run: npm run test:rules (starts the Firestore emulator, needs Java).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

let env: RulesTestEnvironment;

const umich = (uid: string, email = `${uid}@umich.edu`) => env.authenticatedContext(uid, { email }).firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "devora-rules-test",
    firestore: { rules: readFileSync(resolve(__dirname, "../firestore.rules"), "utf8") },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users/alice"), { email: "alice@umich.edu", religion: "x", isPublic: false });
    await setDoc(doc(db, "users/pub"), { email: "pub@umich.edu", isPublic: true, isDeactivated: false });
    await setDoc(doc(db, "users/deact"), { email: "deact@umich.edu", isPublic: true, isDeactivated: true });
    await setDoc(doc(db, "users/legacy"), { email: "legacy@umich.edu" });
  });
});

describe("users read rules", () => {
  it("a. owner reads own doc even when isPublic is false", async () => {
    await assertSucceeds(getDoc(doc(umich("alice"), "users/alice")));
  });
  it("b. other UMich user reads a public, non-deactivated doc", async () => {
    await assertSucceeds(getDoc(doc(umich("bob"), "users/pub")));
  });
  it("c. other UMich user cannot read isPublic false doc", async () => {
    await assertFails(getDoc(doc(umich("bob"), "users/alice")));
  });
  it("d. other UMich user cannot read deactivated doc with isPublic true", async () => {
    await assertFails(getDoc(doc(umich("bob"), "users/deact")));
  });
  it("e. signed-out user cannot read users docs", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users/pub")));
  });
  it("f. UMich user can list users where isPublic == true", async () => {
    await assertSucceeds(getDocs(query(collection(umich("bob"), "users"), where("isPublic", "==", true))));
  });
  it("g. UMich user cannot list users with no filter", async () => {
    await assertFails(getDocs(collection(umich("bob"), "users")));
  });
  it("h. gmail.com user cannot read any users doc", async () => {
    const db = umich("eve", "eve@gmail.com");
    await assertFails(getDoc(doc(db, "users/pub")));
    await assertFails(getDoc(doc(db, "users/eve")));
  });
  it("i. legacy doc without isPublic/isDeactivated: denied to others, allowed to owner", async () => {
    await assertFails(getDoc(doc(umich("bob"), "users/legacy")));
    await assertSucceeds(getDoc(doc(umich("legacy"), "users/legacy")));
  });
});

describe("owner flows", () => {
  it("owner can read a not-yet-created own doc (first sign-in getUserProfile)", async () => {
    await assertSucceeds(getDoc(doc(umich("newbie"), "users/newbie")));
  });
  it("owner can still create, update, and delete own doc", async () => {
    const db = umich("newbie");
    await assertSucceeds(setDoc(doc(db, "users/newbie"), { email: "newbie@umich.edu", isPublic: false }));
    await assertSucceeds(setDoc(doc(db, "users/newbie"), { isPublic: true }, { merge: true }));
    await assertSucceeds(deleteDoc(doc(db, "users/newbie")));
  });
});

describe("conversations and projects", () => {
  it("participant can create a conversation they are in; non-participant cannot", async () => {
    await assertSucceeds(setDoc(doc(umich("bob"), "conversations/c1"), { participantIds: ["bob", "pub"] }));
    await assertFails(setDoc(doc(umich("bob"), "conversations/c2"), { participantIds: ["pub"] }));
  });
  it("participant reads conversation, outsider cannot", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "conversations/c3"), { participantIds: ["bob", "pub"] });
    });
    await assertSucceeds(getDoc(doc(umich("bob"), "conversations/c3")));
    await assertFails(getDoc(doc(umich("zed"), "conversations/c3")));
  });
  it("projects of a public user are readable; of a private or deactivated user are not", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      for (const u of ["pub", "alice", "deact"]) await setDoc(doc(ctx.firestore(), `users/${u}/projects/p1`), { t: 1 });
    });
    await assertSucceeds(getDoc(doc(umich("bob"), "users/pub/projects/p1")));
    await assertFails(getDoc(doc(umich("bob"), "users/alice/projects/p1")));
    await assertFails(getDoc(doc(umich("bob"), "users/deact/projects/p1")));
    await assertSucceeds(getDoc(doc(umich("alice"), "users/alice/projects/p1")));
  });
});

// Documents a known gap rather than a desired behavior: a list query cannot prove
// isDeactivated != true from an isPublic == true filter, so the list rule is
// evaluated on isPublic alone. The app keeps the two in sync (deactivateAccount
// sets isPublic: false), but the rules do not force it.
describe("users list rule: known gap", () => {
  it("list with isPublic == true can return a deactivated doc whose isPublic is still true", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/deact"), { isPublic: true, isDeactivated: true });
    });
    const snap = await assertSucceeds(
      getDocs(query(collection(umich("bob"), "users"), where("isPublic", "==", true)))
    );
    if (!snap.docs.some((d) => d.id === "deact")) throw new Error("expected deactivated doc in results");
  });
});
