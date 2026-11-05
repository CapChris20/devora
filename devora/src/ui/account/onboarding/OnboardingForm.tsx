// Multi-step onboarding form where new students build their Devora profile.
// Collects class rank, major, interests, bio, and photo, then saves to Firestore.
// Flow: auth gate → steps 1–5 → upload photo (optional) → saveOnboardingProfile → welcome.
// Pill option lists live in onboarding-options.ts — edit those to change what students can pick.

"use client";

// ===== IMPORTS =====

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// vocab: onAuthStateChanged = Firebase listener; fires when the user signs in or out
import { onAuthStateChanged, type User } from "firebase/auth";

import {
  auth,
  getAuthErrorMessage,
  getUserProfile,
  saveOnboardingProfile,
  type OnboardingPayload,
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
import PillGroup from "@/ui/shared/pills/PillGroup";

// ===== NAMED CONSTANTS =====

const IDENTITY_STEP = 1;
const CAREER_STEP = 2;
const INTERESTS_STEP = 3;
const SIGNUP_REASON_STEP = 4;
const BIO_STEP = 5;
const STEP_TITLE_INDEX_OFFSET = 1;
const PROGRESS_PERCENT_SCALE = 100;
const MINIMUM_BIO_CHARACTER_COUNT = 20;
const MAXIMUM_BIO_CHARACTER_COUNT = 150;
const LOGIN_PATH = "/auth/login";
const DISCOVERY_PATH = "/find-students";
const WELCOME_PATH = "/onboarding/welcome";
const PROFILE_LOAD_ERROR_MESSAGE = "Could not load your profile. Refresh and try again.";
const REQUIRED_FIELDS_ERROR_MESSAGE = "Fill in the required fields before continuing.";
const LOADING_PROFILE_MESSAGE = "Loading your profile…";
const SAVING_BUTTON_LABEL = "Saving…";
const FINISH_BUTTON_LABEL = "Finish";
const CONTINUE_BUTTON_LABEL = "Continue";
const BACK_BUTTON_LABEL = "Back";
const EXPERIENCE_YES_LABEL = "Yes";
const EXPERIENCE_NO_LABEL = "No";
const EXPERIENCE_CHOICES = [EXPERIENCE_YES_LABEL, EXPERIENCE_NO_LABEL] as const;
const EMPTY_PHOTO_URL = "";
const EMPTY_EXPERIENCE_DETAILS = "";
const PHOTO_FILE_FALLBACK_LABEL = "JPG, PNG, or WebP";
const MAJOR_PLACEHOLDER_OPTION = "Select a CECS major";
const ACTIVE_PILL_CLASS_NAME = "onboarding-pill-active";
const DETAILS_TEXTAREA_CLASS_NAME = "sign-in-input min-h-[120px] resize-y";
const VALID_BIO_COUNT_CLASS_NAME = "onboarding-char-count--valid";
const BIO_COUNT_CLASS_NAME = "onboarding-char-count";

// ===== TYPES =====

type OnboardingDraft = {
  classRank: string;
  gender: string;
  age: string;
  major: string;
  careerNiche: string[];
  careerNicheOther: string;
  hasExperience: boolean | null;
  experienceDetails: string;
  casualInterests: string[];
  casualInterestsOther: string;
  aboutYou: string[];
  religion: string;
  signupReason: string[];
  bio: string;
  github: string;
  linkedin: string;
  instagram: string;
};

type FinishOnboardingInput = {
  draft: OnboardingDraft;
  photoFile: File | null;
  router: ReturnType<typeof useRouter>;
  setIsSaving: (isSaving: boolean) => void;
  setErrorMessage: (message: string) => void;
};

// ===== HELPER FUNCTIONS =====

function hasCompletedIdentityStep(classRank: string, gender: string, age: string): boolean {
  // vocab: Boolean = true when every pill has a non-empty choice
  return Boolean(classRank && gender && age);
}

function hasCompletedCareerStep(
  major: string,
  careerNiche: string[],
  hasExperience: boolean | null,
  experienceDetails: string
): boolean {
  const hasChosenMajor = Boolean(major);
  const hasChosenNiche = careerNiche.length > 0;
  // null means they have not answered Yes or No yet. That is different from No.
  const hasAnsweredExperience = hasExperience !== null;
  const hasExperienceWriteUp = experienceDetails.trim().length > 0;
  const isExperienceAnswerComplete = hasExperience === false || hasExperienceWriteUp;
  return hasChosenMajor && hasChosenNiche && hasAnsweredExperience && isExperienceAnswerComplete;
}

function isBioLengthValid(bio: string): boolean {
  const bioLength = bio.trim().length;
  // Manipulate here: keep these limits in sync with the textarea maxLength and the editor
  return bioLength >= MINIMUM_BIO_CHARACTER_COUNT && bioLength <= MAXIMUM_BIO_CHARACTER_COUNT;
}

function canLeaveOnboardingStep(currentStep: number, draft: OnboardingDraft): boolean {
  // Interests are optional, so that step never blocks Continue.
  if (currentStep === IDENTITY_STEP) {
    return hasCompletedIdentityStep(draft.classRank, draft.gender, draft.age);
  }
  if (currentStep === CAREER_STEP) {
    return hasCompletedCareerStep(
      draft.major,
      draft.careerNiche,
      draft.hasExperience,
      draft.experienceDetails
    );
  }
  if (currentStep === INTERESTS_STEP) {
    return true;
  }
  if (currentStep === SIGNUP_REASON_STEP) {
    return draft.signupReason.length > 0;
  }
  if (currentStep === BIO_STEP) {
    return isBioLengthValid(draft.bio);
  }
  return false;
}

function keepCareerNichesForMajor(nextMajor: string, currentNiches: string[]): string[] {
  if (!nextMajor) {
    return [];
  }
  const allowedNiches = getCareerNichesForMajor(nextMajor);
  return currentNiches.filter((niche) => allowedNiches.includes(niche));
}

function isExperienceChoiceSelected(optionLabel: string, hasExperience: boolean | null): boolean {
  const isYesSelected = optionLabel === EXPERIENCE_YES_LABEL && hasExperience === true;
  const isNoSelected = optionLabel === EXPERIENCE_NO_LABEL && hasExperience === false;
  return isYesSelected || isNoSelected;
}

function buildBioCountClassName(bio: string): string {
  const isBioLongEnough = bio.trim().length >= MINIMUM_BIO_CHARACTER_COUNT;
  const validClassName = isBioLongEnough ? VALID_BIO_COUNT_CLASS_NAME : "";
  return `${BIO_COUNT_CLASS_NAME} ${validClassName}`;
}

function readPrimaryButtonLabel(isSaving: boolean, currentStep: number): string {
  if (isSaving) {
    return SAVING_BUTTON_LABEL;
  }
  if (currentStep === ONBOARDING_STEPS) {
    return FINISH_BUTTON_LABEL;
  }
  return CONTINUE_BUTTON_LABEL;
}

function readFirstSelectedFile(fileList: FileList | null): File | null {
  // vocab: ?. = no crash if the file list is missing. ?? = use null when no file was chosen
  return fileList?.[0] ?? null;
}

function buildOnboardingProfilePayload(draft: OnboardingDraft, photoUrl: string): OnboardingPayload {
  return {
    classRank: draft.classRank,
    gender: draft.gender,
    age: draft.age,
    major: draft.major,
    careerNiche: draft.careerNiche,
    careerNicheOther: draft.careerNicheOther.trim(),
    // The form allows null until they answer. Firestore wants a real boolean.
    hasExperience: draft.hasExperience === true,
    // A No answer must not keep leftover text from a flipped Yes.
    experienceDetails: draft.hasExperience
      ? draft.experienceDetails.trim()
      : EMPTY_EXPERIENCE_DETAILS,
    casualInterests: mergeCasualInterests(draft.casualInterests, draft.casualInterestsOther),
    aboutYou: draft.aboutYou,
    // An empty religion string is omitted so Firestore does not store a blank field.
    religion: draft.religion || undefined,
    signupReason: draft.signupReason,
    bio: draft.bio.trim(),
    photoURL: photoUrl,
    links: {
      github: draft.github.trim(),
      linkedin: draft.linkedin.trim(),
      instagram: draft.instagram.trim(),
    },
  };
}

async function uploadOnboardingPhotoIfChosen(userId: string, photoFile: File | null): Promise<string> {
  if (!photoFile) {
    return EMPTY_PHOTO_URL;
  }
  // vocab: uploadProfilePhoto = put the file in Storage and return a public download URL
  // vocab: await = the profile write needs that URL before it runs
  return uploadProfilePhoto(userId, photoFile);
}

async function redirectIfOnboardingFormIsUnavailable(
  user: User | null,
  router: ReturnType<typeof useRouter>,
  setErrorMessage: (message: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> {
  if (!user) {
    // Manipulate here: change LOGIN_PATH if the login route moves
    router.replace(LOGIN_PATH);
    return;
  }

  try {
    // vocab: getUserProfile = load users/{uid} from Firestore
    const profile = await getUserProfile(user.uid);
    // vocab: ?. = if profile is null, skip onboardingComplete
    // vocab / profile field: onboardingComplete = true after a successful Finish save
    if (profile?.onboardingComplete) {
      // Manipulate here: change DISCOVERY_PATH if Discovery’s route renames
      router.replace(DISCOVERY_PATH);
    }
  } catch {
    setErrorMessage(PROFILE_LOAD_ERROR_MESSAGE);
  } finally {
    setIsLoading(false);
  }
}

async function finishOnboardingAndOpenWelcome(input: FinishOnboardingInput): Promise<void> {
  // vocab: auth.currentUser = whoever Firebase says is logged in right now (or null)
  const signedInUser = auth.currentUser;
  if (!signedInUser) {
    input.router.replace(LOGIN_PATH);
    return;
  }

  input.setIsSaving(true);
  try {
    const photoUrl = await uploadOnboardingPhotoIfChosen(signedInUser.uid, input.photoFile);
    // vocab: ?? = if email is missing, save an empty string instead
    // vocab: saveOnboardingProfile = write the fields and set onboardingComplete true
    await saveOnboardingProfile(
      signedInUser.uid,
      signedInUser.email ?? "",
      buildOnboardingProfilePayload(input.draft, photoUrl)
    );
    // Manipulate here: change WELCOME_PATH if the congrats route moves
    input.router.push(WELCOME_PATH);
  } catch (thrownError) {
    input.setErrorMessage(getAuthErrorMessage(thrownError));
  } finally {
    input.setIsSaving(false);
  }
}

function OnboardingIdentityStep({
  draft,
  setClassRank,
  setGender,
  setAge,
}: {
  draft: OnboardingDraft;
  setClassRank: (classRank: string) => void;
  setGender: (gender: string) => void;
  setAge: (age: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Manipulate here: edit CLASS_RANKS / GENDERS / AGES in onboarding-options.ts */}
      <PillGroup
        label="What is your class rank?"
        options={CLASS_RANKS}
        selected={draft.classRank}
        onChange={(value) => setClassRank(value as string)}
      />
      <PillGroup
        label="Gender?"
        options={GENDERS}
        selected={draft.gender}
        onChange={(value) => setGender(value as string)}
      />
      <PillGroup
        label="Age?"
        options={AGES}
        selected={draft.age}
        onChange={(value) => setAge(value as string)}
      />
    </div>
  );
}

function OnboardingCareerStep({
  draft,
  careerNicheOptions,
  onMajorChange,
  setCareerNiche,
  setCareerNicheOther,
  setHasExperience,
  setExperienceDetails,
}: {
  draft: OnboardingDraft;
  careerNicheOptions: readonly string[];
  onMajorChange: (nextMajor: string) => void;
  setCareerNiche: (careerNiche: string[]) => void;
  setCareerNicheOther: (careerNicheOther: string) => void;
  setHasExperience: (hasExperience: boolean) => void;
  setExperienceDetails: (experienceDetails: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Manipulate here: MAJORS and CAREER_NICHES_BY_MAJOR live in onboarding-options.ts */}
      <div className="flex flex-col gap-3">
        <label className="onboarding-field-label" htmlFor="major">
          What is your major?
        </label>
        <select
          id="major"
          className="sign-in-input"
          value={draft.major}
          onChange={(event) => onMajorChange(event.target.value)}
        >
          <option value="">{MAJOR_PLACEHOLDER_OPTION}</option>
          {MAJORS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {draft.major ? (
        <PillGroup
          label="What niche or career are you interested in?"
          options={careerNicheOptions}
          selected={draft.careerNiche}
          multiple
          onChange={(value) => setCareerNiche(value as string[])}
        />
      ) : (
        <p className="text-xs theme-muted">Select your major first to see career niche options.</p>
      )}
      <input
        type="text"
        className="sign-in-input"
        placeholder="More about your niche (optional)"
        value={draft.careerNicheOther}
        onChange={(event) => setCareerNicheOther(event.target.value)}
      />
      <div className="flex flex-col gap-3">
        <p className="onboarding-field-label">Do you have any experience or projects to include?</p>
        <div className="flex gap-3">
          {EXPERIENCE_CHOICES.map((optionLabel) => {
            const isOptionSelected = isExperienceChoiceSelected(optionLabel, draft.hasExperience);
            const pillClassName = `onboarding-pill flex-1 ${
              isOptionSelected ? ACTIVE_PILL_CLASS_NAME : ""
            }`;
            return (
              <button
                key={optionLabel}
                type="button"
                className={pillClassName}
                onClick={() => setHasExperience(optionLabel === EXPERIENCE_YES_LABEL)}
              >
                {optionLabel}
              </button>
            );
          })}
        </div>
      </div>
      {draft.hasExperience ? (
        <textarea
          className={DETAILS_TEXTAREA_CLASS_NAME}
          placeholder="Tell us about your experience or projects…"
          value={draft.experienceDetails}
          onChange={(event) => setExperienceDetails(event.target.value)}
        />
      ) : null}
    </div>
  );
}

function OnboardingInterestsStep({
  draft,
  interestPickCount,
  setCasualInterests,
  setCasualInterestsOther,
  setAboutYou,
  setReligion,
}: {
  draft: OnboardingDraft;
  interestPickCount: number;
  setCasualInterests: (casualInterests: string[]) => void;
  setCasualInterestsOther: (casualInterestsOther: string) => void;
  setAboutYou: (aboutYou: string[]) => void;
  setReligion: (religion: string) => void;
}) {
  const selectedCountHint = interestPickCount > 0 ? ` (${interestPickCount} selected)` : "";

  return (
    <div className="flex max-h-[min(58vh,520px)] flex-col gap-5 overflow-y-auto pr-1">
      {/* Manipulate here: PERSONAL_INTEREST_GROUPS / ABOUT_YOU / RELIGIONS in onboarding-options.ts */}
      <p className="text-xs theme-muted">
        Pick whatever fits you — no need to fill every category. All of this is optional.
        {selectedCountHint}
      </p>
      {PERSONAL_INTEREST_GROUPS.map((group) => (
        <PillGroup
          key={group.label}
          label={`${group.label} (optional)`}
          options={group.options}
          selected={draft.casualInterests}
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
          value={draft.casualInterestsOther}
          onChange={(event) => setCasualInterestsOther(event.target.value)}
        />
      </div>
      <PillGroup
        label="What would you like people to know about you? (optional)"
        options={ABOUT_YOU}
        selected={draft.aboutYou}
        multiple
        onChange={(value) => setAboutYou(value as string[])}
      />
      <div className="flex flex-col gap-3">
        <PillGroup
          label="Optional: belief system or religion?"
          options={RELIGIONS}
          selected={draft.religion}
          onChange={(value) => setReligion(value as string)}
        />
        <p className="text-xs leading-relaxed theme-muted">{RELIGION_DISCLAIMER}</p>
      </div>
    </div>
  );
}

function OnboardingReasonStep({
  draft,
  setSignupReason,
}: {
  draft: OnboardingDraft;
  setSignupReason: (signupReason: string[]) => void;
}) {
  return (
    <PillGroup
      label="What led you to sign up for Devora?"
      options={SIGNUP_REASONS}
      selected={draft.signupReason}
      multiple
      onChange={(value) => setSignupReason(value as string[])}
    />
  );
}

function OnboardingBioStep({
  draft,
  photoFile,
  setPhotoFile,
  setBio,
  setGithub,
  setLinkedin,
  setInstagram,
}: {
  draft: OnboardingDraft;
  photoFile: File | null;
  setPhotoFile: (photoFile: File | null) => void;
  setBio: (bio: string) => void;
  setGithub: (github: string) => void;
  setLinkedin: (linkedin: string) => void;
  setInstagram: (instagram: string) => void;
}) {
  const photoName = photoFile?.name ?? PHOTO_FILE_FALLBACK_LABEL;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <label className="onboarding-field-label" htmlFor="photo">
          Optional profile picture
        </label>
        <label className="sign-in-file-picker" htmlFor="photo">
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="sign-in-file-input"
            onChange={(event) => setPhotoFile(readFirstSelectedFile(event.target.files))}
          />
          <span className="sign-in-file-btn">Choose photo</span>
          <span className="sign-in-file-name">{photoName}</span>
        </label>
      </div>
      <div className="flex flex-col gap-3">
        <label className="onboarding-field-label" htmlFor="bio">
          Bio ({MINIMUM_BIO_CHARACTER_COUNT}–{MAXIMUM_BIO_CHARACTER_COUNT} characters)
        </label>
        <textarea
          id="bio"
          className={DETAILS_TEXTAREA_CLASS_NAME}
          placeholder="A short intro — who you are, what you’re into, who you’d like to meet…"
          value={draft.bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={MAXIMUM_BIO_CHARACTER_COUNT}
        />
        <p className={buildBioCountClassName(draft.bio)}>
          {draft.bio.trim().length}/{MAXIMUM_BIO_CHARACTER_COUNT}
        </p>
      </div>
      <div className="onboarding-link-group">
        <p className="onboarding-field-label">Social links (optional)</p>
        <div className="onboarding-link-field">
          <span className="onboarding-link-tag">GH</span>
          <input
            type="url"
            className="sign-in-input"
            placeholder="github.com/username"
            value={draft.github}
            onChange={(event) => setGithub(event.target.value)}
          />
        </div>
        <div className="onboarding-link-field">
          <span className="onboarding-link-tag">IN</span>
          <input
            type="url"
            className="sign-in-input"
            placeholder="linkedin.com/in/username"
            value={draft.linkedin}
            onChange={(event) => setLinkedin(event.target.value)}
          />
        </div>
        <div className="onboarding-link-field">
          <span className="onboarding-link-tag">IG</span>
          <input
            type="url"
            className="sign-in-input"
            placeholder="instagram.com/username"
            value={draft.instagram}
            onChange={(event) => setInstagram(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Five-step onboarding wizard. Local state stays here until Finish writes Firebase.
 * @returns The current step form, or a spinner while auth is checked
 */
export default function OnboardingForm() {
  // vocab: useRouter = Next.js helper that navigates without a full reload
  const router = useRouter();
  // vocab: useState = store a value and re-render when the setter is called
  // Manipulate here: start at step 1. Raising ONBOARDING_STEPS also needs a new step check.
  const [currentStep, setCurrentStep] = useState(IDENTITY_STEP);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Names match Firestore profile fields. Each setter is wired to a pill or input below.
  // vocab / profile field: classRank = Freshman through Graduate
  const [classRank, setClassRank] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [careerNiche, setCareerNiche] = useState<string[]>([]);
  const [careerNicheOther, setCareerNicheOther] = useState("");
  // null means Yes/No is still unanswered. canContinue treats that differently from No.
  const [hasExperience, setHasExperience] = useState<boolean | null>(null);
  const [experienceDetails, setExperienceDetails] = useState("");
  const [casualInterests, setCasualInterests] = useState<string[]>([]);
  const [casualInterestsOther, setCasualInterestsOther] = useState("");
  const [aboutYou, setAboutYou] = useState<string[]>([]);
  const [religion, setReligion] = useState("");
  const [signupReason, setSignupReason] = useState<string[]>([]);
  // Manipulate here: bio length rules live in isBioLengthValid and maxLength together
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  // vocab: File | null = the chosen photo, uploaded only when they press Finish
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void redirectIfOnboardingFormIsUnavailable(user, router, setErrorMessage, setIsLoading);
    });
    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  const draft: OnboardingDraft = {
    classRank,
    gender,
    age,
    major,
    careerNiche,
    careerNicheOther,
    hasExperience,
    experienceDetails,
    casualInterests,
    casualInterestsOther,
    aboutYou,
    religion,
    signupReason,
    bio,
    github,
    linkedin,
    instagram,
  };

  // Manipulate here: progress assumes steps 1 through ONBOARDING_STEPS are weighted evenly
  const progressPercent = (currentStep / ONBOARDING_STEPS) * PROGRESS_PERCENT_SCALE;
  const careerNicheOptions = getCareerNichesForMajor(major);
  const interestPickCount = mergeCasualInterests(casualInterests, casualInterestsOther).length;
  const canContinue = canLeaveOnboardingStep(currentStep, draft);
  const stepTitle = STEP_TITLES[currentStep - STEP_TITLE_INDEX_OFFSET];

  const applyMajorChange = (nextMajor: string) => {
    setMajor(nextMajor);
    // Drop niches from the previous major so a switch cannot keep an unrelated tag.
    setCareerNiche((currentNiches) => keepCareerNichesForMajor(nextMajor, currentNiches));
  };

  const submitCurrentStep = (event: FormEvent) => {
    // vocab: preventDefault = stop the browser from reloading the page
    event.preventDefault();
    setErrorMessage("");

    if (currentStep < ONBOARDING_STEPS) {
      if (!canLeaveOnboardingStep(currentStep, draft)) {
        setErrorMessage(REQUIRED_FIELDS_ERROR_MESSAGE);
        return;
      }
      setCurrentStep((previousStep) => previousStep + 1);
      return;
    }

    // vocab: void = start the save without making this click handler itself async
    void finishOnboardingAndOpenWelcome({
      draft,
      photoFile,
      router,
      setIsSaving,
      setErrorMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="sign-in-spinner" />
        <p className="theme-muted text-sm">{LOADING_PROFILE_MESSAGE}</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={submitCurrentStep}>
      <div>
        <h2 className="onboarding-step-heading">{stepTitle}</h2>
        <div className="mt-3 flex items-center justify-between text-xs theme-muted">
          <span className="mono font-bold tracking-wider uppercase">
            Step {String(currentStep).padStart(2, "0")} / {String(ONBOARDING_STEPS).padStart(2, "0")}
          </span>
          <span className="mono font-bold text-white">{Math.round(progressPercent)}%</span>
        </div>
        <div className="onboarding-progress-track mt-2">
          <div className="onboarding-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {errorMessage ? <div className="sign-in-error">{errorMessage}</div> : null}

      {currentStep === IDENTITY_STEP ? (
        <OnboardingIdentityStep
          draft={draft}
          setClassRank={setClassRank}
          setGender={setGender}
          setAge={setAge}
        />
      ) : null}

      {currentStep === CAREER_STEP ? (
        <OnboardingCareerStep
          draft={draft}
          careerNicheOptions={careerNicheOptions}
          onMajorChange={applyMajorChange}
          setCareerNiche={setCareerNiche}
          setCareerNicheOther={setCareerNicheOther}
          setHasExperience={setHasExperience}
          setExperienceDetails={setExperienceDetails}
        />
      ) : null}

      {currentStep === INTERESTS_STEP ? (
        <OnboardingInterestsStep
          draft={draft}
          interestPickCount={interestPickCount}
          setCasualInterests={setCasualInterests}
          setCasualInterestsOther={setCasualInterestsOther}
          setAboutYou={setAboutYou}
          setReligion={setReligion}
        />
      ) : null}

      {currentStep === SIGNUP_REASON_STEP ? (
        // Manipulate here: edit SIGNUP_REASONS in onboarding-options.ts
        <OnboardingReasonStep draft={draft} setSignupReason={setSignupReason} />
      ) : null}

      {currentStep === BIO_STEP ? (
        <OnboardingBioStep
          draft={draft}
          photoFile={photoFile}
          setPhotoFile={setPhotoFile}
          setBio={setBio}
          setGithub={setGithub}
          setLinkedin={setLinkedin}
          setInstagram={setInstagram}
        />
      ) : null}

      <div className="flex gap-4 pt-3">
        {currentStep > IDENTITY_STEP ? (
          <button
            type="button"
            className="btn-ghost onboarding-nav-btn flex-1"
            onClick={() => setCurrentStep((previousStep) => previousStep - 1)}
            disabled={isSaving}
          >
            {BACK_BUTTON_LABEL}
          </button>
        ) : null}
        <button
          type="submit"
          className="btn-primary onboarding-nav-btn flex-1"
          disabled={isSaving || !canContinue}
        >
          {readPrimaryButtonLabel(isSaving, currentStep)}
        </button>
      </div>

      <style jsx>{`
        .onboarding-step-heading {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 2.5vw, 26px);
          text-transform: uppercase;
          color: white;
          letter-spacing: -0.01em;
          margin: 0;
        }

        :global(.onboarding-nav-btn) {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        :global(.onboarding-nav-btn:disabled) {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
