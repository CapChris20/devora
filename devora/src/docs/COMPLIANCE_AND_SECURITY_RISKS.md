# Devora — Compliance & Security Risk Register

Last reviewed: October 26, 2026 (security split pass)

## Security model (current code)

- `users/{uid}` — **owner-only** read/write (full profile including email / religion)
- `discoveryProfiles/{uid}` — **only** Michigan classmates can read; contains public card fields only
- Writes are **key-allowlisted** in `firestore.rules`
- Social URLs sanitized; Storage image + size capped; Analytics consent-gated

**You must deploy** for this to protect production:

```bash
cd devora
firebase deploy --only firestore,storage
firebase deploy --only functions
```

After deploy, each existing public student must open the app once (any signed-in page) so `getUserProfile` publishes their `discoveryProfiles` card. Until then they may not appear in Discovery.

  
Scope: current Next.js + Firebase student networking app  
Audience: Chris Shina (operator) and CECS capstone reviewers  

**This is not legal advice.** Have a lawyer or UM counsel review Privacy / Terms before a wide public launch or App Store release.

---

## What we shipped in this pass

| Item | Status |
|------|--------|
| Privacy Policy page (`/privacy-page`) | Added |
| Terms of Service (`/terms-page`) | Added |
| Cookie Policy (`/cookies-page`) | Added |
| Cookie / analytics consent banner | Added; Analytics gated on Accept |
| Signup form Terms + Privacy consent | Added |
| Footer business / operator details | Added |
| Softened unsupported “official / premier / 100% / sponsored” claims | Updated |
| Social URL XSS hardening (`https` + host allowlist) | Added |
| Firestore + Storage rule tightening | Updated — **deploy rules** |
| Security headers (CSP-ish, frame deny, nosniff) | Added in `next.config.mjs` |
| Dearborn `@umd.umich.edu` in Cloud Functions | Aligned — **redeploy functions** |
| Avatar alt text + form labels + contrast bump | Updated |

---

## Cookie consent — do you need it?

**Yes, disclose; opt-in for analytics.**

| Storage | Needed for site? | Consent |
|---------|------------------|---------|
| Firebase Auth session | Essential | Disclose; no opt-in required in most regimes |
| Theme `localStorage` | Functional | Disclose; treated as essential here |
| Consent choice itself | Essential | Required to remember Accept / Reject |
| Firebase Analytics | Optional / not called until Accept | **Opt-in required** before init |

No third-party video/map embeds found. No ad networks found.

---

## Data minimization notes

Collected today (onboarding / profile): name, Michigan email, major, class rank, age, gender, career niche, experience, interests, bio, optional religion, signup reasons, social links, photo.

**Flag:** age, gender, and especially **religion** are sensitive. Keep them optional; never show on Discovery cards; plan a **private subcollection** so public profile documents cannot leak email/religion/signupReason over the wire (Firestore cannot field-mask on client reads).

Client stripping in `listPublicProfiles` reduces UI accidents but **does not** remove those fields from the raw Firestore response for public docs.

---

## Security fixes still requiring deploy / follow-up

1. **Deploy** `firestore.rules`, `storage.rules`, and `firestore.indexes.json` (`firebase deploy --only firestore,storage`).
2. **Redeploy** Cloud Functions after the Dearborn domain fix.
3. **Private field split** (`users/{uid}/private/...`) for email / religion / signupReason.
4. **Field-level write allowlists** in rules (stop clients self-setting arbitrary keys) — partial lock via email == auth token only today.
5. Next.js **middleware** cannot fully replace Firestore rules for Firebase client SDK apps; keep rules as the real gate.
6. CSP may need tuning after first production smoke test (Google sign-in popups / Storage URLs).

---

## Accessibility (done + remaining)

Done: signup labels, consent checkbox, clearer CTAs, avatar alt text, cookie banner focus styles, stronger muted/faint contrast.

Remaining: full WCAG audit (automated + keyboard pass on Discovery filters/peek), skip-to-content link, visible focus review on every custom control, light-theme contrast spot-checks.

---

## Marketing / consumer-protection flags

| Claim risk | Action taken |
|------------|--------------|
| “Premier”, “official hub”, “100% verified”, “Sponsored by CECS” | Softened to campus/capstone language |
| Fake testimonials / star reviews | None found |
| Unsourced referral / hiring stats in FAQs | Softened; no numeric guarantees |
| Copyright on images | Lottie + small PNG assets appear project-owned; keep originals/licenses on file before commercial use |

---

## Local / US law & school policy flags (not exhaustive)

| Area | Risk | Notes |
|------|------|-------|
| **FERPA / education records** | Medium | Student directory-like data; confirm with UM whether Devora profiles are education records or voluntary directory info |
| **Michigan / US privacy** | Medium | No comprehensive federal privacy statute like GDPR; still need clear notice + security |
| **GDPR / UK GDPR** | Low–Medium if EU users | Michigan-only email gate lowers exposure; cookie banner + policies help if travelers use the site |
| **COPPA** | Low | University audience; policy states not for under-13 |
| **ADA / accessibility** | Medium | Public web UX expectations; continue remediation |
| **CAN-SPAM / email** | Low today | No marketing email blasts implemented |
| **Payments / refunds** | N/A | Free school project — no payments, no refund page |
| **UM acceptable use / Google Workspace** | Medium | Confirm OAuth + student data use with CECS / IT before scale |
| **App Store privacy nutrition** | High if shipping iOS shell | Need live Privacy URL (`/privacy-page`) + data collection disclosures |

---

## Operator business details (current)

- Product: Devora  
- Operator: Chris Shina  
- Contact: `devora@umich.edu`  
- Context: CECS capstone at University of Michigan-Dearborn — **not** an official U-M commercial product  
- Proctor (credits): Dr. Bruce Maxim  

Update Privacy/Terms if a formal legal entity, address, or paid entity is formed.

---

## Residual honesty

No system is zero-risk. Remaining items after the security split:

1. **Deploy** rules/indexes/functions or production still runs the old policy.  
2. Existing classmates need one signed-in visit to publish `discoveryProfiles`.  
3. Policy text still needs human legal review before App Store / wide launch.  
4. CSP + Google Auth need a production smoke test after header changes.  
5. Do not enable Analytics measurement id without verifying consent in prod.
