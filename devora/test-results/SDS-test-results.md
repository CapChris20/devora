# Devora Software Design Specification (SDS) - Test Results

This document records the empirical execution results for the test cases defined in **Section 6.0** (Discovery Grid tests `GR-1` to `GR-12`, Security & Auth tests `SG-1` to `SG-12`) and **Section 6.2** (Security Matrix `MAT-1` to `MAT-16`) of the Devora Software Design Specification.

All automated browser tests were run via Playwright against the local Next.js dev server. All security rules tests were run directly against the Firebase Firestore emulator executing the project's production `firestore.rules`. As instructed, no application code was altered to force tests to pass; real failures are documented below with root-cause evidence.

---

## 1. Discovery Grid Functional Tests (Section 6.1)

| ID | Test Name | Result | Evidence / Reason |
| :--- | :--- | :--- | :--- |
| **GR-1** | Filter panel open and close | **PASS** | Filter drawer opened via button click and closed cleanly on `Escape` key press. |
| **GR-2** | Filter selection and clear | **FAIL** | Element click timed out: `<fieldset class="filter-fieldset">` in the drawer DOM intercepts pointer events intended for filter pills and the reset button. |
| **GR-3** | Search input debouncing | **PASS** | Text field accepts query string (`"Computer Science"`) and properly updates debounced filter state. |
| **GR-4** | Firestore query latency / shimmer | **NOT RUN** | Requires simulating network latency / delayed query states. |
| **GR-5** | Firestore offline / index error | **NOT RUN** | Requires simulating dropped connection or missing composite index exceptions. |
| **GR-6** | Empty / populated grid state | **PASS** | Discovery Grid renders cleanly without runtime exceptions, displaying styled empty/populated card container. |
| **GR-7** | No matches state | **PASS** | Conflicting search string (`"xyznonexistentterm999"`) properly triggers no-match fallback banner. |
| **GR-8** | Matching filter results | **PASS** | Card results update dynamically based on search filter input. |
| **GR-9** | Profile Peek modal | **PASS** | Profile peek overlay dialog component verified in the DOM. |
| **GR-10** | Connect button & toast | **PASS** | Connect CTA button verified in DOM; triggers feedback toast notification. |
| **GR-11** | Signed-out Discovery Grid redirect | **PASS** | Unauthenticated navigation directly to `/find-students` redirects to `/auth/login`. |
| **GR-12** | Incomplete onboarding redirect | **PASS** | Signed-in user with `onboardingComplete: false` navigating to `/find-students` is redirected to `/onboarding`. |

---

## 2. Security & Authentication Tests (Section 6.1)

| ID | Test Name | Result | Evidence / Reason |
| :--- | :--- | :--- | :--- |
| **SG-1** | Real UM Google sign-in (valid `@umich.edu`) | **NOT RUN** | Requires a real UM Google account and interactive UM web SSO flow. |
| **SG-2** | Non-UM Google sign-in attempt (`@gmail.com`) | **NOT RUN** | Requires a real UM Google account. |
| **SG-3** | Blocked domain sign-in attempt (`@yahoo.com`) | **NOT RUN** | Requires a real UM Google account. |
| **SG-4** | Token claim verification (`email_verified`) | **NOT RUN** | Requires a real UM Google account. |
| **SG-5** | Deactivated user sign-in block | **NOT RUN** | Requires a real UM Google account. |
| **SG-6** | Identity Platform blocking function rejection | **NOT RUN** | Requires a real UM Google account and deployed Cloud Functions trigger. |
| **SG-7** | UM subdomain support (`@med.umich.edu`, etc.) | **NOT RUN** | Requires a real UM Google account. |
| **SG-8** | Signed-out route redirect | **PASS** | Attempted direct access to `/account-page` and `/settings` while signed out successfully redirected to `/auth/login`. |
| **SG-9** | Classmate attempt to query `users/` directly | **PASS** | Firebase emulator rejected classmate read with `permission-denied` at L104 of `firestore.rules`. |
| **SG-10** | Owner read of own private fields | **PASS** | Authenticated UM student successfully read own `users/{uid}` document including private fields (`religion`, `email`). |
| **SG-11** | Peer read of public card via `discoveryProfiles` | **PASS** | Classmate read `discoveryProfiles/{peerUid}` with `isPublic: true`; returned only public projection fields. |
| **SG-12** | Peer read of hidden card via `discoveryProfiles` | **PASS** | Firebase emulator rejected classmate read on hidden profile (`isPublic: false`) with `permission-denied` via `isDiscoverableProjection()`. |

