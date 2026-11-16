import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMULATOR_PORT = 8089;

// Start local Firestore emulator JAR directly
function startEmulator() {
  const javaBin = process.env.JAVA_HOME
    ? path.join(process.env.JAVA_HOME, "bin", "java")
    : "java";
  const jarPath = path.join(
    process.env.HOME,
    ".cache/firebase/emulators/cloud-firestore-emulator-v1.19.8.jar"
  );
  const rulesPath = path.resolve(__dirname, "../firestore.rules");

  console.log(`Spawning Firestore emulator on port ${EMULATOR_PORT}...`);
  const proc = spawn(javaBin, [
    "-jar",
    jarPath,
    "--port",
    String(EMULATOR_PORT),
    "--rules",
    rulesPath
  ], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  return new Promise((resolve, reject) => {
    let started = false;
    proc.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("Dev App Server is now running")) {
        started = true;
        resolve(proc);
      }
    });
    proc.stderr.on("data", (d) => {
      // console.error(d.toString());
    });
    proc.on("error", (err) => reject(err));
    setTimeout(() => {
      if (!started) resolve(proc);
    }, 4000);
  });
}

function getClient(appName, mockUser) {
  const app = initializeApp({ projectId: "devora-303f4" }, appName);
  const db = getFirestore(app);
  if (mockUser) {
    connectFirestoreEmulator(db, "127.0.0.1", EMULATOR_PORT, {
      mockUserToken: mockUser
    });
  } else {
    connectFirestoreEmulator(db, "127.0.0.1", EMULATOR_PORT);
  }
  return db;
}

