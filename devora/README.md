# Devora

**UofM Dearborn's own CECS Networking Hub**

A student discovery platform for finding aligned collaborators, project partners, and professional connections within the College of Engineering and Computer Science at the University of Michigan – Dearborn.

---

## Overview

Devora enables CECS students to:
- Create rich profiles showcasing skills, projects, and interests
- Discover other students by filtering on tech stack, major, current course, and collaboration goals
- Connect asynchronously through messaging before in-person meetups
- Build meaningful professional and personal relationships

**Not a swipe-based dating app.** Pure search and filter discovery with async vetting.

---

## Homepage (current)

Live landing page at `/home` — hero, nav, synthwave background, and homepage sections below the fold.

![Devora homepage — hero section with nav, title, credits, and call-to-action](../assets/homepage-screenshot.png)

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, React
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Deployment:** Vercel
- **Repository:** GitHub

---

## Project Status

**Current Phase:** Fall 2026 (ENGR 492 - Capstone Development)

- We 1: Infrastructure setup (in progress)
- Week 2: Database schema design
- Week 3: UI/Design system
- Week 4–9: Core web features (auth, profiles, discovery, messaging)
- Week 10: Mobile-ready web + PWA (installable from browser)
- Week 11: Capacitor iOS shell + TestFlight
- Week 12: Push notifications (Firebase Cloud Messaging)
- Week 13: App Store submission, testing, final documentation

See **`src/docs/mobile-app-roadmap.md`** for the full mobile plan.

**Next Milestone:** Dec 9, 2026 (Final submission)

---

## Installation

### Prerequisites
- Node.js 18+ (or newer)
- npm or yarn
- Firebase account
- GitHub account
- Vercel account (for deployment)

### Setup Steps

1. Clone the repository
   git clone https://github.com/CapChris20/devora.git
   cd devora

2. Install dependencies
   npm install

3. Set up environment variables
   Create a .env.local file in the root directory

4. Run the development server
   npm run dev

---

## Design System

See **`src/docs/DESIGN_SCOPE.md`** for colors, gradients, and page specs. Styles live in `src/ui/globals.css`.

---

## Documentation

All project docs are in **`src/docs/`** — start at [src/docs/README.md](src/docs/README.md).

| Doc | Purpose |
|-----|---------|
| `DESIGN_SCOPE.md` | UI design bible |
| `landing-sections-spec.md` | Homepage copy |
| `firestore-schema.md` | Database plan |
| `mobile-app-roadmap.md` | Mobile app plan (Weeks 10–13+, Capacitor + push) |
| `naming-and-structure.md` | Folders, routes, file names |

---

### Fall 2026 (ENGR 492)
- Infrastructure & setup
- Firestore schema design
- UI/Design system & components
- Authentication (email/password, @umich.edu restriction)
- Profile creation & editing
- Project portfolio management
- Discovery page with search & filters
- Real-time messaging
- Notifications

### Winter 2027 (ENGR 493)
- Pilot launch
- User research & interviews
- Feature iteration
- Final analysis & report

---

## Faculty & Advisor

- Student: Christian Shina (chrishin@umich.edu)
- Advisor: Dr. Bruce Maxim (bmaxim@umich.edu)
- University: University of Michigan – Dearborn
- Program: College of Engineering and Computer Science (CECS)

---

## Resources

- Next.js Documentation: https://nextjs.org/docs
- Firebase Documentation: https://firebase.google.com/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- TypeScript Documentation: https://www.typescriptlang.org/docs/

---

Last Updated: August 31, 2026