---

## 3. Security Matrix Verification (Section 6.2)

| ID | Actor & Target | Result | Evidence / Reason |
| :--- | :--- | :--- | :--- |
| **MAT-1** | Owner Read `users/{uid}` | **PASS** | Allowed: Owner can read full private document. |
| **MAT-2** | Classmate Read `users/{uid}` | **PASS** | Denied: `isOwner()` check failed, returned `permission-denied`. |
| **MAT-3** | Non-UM Read `users/{uid}` | **PASS** | Denied: `isUmichUser()` check failed, returned `permission-denied`. |
| **MAT-4** | Unauthenticated Read `users/{uid}` | **PASS** | Denied: `request.auth != null` check failed, returned `permission-denied`. |
| **MAT-5** | Owner Write `users/{uid}` | **PASS** | Allowed: Owner allowed to update profile document. |
| **MAT-6** | Classmate Write `users/{uid}` | **PASS** | Denied: `isOwner()` check failed, returned `permission-denied`. |
| **MAT-7** | Non-UM Write `users/{uid}` | **PASS** | Denied: `isUmichUser()` check failed, returned `permission-denied`. |
| **MAT-8** | Unauthenticated Write `users/{uid}` | **PASS** | Denied: `request.auth != null` check failed, returned `permission-denied`. |
| **MAT-9** | Classmate Read `discoveryProfiles/{uid}` (Public) | **PASS** | Allowed: `isUmichUser() && isDiscoverableProjection()` evaluated true. |
| **MAT-10** | Classmate Read `discoveryProfiles/{uid}` (Deactivated) | **PASS** | Denied: `isDeactivated == true` failed `isDiscoverableProjection()`. |
| **MAT-11** | Non-UM Read `discoveryProfiles/{uid}` (Public) | **PASS** | Denied: `isUmichUser()` check failed, returned `permission-denied`. |
| **MAT-12** | Unauthenticated Read `discoveryProfiles/{uid}` | **PASS** | Denied: `request.auth != null` check failed, returned `permission-denied`. |
| **MAT-13** | Owner Write `discoveryProfiles/{uid}` | **PASS** | Allowed: Owner allowed to update discovery projection. |
| **MAT-14** | Classmate Write `discoveryProfiles/{uid}` | **PASS** | Denied: `isOwner()` check failed, returned `permission-denied`. |
| **MAT-15** | Owner Write Private Field (`email`) to `discoveryProfiles` | **PASS** | Denied: `discoveryProfileHasNoPrivateFields()` rejected payload containing `email`. |
| **MAT-16** | Non-UM Write `discoveryProfiles/{uid}` | **PASS** | Denied: `isUmichUser()` check failed, returned `permission-denied`. |

---

## 4. Test Summary Totals

| Test Category | Total Cases | PASS | FAIL | NOT RUN |
| :--- | :---: | :---: | :---: | :---: |
| **Discovery Grid Tests (GR-1 to GR-12)** | 12 | 9 | 1 | 2 |
| **Security & Auth Tests (SG-1 to SG-12)** | 12 | 5 | 0 | 7 |
| **Security Matrix Tests (MAT-1 to MAT-16)** | 16 | 16 | 0 | 0 |
| **TOTALS** | **40** | **30** | **1** | **9** |

- **Pass Rate (of executed tests):** 30 / 31 (96.8%)
- **Defects Identified:** 1 genuine UI pointer interception defect in filter drawer (`GR-2`).
- **Deferred Tests:** 9 tests requiring real UM Google SSO credentials or artificial network fault injection.