async function run() {
  const emulatorProc = await startEmulator();
  console.log("Firestore emulator is running.");

  const results = [];
  function record(id, testName, category, result, evidence) {
    results.push({ id, testName, category, result, evidence });
    console.log(`[${result}] ${id}: ${testName} - ${evidence}`);
  }

  try {
    // Actors
    const aliceDb = getClient("alice-app", {
      user_id: "student_alice",
      sub: "student_alice",
      email: "alice@umich.edu",
      email_verified: true
    });

    const bobDb = getClient("bob-app", {
      user_id: "student_bob",
      sub: "student_bob",
      email: "bob@umich.edu",
      email_verified: true
    });

    const externalDb = getClient("external-app", {
      user_id: "external_charlie",
      sub: "external_charlie",
      email: "charlie@gmail.com",
      email_verified: true
    });

    const anonDb = getClient("anon-app", null);

    // 1. Setup Alice's owner profile in users/student_alice
    const validOwnerDoc = {
      email: "alice@umich.edu",
      firstName: "Alice",
      lastName: "Smith",
      displayName: "Alice Smith",
      religion: "PrivateReligiousAffiliation",
      school: "University of Michigan-Dearborn",
      major: "Software Engineering",
      isPublic: true,
      onboardingComplete: true
    };

    // 2. Setup Alice's discoverable public profile in discoveryProfiles/student_alice
    const validPublicDiscovery = {
      firstName: "Alice",
      lastName: "Smith",
      displayName: "Alice Smith",
      major: "Software Engineering",
      school: "University of Michigan-Dearborn",
      isPublic: true,
      onboardingComplete: true
    };

    // 3. Setup Carol's hidden profile in discoveryProfiles/student_carol
    const carolDb = getClient("carol-app", {
      user_id: "student_carol",
      sub: "student_carol",
      email: "carol@umich.edu",
      email_verified: true
    });
    const hiddenDiscovery = {
      firstName: "Carol",
      lastName: "Danvers",
      displayName: "Carol Danvers",
      major: "Aerospace",
      school: "University of Michigan-Dearborn",
      isPublic: false,
      onboardingComplete: true
    };

    // 4. Setup Dave's deactivated profile in discoveryProfiles/student_dave
    const daveDb = getClient("dave-app", {
      user_id: "student_dave",
      sub: "student_dave",
      email: "dave@umich.edu",
      email_verified: true
    });
    const deactivatedDiscovery = {
      firstName: "Dave",
      lastName: "Miller",
      displayName: "Dave Miller",
      major: "Physics",
      school: "University of Michigan-Dearborn",
      isPublic: true,
      onboardingComplete: true,
      isDeactivated: true
    };

    console.log("--- Seeding Base Documents ---");
    await setDoc(doc(aliceDb, "users", "student_alice"), validOwnerDoc);
    await setDoc(doc(aliceDb, "discoveryProfiles", "student_alice"), validPublicDiscovery);
    await setDoc(doc(carolDb, "discoveryProfiles", "student_carol"), hiddenDiscovery);
    await setDoc(doc(daveDb, "discoveryProfiles", "student_dave"), deactivatedDiscovery);
    console.log("Seeding complete.\n--- Running Test Suite ---");

    // ===== SECTION 6.1 TESTS (SG-9 to SG-12) =====
    // SG-9: Classmate attempt to query users/ directly
    try {
      await getDoc(doc(bobDb, "users", "student_alice"));
      record("SG-9", "Classmate attempt to query users/ directly", "Rules", "FAIL", "Read unexpectedly succeeded for non-owner.");
    } catch (err) {
      if (err.code === "permission-denied") {
        record("SG-9", "Classmate attempt to query users/ directly", "Rules", "PASS", "Permission denied: rules block direct classmate reads on users/{uid}.");
      } else {
        record("SG-9", "Classmate attempt to query users/ directly", "Rules", "FAIL", `Unexpected error: ${err.code}`);
      }
    }

    // SG-10: Owner read of own private fields
    try {
      const snap = await getDoc(doc(aliceDb, "users", "student_alice"));
      if (snap.exists() && snap.data().religion === "PrivateReligiousAffiliation") {
        record("SG-10", "Owner read of own private fields", "Rules", "PASS", "Owner successfully retrieved private fields (religion, email) from users/{uid}.");
      } else {
        record("SG-10", "Owner read of own private fields", "Rules", "FAIL", "Document returned empty or missing private fields.");
      }
    } catch (err) {
      record("SG-10", "Owner read of own private fields", "Rules", "FAIL", `Owner read failed: ${err.code}`);
    }

    // SG-11: Peer read of public card via discoveryProfiles
    try {
      const snap = await getDoc(doc(bobDb, "discoveryProfiles", "student_alice"));
      if (snap.exists() && snap.data().major === "Software Engineering" && !snap.data().religion) {
        record("SG-11", "Peer read of public card via discoveryProfiles", "Rules", "PASS", "Classmate retrieved discoverable projection with public fields only.");
      } else {
        record("SG-11", "Peer read of public card via discoveryProfiles", "Rules", "FAIL", "Card projection not found or contained unexpected fields.");
      }
    } catch (err) {
      record("SG-11", "Peer read of public card via discoveryProfiles", "Rules", "FAIL", `Classmate read failed: ${err.code}`);
    }

    // SG-12: Peer read of hidden card via discoveryProfiles
    try {
      await getDoc(doc(bobDb, "discoveryProfiles", "student_carol"));
      record("SG-12", "Peer read of hidden card via discoveryProfiles", "Rules", "FAIL", "Read succeeded for hidden profile (isPublic=false).");
    } catch (err) {
      if (err.code === "permission-denied") {
        record("SG-12", "Peer read of hidden card via discoveryProfiles", "Rules", "PASS", "Permission denied: isDiscoverableProjection rule blocked hidden profile read.");
      } else {
        record("SG-12", "Peer read of hidden card via discoveryProfiles", "Rules", "FAIL", `Unexpected error: ${err.code}`);
      }
    }

    // ===== SECTION 6.2 SECURITY MATRIX TESTS =====
    // MAT-1: Owner Read users/{uid}
    try {
      const snap = await getDoc(doc(aliceDb, "users", "student_alice"));
      record("MAT-1", "Owner read users/{uid}", "Security Matrix", snap.exists() ? "PASS" : "FAIL", "Owner can read full profile.");
    } catch (err) {
      record("MAT-1", "Owner read users/{uid}", "Security Matrix", "FAIL", err.code);
    }

    // MAT-2: Classmate Read users/{uid}
    try {
      await getDoc(doc(bobDb, "users", "student_alice"));
      record("MAT-2", "Classmate read users/{uid}", "Security Matrix", "FAIL", "Classmate permitted to read private users/{uid}.");
    } catch (err) {
      record("MAT-2", "Classmate read users/{uid}", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied classmate read.");
    }

    // MAT-3: External/Non-UM Read users/{uid}
    try {
      await getDoc(doc(externalDb, "users", "student_alice"));
      record("MAT-3", "Non-UM read users/{uid}", "Security Matrix", "FAIL", "Non-UM permitted to read users/{uid}.");
    } catch (err) {
      record("MAT-3", "Non-UM read users/{uid}", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied non-UM read.");
    }

    // MAT-4: Unauthenticated Read users/{uid}
    try {
      await getDoc(doc(anonDb, "users", "student_alice"));
      record("MAT-4", "Unauthenticated read users/{uid}", "Security Matrix", "FAIL", "Unauthenticated permitted to read users/{uid}.");
    } catch (err) {
      record("MAT-4", "Unauthenticated read users/{uid}", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied anonymous read.");
    }

    // MAT-5: Owner Write users/{uid}
    try {
      await updateDoc(doc(aliceDb, "users", "student_alice"), { displayName: "Alice S." });
      record("MAT-5", "Owner write users/{uid}", "Security Matrix", "PASS", "Owner allowed to update profile document.");
    } catch (err) {
      record("MAT-5", "Owner write users/{uid}", "Security Matrix", "FAIL", err.code);
    }

    // MAT-6: Classmate Write users/{uid}
    try {
      await updateDoc(doc(bobDb, "users", "student_alice"), { displayName: "Hacked by Bob" });
      record("MAT-6", "Classmate write users/{uid}", "Security Matrix", "FAIL", "Classmate was permitted to write to another student's users document.");
    } catch (err) {
      record("MAT-6", "Classmate write users/{uid}", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied classmate write.");
    }

    // MAT-7: Non-UM Write users/{uid}
    try {
      await updateDoc(doc(externalDb, "users", "student_alice"), { displayName: "Hacked by External" });
      record("MAT-7", "Non-UM write users/{uid}", "Security Matrix", "FAIL", "Non-UM permitted to write users/{uid}.");
    } catch (err) {
      record("MAT-7", "Non-UM write users/{uid}", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied non-UM write.");
    }

    // MAT-8: Unauthenticated Write users/{uid}
    try {
      await updateDoc(doc(anonDb, "users", "student_alice"), { displayName: "Hacked by Anon" });
      record("MAT-8", "Unauthenticated write users/{uid}", "Security Matrix", "FAIL", "Anon permitted to write users/{uid}.");
    } catch (err) {
      record("MAT-8", "Unauthenticated write users/{uid}", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied anonymous write.");
    }

    // MAT-9: Classmate Read discoveryProfiles/{uid} (Public)
    try {
      const snap = await getDoc(doc(bobDb, "discoveryProfiles", "student_alice"));
      record("MAT-9", "Classmate read public discovery profile", "Security Matrix", snap.exists() ? "PASS" : "FAIL", "Classmate allowed to read public discoverable projection.");
    } catch (err) {
      record("MAT-9", "Classmate read public discovery profile", "Security Matrix", "FAIL", err.code);
    }

    // MAT-10: Classmate Read discoveryProfiles/{uid} (Deactivated)
    try {
      await getDoc(doc(bobDb, "discoveryProfiles", "student_dave"));
      record("MAT-10", "Classmate read deactivated profile", "Security Matrix", "FAIL", "Classmate permitted to read deactivated profile.");
    } catch (err) {
      record("MAT-10", "Classmate read deactivated profile", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied read on deactivated card.");
    }

    // MAT-11: Non-UM Read discoveryProfiles/{uid} (Public)
    try {
      await getDoc(doc(externalDb, "discoveryProfiles", "student_alice"));
      record("MAT-11", "Non-UM read public discovery profile", "Security Matrix", "FAIL", "Non-UM permitted to read discovery profile.");
    } catch (err) {
      record("MAT-11", "Non-UM read public discovery profile", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied non-UM read.");
    }

    // MAT-12: Unauthenticated Read discoveryProfiles/{uid}
    try {
      await getDoc(doc(anonDb, "discoveryProfiles", "student_alice"));
      record("MAT-12", "Unauthenticated read discovery profile", "Security Matrix", "FAIL", "Anon permitted to read discovery profile.");
    } catch (err) {
      record("MAT-12", "Unauthenticated read discovery profile", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied anonymous read.");
    }

    // MAT-13: Owner Write discoveryProfiles/{uid}
    try {
      await updateDoc(doc(aliceDb, "discoveryProfiles", "student_alice"), { major: "Computer Science" });
      record("MAT-13", "Owner write discovery profile", "Security Matrix", "PASS", "Owner allowed to update discovery profile.");
    } catch (err) {
      record("MAT-13", "Owner write discovery profile", "Security Matrix", "FAIL", err.code);
    }

    // MAT-14: Classmate Write discoveryProfiles/{uid}
    try {
      await updateDoc(doc(bobDb, "discoveryProfiles", "student_alice"), { major: "Vandalized" });
      record("MAT-14", "Classmate write discovery profile", "Security Matrix", "FAIL", "Classmate permitted to write to another's discovery card.");
    } catch (err) {
      record("MAT-14", "Classmate write discovery profile", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied classmate write.");
    }

    // MAT-15: Owner Write discoveryProfiles/{uid} with forbidden private field (email)
    try {
      await setDoc(doc(aliceDb, "discoveryProfiles", "student_alice"), {
        ...validPublicDiscovery,
        email: "alice@umich.edu"
      });
      record("MAT-15", "Owner write private field to discoveryProfiles", "Security Matrix", "FAIL", "Write unexpectedly allowed with private field 'email'.");
    } catch (err) {
      if (err.code === "permission-denied") {
        record("MAT-15", "Owner write private field to discoveryProfiles", "Security Matrix", "PASS", "Rules rejected write containing sensitive field 'email' (discoveryProfileHasNoPrivateFields).");
      } else {
        record("MAT-15", "Owner write private field to discoveryProfiles", "Security Matrix", "FAIL", err.code);
      }
    }

    // MAT-16: Non-UM Write discoveryProfiles/{uid}
    try {
      await setDoc(doc(externalDb, "discoveryProfiles", "student_alice"), validPublicDiscovery);
      record("MAT-16", "Non-UM write discovery profile", "Security Matrix", "FAIL", "Non-UM permitted to write discovery profile.");
    } catch (err) {
      record("MAT-16", "Non-UM write discovery profile", "Security Matrix", err.code === "permission-denied" ? "PASS" : "FAIL", "Rules denied non-UM write.");
    }

  } finally {
    console.log("Shutting down emulator...");
    emulatorProc.kill();
  }

  // Save results
  const outPath = path.resolve(__dirname, "../test-results/security-results.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Saved results to ${outPath}`);
}

run().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

