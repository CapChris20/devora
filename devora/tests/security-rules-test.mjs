import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const baseUrl = `http://${host}/v1/projects/devora-303f4/databases/(default)/documents`;

const results = [];
function recordResult(id, testName, result, evidence) {
  results.push({ id, testName, result, evidence });
  console.log(`[${result}] ${id}: ${testName} - ${evidence}`);
}

function makeToken(uid, email) {
  // Firestore emulator accepts simulated JWT or base64 JSON
  const payload = {
    user_id: uid,
    sub: uid,
    email: email,
    email_verified: true,
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `Bearer eyJhbGciOiJub25lIn0.${b64}.`;
}

async function run() {
  console.log(`Running security rules tests against Firestore Emulator at ${host}...`);
  await new Promise((r) => setTimeout(r, 3000));

  const umichUserToken = makeToken("student_alice", "alice@umich.edu");
  const anotherUmichToken = makeToken("student_bob", "bob@umich.edu");
  const nonUmichToken = makeToken("external_charlie", "charlie@gmail.com");

  // 1. Setup initial documents as admin (no auth header or admin endpoint)
  // Create alice profile in users/student_alice
  const aliceUserDoc = {
    fields: {
      email: { stringValue: "alice@umich.edu" },
      firstName: { stringValue: "Alice" },
      lastName: { stringValue: "Smith" },
      displayName: { stringValue: "Alice Smith" },
      religion: { stringValue: "PrivateReligion" },
      school: { stringValue: "University of Michigan-Dearborn" },
      isPublic: { booleanValue: false },
      onboardingComplete: { booleanValue: true },
      isDeactivated: { booleanValue: false }
    }
  };

  // Create discoveryProfiles/student_alice (discoverable: isPublic=true, onboardingComplete=true)
  const alicePublicDiscovery = {
    fields: {
      displayName: { stringValue: "Alice Smith" },
      major: { stringValue: "Computer Science" },
      isPublic: { booleanValue: true },
      onboardingComplete: { booleanValue: true },
      isDeactivated: { booleanValue: false }
    }
  };

  // Create discoveryProfiles/student_hidden (isPublic=false)
  const hiddenDiscovery = {
    fields: {
      displayName: { stringValue: "Hidden Student" },
      major: { stringValue: "Data Science" },
      isPublic: { booleanValue: false },
      onboardingComplete: { booleanValue: true },
      isDeactivated: { booleanValue: false }
    }
  };

  // Create discoveryProfiles/student_deactivated (isDeactivated=true)
  const deactivatedDiscovery = {
    fields: {
      displayName: { stringValue: "Deactivated Student" },
      major: { stringValue: "Bioengineering" },
      isPublic: { booleanValue: true },
      onboardingComplete: { booleanValue: true },
      isDeactivated: { booleanValue: true }
    }
  };

  // Seed documents via Alice as owner
  await fetch(`${baseUrl}/users/student_alice`, {
    method: "PATCH",
    headers: { "Authorization": umichUserToken, "Content-Type": "application/json" },
    body: JSON.stringify(aliceUserDoc)
  });

  await fetch(`${baseUrl}/discoveryProfiles/student_alice`, {
    method: "PATCH",
    headers: { "Authorization": umichUserToken, "Content-Type": "application/json" },
    body: JSON.stringify(alicePublicDiscovery)
  });

  // Seed hidden & deactivated as their respective owners
  const hiddenToken = makeToken("student_hidden", "hidden@umich.edu");
  await fetch(`${baseUrl}/discoveryProfiles/student_hidden`, {
    method: "PATCH",
    headers: { "Authorization": hiddenToken, "Content-Type": "application/json" },
    body: JSON.stringify(hiddenDiscovery)
  });

  const deactivatedToken = makeToken("student_deactivated", "deact@umich.edu");
  await fetch(`${baseUrl}/discoveryProfiles/student_deactivated`, {
    method: "PATCH",
    headers: { "Authorization": deactivatedToken, "Content-Type": "application/json" },
    body: JSON.stringify(deactivatedDiscovery)
  });

  // TEST 1: Owner reads own users/{uid} document when visibility is off (SG-8 / Matrix 1)
  try {
    const res = await fetch(`${baseUrl}/users/student_alice`, {
      headers: { "Authorization": umichUserToken }
    });
    if (res.status === 200) {
      recordResult("SEC-1", "Owner reads own private profile", "PASS", "HTTP 200: Owner permitted to read own users document.");
    } else {
      recordResult("SEC-1", "Owner reads own private profile", "FAIL", `HTTP ${res.status}`);
    }
  } catch (err) {
    recordResult("SEC-1", "Owner reads own private profile", "FAIL", err.message);
  }

  // TEST 2 (SG-9): Classmate attempts to read another user's users/{uid}
  try {
    const res = await fetch(`${baseUrl}/users/student_alice`, {
      headers: { "Authorization": anotherUmichToken }
    });
    if (res.status === 403 || res.status === 401) {
      recordResult("SG-9", "Classmate blocked from reading users/{uid}", "PASS", `HTTP ${res.status}: Correctly denied. Owner-only rule enforced.`);
    } else {
      recordResult("SG-9", "Classmate blocked from reading users/{uid}", "FAIL", `HTTP ${res.status}: Leaked private users document!`);
    }
  } catch (err) {
    recordResult("SG-9", "Classmate blocked from reading users/{uid}", "FAIL", err.message);
  }

  // TEST 3 (SG-10): UMich user reads public discoveryProfiles/{uid}
  try {
    const res = await fetch(`${baseUrl}/discoveryProfiles/student_alice`, {
      headers: { "Authorization": anotherUmichToken }
    });
    const data = await res.json();
    const hasPrivate = data.fields && ("email" in data.fields || "religion" in data.fields);
    if (res.status === 200 && !hasPrivate) {
      recordResult("SG-10", "Classmate reads public discovery projection", "PASS", "HTTP 200: Allowed. Projection verified free of private fields.");
    } else {
      recordResult("SG-10", "Classmate reads public discovery projection", "FAIL", `HTTP ${res.status}`);
    }
  } catch (err) {
    recordResult("SG-10", "Classmate reads public discovery projection", "FAIL", err.message);
  }

  // TEST 4 (Matrix): UMich user reads discoveryProfiles with visibility off
  try {
    const res = await fetch(`${baseUrl}/discoveryProfiles/student_hidden`, {
      headers: { "Authorization": anotherUmichToken }
    });
    if (res.status === 403 || res.status === 401) {
      recordResult("SEC-2", "Classmate blocked from hidden discovery profile", "PASS", `HTTP ${res.status}: Correctly denied when isPublic=false.`);
    } else {
      recordResult("SEC-2", "Classmate blocked from hidden discovery profile", "FAIL", `HTTP ${res.status}`);
    }
  } catch (err) {
    recordResult("SEC-2", "Classmate blocked from hidden discovery profile", "FAIL", err.message);
  }

  // TEST 5 (Matrix): UMich user reads deactivated discovery profile
  try {
    const res = await fetch(`${baseUrl}/discoveryProfiles/student_deactivated`, {
      headers: { "Authorization": anotherUmichToken }
    });
    if (res.status === 403 || res.status === 401) {
      recordResult("SEC-3", "Classmate blocked from deactivated discovery profile", "PASS", `HTTP ${res.status}: Correctly denied when isDeactivated=true.`);
    } else {
      recordResult("SEC-3", "Classmate blocked from deactivated discovery profile", "FAIL", `HTTP ${res.status}`);
    }
  } catch (err) {
    recordResult("SEC-3", "Classmate blocked from deactivated discovery profile", "FAIL", err.message);
  }

  // TEST 6 (Matrix): Signed out user reads profile
  try {
    const res = await fetch(`${baseUrl}/discoveryProfiles/student_alice`);
    if (res.status === 403 || res.status === 401) {
      recordResult("SEC-4", "Signed-out user blocked from discovery profile", "PASS", `HTTP ${res.status}: Authentication token required.`);
    } else {
      recordResult("SEC-4", "Signed-out user blocked from discovery profile", "FAIL", `HTTP ${res.status}`);
    }
  } catch (err) {
    recordResult("SEC-4", "Signed-out user blocked from discovery profile", "FAIL", err.message);
  }

  // TEST 7 (SG-11): Non-UMich user reads profile
  try {
    const res = await fetch(`${baseUrl}/discoveryProfiles/student_alice`, {
      headers: { "Authorization": nonUmichToken }
    });
    if (res.status === 403 || res.status === 401) {
      recordResult("SG-11", "Non-UMich user blocked from discovery profile", "PASS", `HTTP ${res.status}: Non-UM domain correctly denied.`);
    } else {
      recordResult("SG-11", "Non-UMich user blocked from discovery profile", "FAIL", `HTTP ${res.status}`);
    }
  } catch (err) {
    recordResult("SG-11", "Non-UMich user blocked from discovery profile", "FAIL", err.message);
  }

  // TEST 8 (SG-12): Owner write with non-allowlisted key
  try {
    const badDoc = {
      fields: {
        email: { stringValue: "alice@umich.edu" },
        arbitraryInjectedKey: { stringValue: "malicious" }
      }
    };
    const res = await fetch(`${baseUrl}/users/student_alice`, {
      method: "PATCH",
      headers: { "Authorization": umichUserToken, "Content-Type": "application/json" },
      body: JSON.stringify(badDoc)
    });
    if (res.status === 403 || res.status === 401) {
      recordResult("SG-12", "Non-allowlisted key write blocked", "PASS", `HTTP ${res.status}: Key allowlist rule rejected write.`);
    } else {
      recordResult("SG-12", "Non-allowlisted key write blocked", "FAIL", `HTTP ${res.status}: Injected key permitted!`);
    }
  } catch (err) {
    recordResult("SG-12", "Non-allowlisted key write blocked", "FAIL", err.message);
  }

  // TEST 9: Owner writes private field (religion) to discoveryProfiles
  try {
    const leakedDoc = {
      fields: {
        displayName: { stringValue: "Alice Smith" },
        religion: { stringValue: "LeakedReligion" },
        isPublic: { booleanValue: true },
        onboardingComplete: { booleanValue: true }
      }
    };
    const res = await fetch(`${baseUrl}/discoveryProfiles/student_alice`, {
      method: "PATCH",
      headers: { "Authorization": umichUserToken, "Content-Type": "application/json" },
      body: JSON.stringify(leakedDoc)
    });
    if (res.status === 403 || res.status === 401) {
      recordResult("SEC-5", "Private field blocked in discovery projection write", "PASS", `HTTP ${res.status}: Rule discoveryProfileHasNoPrivateFields rejected write.`);
    } else {
      recordResult("SEC-5", "Private field blocked in discovery projection write", "FAIL", `HTTP ${res.status}: Leaked private field permitted on projection!`);
    }
  } catch (err) {
    recordResult("SEC-5", "Private field blocked in discovery projection write", "FAIL", err.message);
  }

  fs.writeFileSync(path.resolve(__dirname, "../test-results/security-results.json"), JSON.stringify(results, null, 2));
  console.log("Security rules test execution completed!");
}

run().catch(console.error);
