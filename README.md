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

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, React
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Deployment:** Vercel
- **Repository:** GitHub

---

## Project Status

**Current Phase:** Fall 2026 (ENGR 492 - Capstone Development)

- Week 1: Infrastructure setup (in progress)
- Week 2: Database schema design
- Week 3: UI/Design system
- Week 4-10: Core features (auth, profiles, discovery, messaging)
- Week 11-13: Testing, documentation, final submission

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
   ```bash
   git clone https://github.com/CapChris20/devora.git
   cd devora
   ```

2. Install dependencies
   ```bash
   cd devora
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the `devora` directory (see `.env.example`).

4. Run the development server
   ```bash
   npm run dev
   ```

---

## Design System

Color Palette:
- Background: `#1a0a2e` (Deep Purple)
- Primary Accent: `#FFD700` (Gold)
- Secondary Accent: `#FF006E` (Neon Pink)
- Interactive: `#00D9FF` (Cyan)
- Text: `#ffffff` (White)

See `devora-design-system.md` for full design specifications.

---

## Features (Planned)

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

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

Last Updated: August 29, 2026
