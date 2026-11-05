// Written copy for Privacy, Terms, and Cookie policy pages.
// Flow: each page imports one DOCUMENT_* export and maps sections into LegalDocumentView.
// Used by privacy-page, terms-page, and cookies-page.
// WHY: keep legal prose in one file so routes stay thin. Not a substitute for a lawyer review.

// ===== NAMED CONSTANTS =====

export const LEGAL_LAST_UPDATED = "October 26, 2026";

export const BUSINESS_OPERATOR_NAME = "Chris Shina";
export const BUSINESS_PRODUCT_NAME = "Devora";
export const BUSINESS_SCHOOL_NAME = "University of Michigan-Dearborn";
export const BUSINESS_COLLEGE_NAME = "College of Engineering and Computer Science (CECS)";
export const BUSINESS_CONTACT_EMAIL = "devora@umich.edu";
export const BUSINESS_CONTEXT =
  "Devora is a student capstone project affiliated with CECS at the University of Michigan-Dearborn. It is not an official University of Michigan product, and it is not a paid commercial service today.";

// ===== TYPES =====

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  summary: string;
  sections: LegalSection[];
};

// ===== MAIN DOCUMENTS =====

export const PRIVACY_POLICY_DOCUMENT: LegalDocument = {
  title: "Privacy Policy",
  summary:
    "How Devora collects, uses, stores, and shares student data. We aim to collect only what the product needs to verify Michigan students and help classmates find each other.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        BUSINESS_CONTEXT,
        `Operator: ${BUSINESS_OPERATOR_NAME}. Contact: ${BUSINESS_CONTACT_EMAIL}.`,
        `School context: ${BUSINESS_SCHOOL_NAME}, ${BUSINESS_COLLEGE_NAME}.`,
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "Account basics: Michigan school email, first name, last name, and a Firebase Auth user id from Google sign-in.",
        "Profile details you choose to add: major, class rank, age range, gender, career niche, experience notes, interests, bio, optional religion, signup reasons, social links, and an optional profile photo.",
        "Settings: Discovery visibility, notification preferences, and messaging preferences.",
        "Technical data needed to run the app: authentication session data from Firebase Auth, and a theme preference saved in your browser (dark or light).",
        "We do not sell personal data. We do not run third-party ad networks on the site today.",
      ],
    },
    {
      heading: "Why we collect it",
      paragraphs: [
        "To verify that accounts belong to University of Michigan students (@umich.edu or @umd.umich.edu).",
        "To power Discovery search and classmate browsing for students who keep a public profile.",
        "To let you edit your profile, change privacy settings, deactivate, or delete your account.",
        "Optional religion and similar sensitive fields are collected only when you provide them, and the product treats them as private profile fields. Classmates should not see them on Discovery cards.",
      ],
    },
    {
      heading: "How we store and share data",
      paragraphs: [
        "Profiles and photos are stored with Google Firebase (Authentication, Firestore, and Storage).",
        "Signed-in Michigan classmates may see public Discovery fields for profiles that are public, finished onboarding, and not deactivated.",
        "Private fields such as email, religion, and signup reasons are intended for account use, not Discovery cards. Server rules continue to be tightened so private documents are not broadly readable.",
        "We may disclose information if required by law, to protect safety, or to investigate abuse.",
      ],
    },
    {
      heading: "Cookies, local storage, and analytics",
      paragraphs: [
        "See the Cookie Policy for storage details. Essential storage keeps you signed in and remembers theme.",
        "Firebase Analytics is prepared in code but is not turned on unless you opt in through the cookie banner and a measurement id is configured.",
        "We do not embed third-party videos, maps, or ad iframes on Devora pages today.",
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        "You can edit profile fields, hide your profile from Discovery, deactivate your account, or delete your account in Settings.",
        "You can change cookie / analytics preferences from the cookie banner controls described on the Cookie Policy page.",
        "Contact us at the email above to ask privacy questions. Formal data-export tooling is still on the roadmap.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "Devora is built for university students. It is not directed at children under 13, and we do not knowingly collect data from children under 13.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        `We may update this policy. The “Last updated” date at the top of the page will change when we do. Last updated: ${LEGAL_LAST_UPDATED}.`,
      ],
    },
  ],
};

