// Multi-step onboarding form where new students build their Devora profile.
// Collects class rank, major, interests, bio, and photo, then saves to Firestore.
// Flow: auth gate → steps 1–5 → upload photo (optional) → saveOnboardingProfile → welcome.
// Pill option lists live in onboarding-options.ts — edit those to change what students can pick.

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires when user signs in or out
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  getAuthErrorMessage,
  getUserProfile,
  saveOnboardingProfile,
} from "@/backend/firebase";
import { uploadProfilePhoto } from "@/backend/firebase/storage-upload";

import {
  ABOUT_YOU,
  AGES,
  CLASS_RANKS,
  GENDERS,
  getCareerNichesForMajor,
  MAJORS,
  mergeCasualInterests,
  ONBOARDING_STEPS,
  PERSONAL_INTEREST_GROUPS,
  RELIGION_DISCLAIMER,
  RELIGIONS,
  SIGNUP_REASONS,
  STEP_TITLES,
} from "./onboarding-options";
import PillGroup from "@/ui/shared/PillGroup";

// Main onboarding wizard — five steps of local state, then one Finish write to Firebase.
export default function OnboardingForm() {
  // vocab: useRouter = Next.js helper that lets us navigate (push/replace) without a full reload
  const router = useRouter();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // step = which wizard page (1–5) the student is on right now
  // Manipulate here: start at 1; raising ONBOARDING_STEPS alone isn’t enough — add a case in canContinue + JSX
  const [step, setStep] = useState(1);
  // isSaving = true while Finish is writing to Firebase (disables Back / Finish)
  const [isSaving, setIsSaving] = useState(false);
  // isLoading = true until we know they’re logged in and still need onboarding
  const [isLoading, setIsLoading] = useState(true);
  // error = red banner text under the progress bar (empty string = hidden)
  const [error, setError] = useState("");

  // --- Form fields collected across all steps (written to Firestore on Finish) ---
  // Each setter is wired to a PillGroup / input below. Names match Firestore profile fields.
  // vocab / profile field: classRank = Freshman–Graduate (step 1)
  const [classRank, setClassRank] = useState("");
  // vocab / profile field: gender = Woman / Man / etc. (step 1)
  const [gender, setGender] = useState("");
  // vocab / profile field: age = age pill like "19" or "25+" (step 1)
  const [age, setAge] = useState("");
  // vocab / profile field: major = CECS major from the dropdown (step 2)
  const [major, setMajor] = useState("");
  // vocab / profile field: careerNiche = multi-select career tags for that major (step 2)
  // vocab/symbol: string[] = a list of strings (can pick more than one niche)
  const [careerNiche, setCareerNiche] = useState<string[]>([]);
  // Free-text extra niche note (optional) — stored as careerNicheOther
  const [careerNicheOther, setCareerNicheOther] = useState("");
  // vocab/symbol: boolean | null = Yes/No not chosen yet (null), then true or false
  // null is important: canContinue treats “not answered” differently from “No”
  const [hasExperience, setHasExperience] = useState<boolean | null>(null);
  // Project / internship write-up (required only if hasExperience is true)
  const [experienceDetails, setExperienceDetails] = useState("");
  // vocab / profile field: casualInterests = hobby pills from step 3
  const [casualInterests, setCasualInterests] = useState<string[]>([]);
  // Comma-typed custom interests — merged into casualInterests on save via mergeCasualInterests
  const [casualInterestsOther, setCasualInterestsOther] = useState("");
  // vocab / profile field: aboutYou = "looking for" tags (study partner, etc.)
  const [aboutYou, setAboutYou] = useState<string[]>([]);
  // Optional religion / belief pill (may stay empty → omitted from Firestore)
  const [religion, setReligion] = useState("");
  // vocab / profile field: signupReason = why they joined Devora (step 4, multi-select)
  const [signupReason, setSignupReason] = useState<string[]>([]);
  // vocab / profile field: bio = short intro shown on Discovery (20–150 chars)
  // Manipulate here: change the 20/150 rules in canContinue AND the textarea maxLength together
  const [bio, setBio] = useState("");
  // Optional social URLs stored under profile.links.{github,linkedin,instagram}
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  // vocab: File | null = browser File object from <input type="file">, or null if none chosen
  // Uploaded only on Finish (not live as they pick the file)
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Auth gate — only signed-in students who still need onboarding may use this form.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    // onAuthStateChanged fires once with the current user, then again on sign-in/out.
    // vocab: unsubscribe = function Firebase gives us to stop listening
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not signed in — send them to login (they can’t write a profile without Auth).
      // vocab/symbol: !user means "no user" — Firebase passed null
      if (!user) {
        // vocab: router.replace = navigate without adding a history entry (Back won’t return here)
        // Manipulate here: change "/auth/login" if the login route moves
        router.replace("/auth/login");
        return;
      }

      try {
        // Already finished onboarding — skip this form and go to Discovery.
        // vocab: getUserProfile = load users/{uid} document from Firestore
        // vocab: uid = Firebase Auth user id (unique per Google account)
        const profile = await getUserProfile(user.uid);
        // vocab/symbol: ?. = optional chaining — if profile is null, skip onboardingComplete
        // vocab / profile field: onboardingComplete = true after a successful Finish save
        if (profile?.onboardingComplete) {
          // Manipulate here: change "/find-students" if Discovery’s route renames
          router.replace("/find-students");
          return;
        }
      } catch {
        setError("Could not load your profile. Refresh and try again.");
      } finally {
        // Always hide the spinner once the auth check finishes (success or fail).
        // vocab: finally = runs after try/catch either way
        setIsLoading(false);
      }
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    // so we don’t keep listening after leaving the page
    return unsubscribe;
  }, [router]);

  // Progress bar percent and derived lists for the current major / interest picks.
  // Manipulate here: progress math assumes steps are 1…ONBOARDING_STEPS evenly weighted
  const progress = (step / ONBOARDING_STEPS) * 100;
  // Niches depend on major — empty list until a major is chosen (hides the PillGroup).
  // vocab: getCareerNichesForMajor = look up CAREER_NICHES_BY_MAJOR[major] (or [])
  const careerNicheOptions = getCareerNichesForMajor(major);
  // How many interest pills + custom items are selected (shown in step 3 hint).
  const interestPickCount = mergeCasualInterests(
    casualInterests,
    casualInterestsOther
  ).length;

  // When major changes, drop career niches that don’t belong to the new major.
  // Without this, a Software Eng student could keep “VLSI” after switching from CompE.
  function handleMajorChange(nextMajor: string) {
    setMajor(nextMajor);

    // Cleared major (back to “Select a CECS major”) — clear niches too.
    if (!nextMajor) {
      setCareerNiche([]);
      return;
    }

    // Keep only niches that are valid for the newly chosen major.
    // vocab/symbol: filter = keep items where the callback returns true
    // vocab/symbol: (current) => … = functional update; uses latest careerNiche safely
    const allowed = getCareerNichesForMajor(nextMajor);
    setCareerNiche((current) => current.filter((niche) => allowed.includes(niche)));
  }

  // Each step has different required fields before Continue / Finish is enabled.
  // This also drives the disabled state on the primary button.
  // Manipulate here: relax or tighten a step by editing that case only
  function canContinue(): boolean {
    // vocab: switch = pick one case based on step number
    switch (step) {
      case 1:
        // Need class rank, gender, and age (all single-select pills).
        // vocab: Boolean(x) = true if x is non-empty / truthy
        return Boolean(classRank && gender && age);
      case 2:
        // Need major, ≥1 niche, and experience Yes/No.
        // If Yes, experienceDetails must be non-empty after trim.
        return (
          Boolean(major) &&
          careerNiche.length > 0 &&
          hasExperience !== null &&
          (hasExperience === false || experienceDetails.trim().length > 0)
        );
      case 3:
        // Interests / about-you / religion are fully optional — always allow Continue.
        return true;
      case 4:
        // Need at least one signup reason pill.
        return signupReason.length > 0;
      case 5:
        // Bio must be 20–150 characters (trim ignores leading/trailing spaces).
        // Photo + social links are optional.
        return bio.trim().length >= 20 && bio.trim().length <= 150;
      default:
        return false;
    }
  }

  // Advance to next step, or save everything on the last step.
  // Continue and Finish are the SAME submit button — behavior branches on `step`.
  // vocab: FormEvent = browser form submit event (Enter key or Finish/Continue button)
  async function handleSubmit(event: FormEvent) {
    // vocab/symbol: preventDefault — stop the browser from doing a full page reload
    event.preventDefault();
    setError("");

    // Not on the last step yet — validate, then bump step.
    if (step < ONBOARDING_STEPS) {
      if (!canContinue()) {
        setError("Fill in the required fields before continuing.");
        return;
      }
      // vocab/symbol: (current) => current + 1 = functional update; safest when new value depends on old
      setStep((current) => current + 1);
      return;
    }

    // Last step — must still be signed in to write the profile.
    // vocab: auth.currentUser = whoever Firebase says is logged in right now (or null)
    // We re-check here because the session could expire while they fill the wizard.
    const user = auth.currentUser;
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    setIsSaving(true);
    try {
      // Optional photo upload to Storage FIRST; then save all fields to Firestore.
      // Order matters: we need the download URL string before calling saveOnboardingProfile.
      // vocab: Firebase Storage = file bucket for images; Firestore = database for profile fields
      let photoURL = "";
      if (photoFile) {
        // vocab: uploadProfilePhoto = put the file in Storage and return a public download URL string
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      }

      // vocab: saveOnboardingProfile = write all fields + set onboardingComplete: true
      // After this succeeds, login will skip the wizard and go to Discovery (unless deactivated).
      // vocab/symbol: ?? = if email is missing, use empty string instead
      await saveOnboardingProfile(user.uid, user.email ?? "", {
        classRank,
        gender,
        age,
        major,
        careerNiche,
        careerNicheOther: careerNicheOther.trim(),
        // hasExperience was boolean|null in the UI; Firestore wants a real boolean
        hasExperience: hasExperience === true,
        // Clear details if they said No — don’t save leftover text from a flipped Yes→No
        experienceDetails: hasExperience ? experienceDetails.trim() : "",
        // Merge pill picks + comma-typed customs into one deduped list
        casualInterests: mergeCasualInterests(
          casualInterests,
          casualInterestsOther
        ),
        aboutYou,
        // vocab/symbol: || undefined = if religion is "", store undefined (field omitted)
        religion: religion || undefined,
        signupReason,
        bio: bio.trim(),
        photoURL,
        links: {
          github: github.trim(),
          linkedin: linkedin.trim(),
          instagram: instagram.trim(),
        },
      });

      // vocab: router.push = navigate and keep history (Back can return to the form)
      // Manipulate here: change "/onboarding/welcome" if the congrats route moves
      router.push("/onboarding/welcome");
    } catch (err) {
      // Turn Firebase / Storage errors into a friendly message under the form.
      // vocab: getAuthErrorMessage = map Firebase error codes to human text
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  // Loading spinner while we check auth and profile status.
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="sign-in-spinner" />
        <p className="theme-muted text-sm">Loading your profile…</p>
      </div>
    );
  }

  return (
    // vocab: onSubmit = runs handleSubmit when Continue/Finish is clicked (or Enter)
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Step title + progress bar */}
      <div>
        <p className="font-display headline-grad text-xl font-bold">
          {/* STEP_TITLES is 0-indexed; step is 1-indexed → subtract 1 */}
          {STEP_TITLES[step - 1]}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs theme-muted">
          <span>
            Step {step} of {ONBOARDING_STEPS}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="onboarding-progress-track mt-2">
          {/* width percent drives the filled bar visually */}
          <div className="onboarding-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Red error banner — only when error string is non-empty */}
      {error ? <div className="sign-in-error">{error}</div> : null}

      {/* Step 1 — class rank, gender, age (all single-select pills) */}
      {/* Manipulate here: edit CLASS_RANKS / GENDERS / AGES in onboarding-options.ts to change pills */}
      {step === 1 ? (
        <div className="flex flex-col gap-5">
          <PillGroup
            label="What is your class rank?"
            options={CLASS_RANKS}
            selected={classRank}
            // vocab/symbol: as string = tell TypeScript this onChange value is one string (not string[])
            // PillGroup’s onChange type is string | string[]; single-select always returns string
            onChange={(value) => setClassRank(value as string)}
          />
          <PillGroup
            label="Gender?"
            options={GENDERS}
            selected={gender}
            onChange={(value) => setGender(value as string)}
          />
          <PillGroup
            label="Age?"
            options={AGES}
            selected={age}
            onChange={(value) => setAge(value as string)}
          />
        </div>
      ) : null}

      {/* Step 2 — major dropdown, career niche pills, experience Yes/No */}
      {/* Manipulate here: MAJORS + CAREER_NICHES_BY_MAJOR live in onboarding-options.ts */}
      {step === 2 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label className="onboarding-field-label" htmlFor="major">
              What is your major?
            </label>
            {/* vocab: <select> = native dropdown; value is controlled by React state */}
            <select
              id="major"
              className="sign-in-input"
              value={major}
              onChange={(event) => handleMajorChange(event.target.value)}
            >
              <option value="">Select a CECS major</option>
              {MAJORS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {/* Career niches only appear after a major is chosen */}
          {major ? (
            <PillGroup
              label="What niche or career are you interested in?"
              options={careerNicheOptions}
              selected={careerNiche}
              // vocab: multiple = allow picking several pills at once
              multiple
              onChange={(value) => setCareerNiche(value as string[])}
            />
          ) : (
            <p className="text-xs theme-muted">
              Select your major first to see career niche options.
            </p>
          )}
          <input
            type="text"
            className="sign-in-input"
            placeholder="More about your niche (optional)"
            value={careerNicheOther}
            onChange={(event) => setCareerNicheOther(event.target.value)}
          />
          <div className="flex flex-col gap-3">
            <p className="onboarding-field-label">
              Do you have any experience or projects to include?
            </p>
            <div className="flex gap-3">
              {/* Yes / No buttons that set hasExperience true or false */}
              {["Yes", "No"].map((option) => {
                const active =
                  (option === "Yes" && hasExperience === true) ||
                  (option === "No" && hasExperience === false);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`onboarding-pill flex-1 ${active ? "onboarding-pill-active" : ""}`}
                    onClick={() => setHasExperience(option === "Yes")}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Details box only when they said Yes to experience */}
          {hasExperience ? (
            <textarea
              className="sign-in-input min-h-[120px] resize-y"
              placeholder="Tell us about your experience or projects…"
              value={experienceDetails}
              onChange={(event) => setExperienceDetails(event.target.value)}
            />
          ) : null}
        </div>
      ) : null}

      {/* Step 3 — interests, about you, religion (all optional — canContinue always true) */}
      {/* Manipulate here: PERSONAL_INTEREST_GROUPS / ABOUT_YOU / RELIGIONS in onboarding-options.ts */}
      {step === 3 ? (
        <div className="flex max-h-[min(58vh,520px)] flex-col gap-5 overflow-y-auto pr-1">
          <p className="text-xs theme-muted">
            Pick whatever fits you — no need to fill every category. All of this is optional.
            {interestPickCount > 0 ? ` (${interestPickCount} selected)` : ""}
          </p>
          {/* One PillGroup per interest category (sports, music, etc.) */}
          {PERSONAL_INTEREST_GROUPS.map((group) => (
            <PillGroup
              key={group.label}
              label={`${group.label} (optional)`}
              options={group.options}
              selected={casualInterests}
              multiple
              onChange={(value) => setCasualInterests(value as string[])}
            />
          ))}
          <div className="flex flex-col gap-3">
            <label className="onboarding-field-label" htmlFor="casualInterestsOther">
              Add your own interests (optional)
            </label>
            <input
              id="casualInterestsOther"
              type="text"
              className="sign-in-input"
              placeholder="e.g. Knitting, F1, Pottery — separate with commas"
              value={casualInterestsOther}
              onChange={(event) => setCasualInterestsOther(event.target.value)}
            />
          </div>
          <PillGroup
            label="What would you like people to know about you? (optional)"
            options={ABOUT_YOU}
            selected={aboutYou}
            multiple
            onChange={(value) => setAboutYou(value as string[])}
          />
          <div className="flex flex-col gap-3">
            <PillGroup
              label="Optional: belief system or religion?"
              options={RELIGIONS}
              selected={religion}
              onChange={(value) => setReligion(value as string)}
            />
            <p className="text-xs leading-relaxed theme-muted">{RELIGION_DISCLAIMER}</p>
          </div>
        </div>
      ) : null}

      {/* Step 4 — why they signed up (at least one pill required) */}
      {/* Manipulate here: edit SIGNUP_REASONS in onboarding-options.ts */}
      {step === 4 ? (
        <PillGroup
          label="What led you to sign up for Devora?"
          options={SIGNUP_REASONS}
          selected={signupReason}
          multiple
          onChange={(value) => setSignupReason(value as string[])}
        />
      ) : null}

      {/* Step 5 — optional photo, required bio (20–150), optional social URLs */}
      {step === 5 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label className="onboarding-field-label" htmlFor="photo">
              Optional profile picture
            </label>
            <label className="sign-in-file-picker" htmlFor="photo">
              {/* Hidden native file input; styled button sits beside the file name */}
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="sign-in-file-input"
                onChange={(event) =>
                  // vocab/symbol: files?.[0] ?? null = first chosen file, or null if none
                  setPhotoFile(event.target.files?.[0] ?? null)
                }
              />
              <span className="sign-in-file-btn">Choose photo</span>
              <span className="sign-in-file-name">
                {photoFile?.name ?? "JPG, PNG, or WebP"}
              </span>
            </label>
          </div>
          <div className="flex flex-col gap-3">
            <label className="onboarding-field-label" htmlFor="bio">
              Bio (20–150 characters)
            </label>
            <textarea
              id="bio"
              className="sign-in-input min-h-[120px] resize-y"
              placeholder="Tell collaborators what you're building or looking for…"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={150}
            />
            {/* Green count style once they hit the 20-char minimum */}
            <p
              className={`onboarding-char-count ${
                bio.trim().length >= 20 ? "onboarding-char-count--valid" : ""
              }`}
            >
              {bio.trim().length}/150
            </p>
          </div>
          {/* Optional GitHub / LinkedIn / Instagram URLs */}
          <div className="onboarding-link-group">
            <p className="onboarding-field-label">Social links (optional)</p>
            <div className="onboarding-link-field">
              <span className="onboarding-link-tag">GH</span>
              <input
                type="url"
                className="sign-in-input"
                placeholder="github.com/username"
                value={github}
                onChange={(event) => setGithub(event.target.value)}
              />
            </div>
            <div className="onboarding-link-field">
              <span className="onboarding-link-tag">IN</span>
              <input
                type="url"
                className="sign-in-input"
                placeholder="linkedin.com/in/username"
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
              />
            </div>
            <div className="onboarding-link-field">
              <span className="onboarding-link-tag">IG</span>
              <input
                type="url"
                className="sign-in-input"
                placeholder="instagram.com/username"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Back (steps 2–5) + Continue / Finish — both live outside the step conditionals */}
      <div className="flex gap-3">
        {step > 1 ? (
          <button
            type="button"
            className="sign-in-google-btn flex-1"
            // Functional update so Back always uses the latest step value
            onClick={() => setStep((current) => current - 1)}
            disabled={isSaving}
          >
            Back
          </button>
        ) : null}
        <button
          type="submit"
          className="btn-neon font-display flex-1 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
          // Disabled while saving OR while required fields on this step are incomplete
          // Label flips to Finish only on the last step (same button, same handleSubmit)
          disabled={isSaving || !canContinue()}
        >
          {isSaving ? "Saving…" : step === ONBOARDING_STEPS ? "Finish" : "Continue"}
        </button>
      </div>
    </form>
  );
}