export const TERMS_OF_SERVICE_DOCUMENT: LegalDocument = {
  title: "Terms of Service",
  summary:
    "Rules for using Devora. By creating an account or using the site, you agree to these terms.",
  sections: [
    {
      heading: "The service",
      paragraphs: [
        BUSINESS_CONTEXT,
        "Devora helps CECS and University of Michigan-Dearborn students discover and connect with classmates. Features may change while the capstone ships.",
      ],
    },
    {
      heading: "Eligibility",
      paragraphs: [
        "You must use a University of Michigan Google account with an @umich.edu or @umd.umich.edu email.",
        "You must be able to form a binding agreement under applicable law. If you are under 18, use the service only with a parent or guardian’s permission where required.",
      ],
    },
    {
      heading: "Accounts and authenticity",
      paragraphs: [
        "Keep your Google account secure. Do not share access intended only for you.",
        "Provide accurate profile information. Do not impersonate other students or invent credentials.",
        "Michigan email checks reduce fake accounts, but no system is perfect. Report abuse to the contact email below.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "Do not harass, stalk, threaten, or discriminate against other students.",
        "Do not upload malware, scrape the service aggressively, attempt to break security controls, or probe other users’ private data.",
        "Do not post illegal content, non-consensual intimate imagery, or content that violates another person’s rights.",
        "Social links must point to real https profiles you control. Dangerous URL schemes are blocked.",
      ],
    },
    {
      heading: "Content you submit",
      paragraphs: [
        "You keep ownership of your profile text and photos. You grant Devora a limited license to host and display that content so the product can work.",
        "You are responsible for the content you upload and the links you share.",
      ],
    },
    {
      heading: "No warranties",
      paragraphs: [
        "Devora is provided “as is” for educational / capstone purposes. We do not promise uninterrupted uptime, perfect matching, job outcomes, or error-free software.",
        "Networking outcomes depend on people, not on guarantees from this site.",
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        "To the fullest extent allowed by law, the operator is not liable for indirect, incidental, or consequential damages arising from use of Devora.",
        "Because the product is free today, liability for direct damages is limited to the greatest extent permitted by applicable law.",
      ],
    },
    {
      heading: "Termination",
      paragraphs: [
        "You may deactivate or delete your account in Settings. We may suspend or remove accounts that break these terms or create safety risk.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Questions: ${BUSINESS_CONTACT_EMAIL}. Operator: ${BUSINESS_OPERATOR_NAME}.`,
        `Last updated: ${LEGAL_LAST_UPDATED}.`,
      ],
    },
  ],
};

export const COOKIE_POLICY_DOCUMENT: LegalDocument = {
  title: "Cookie Policy",
  summary:
    "What Devora stores in your browser, why, and when we ask for consent.",
  sections: [
    {
      heading: "Do we need cookie consent?",
      paragraphs: [
        "Essential storage (sign-in session and theme preference) is required for the site to work. Under common EU/UK guidance, strictly necessary storage can run without an opt-in, but we still disclose it here.",
        "Non-essential analytics cookies or similar trackers require consent before they run. Devora’s Firebase Analytics helper stays off until you opt in (and only if a measurement id is configured).",
        "If you are in the EEA, UK, or another region with cookie rules, use the banner to accept or reject analytics. Essential storage still runs so you can sign in.",
      ],
    },
    {
      heading: "What we store today",
      paragraphs: [
        "Firebase Authentication session: keeps you signed in. Essential.",
        "Theme preference (localStorage key for dark/light mode): remembers your display choice. Treated as functional / essential for this product.",
        "Cookie consent choice (localStorage): remembers whether you allowed analytics. Essential for honoring your choice.",
        "No advertising cookies. No third-party video or map embeds that set their own cookies on Devora pages today.",
      ],
    },
    {
      heading: "Analytics",
      paragraphs: [
        "Optional Firebase Analytics may measure page usage to improve the product. It does not run unless you Accept analytics on the banner.",
        "You can change your mind by clearing site data for Devora or by using the “Cookie settings” control in the footer once shown.",
      ],
    },
    {
      heading: "How long",
      paragraphs: [
        "Auth session lifetime follows Firebase Auth defaults for the signed-in browser.",
        "Theme and consent choices stay until you clear site data or change them.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Questions: ${BUSINESS_CONTACT_EMAIL}. Last updated: ${LEGAL_LAST_UPDATED}.`,
      ],
    },
  ],
};
