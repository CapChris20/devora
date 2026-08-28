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

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/devora.git
   cd devora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
devora/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── account/           # Account page
│   ├── discovery/         # Discovery grid
│   ├── settings/          # Settings page
│   └── api/               # API routes (if needed)
├── components/
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── firebase.ts        # Firebase config & initialization
│   ├── auth.ts            # Authentication utilities
│   └── types.ts           # TypeScript interfaces
├── styles/
│   └── globals.css        # Global Tailwind styles
├── public/                # Static assets (logos, images)
├── .env.local            # Environment variables (not in git)
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies & scripts
```

---

## Design System

Color Palette:
- **Background:** #1a0a2e (Deep Purple)
- **Primary Accent:** #FFD700 (Gold)
- **Secondary Accent:** #FF006E (Neon Pink)
- **Interactive:** #00D9FF (Cyan)
- **Text:** #ffffff (White)

See `devora-design-system.md` for full design specifications.

---

## Features (Planned)

### Fall 2026 (ENGR 492)
- [x] Infrastructure & setup
- [ ] Firestore schema design
- [ ] UI/Design system & components
- [ ] Authentication (email/password, @umich.edu restriction)
- [ ] Profile creation & editing
- [ ] Project portfolio management
- [ ] Discovery page with search & filters
- [ ] Real-time messaging
- [ ] Notifications

### Winter 2027 (ENGR 493)
- [ ] Pilot launch (15-20 CECS students)
- [ ] User research & interviews
- [ ] Feature iteration based on feedback
- [ ] Final analysis & report

---

## Database Schema

Firestore Collections:
- **users/** — User accounts & auth data
- **profiles/** — User profile information
- **projects/** — User projects & portfolio items
- **messages/** — Direct messages between users
- **notifications/** — User notifications
- **connections/** — User connections & follow relationships

See `schema.md` for detailed field specifications.

---

## Authentication

- Email/password login with Firebase Authentication
- Restricted to @umich.edu domain
- Protected routes using middleware
- Session management via Firebase

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel (vercel.com)
3. Add environment variables in Vercel settings
4. Vercel auto-deploys on each push to main branch

**Live URL:** `https://cecs-connect.vercel.app` (once deployed)

---

## Contributing

This is a capstone project. Contributions welcome during development phase.

For bugs or feature requests, create an issue on GitHub.

---

## Faculty & Advisor

- **Student:** Christian Shina (chrishin@umich.edu)
- **Advisor:** Dr. Bruce Maxim (bmaxim@umich.edu)
- **University:** University of Michigan – Dearborn
- **Program:** College of Engineering and Computer Science (CECS)

---

## License

This project is part of an academic capstone and is not currently open-sourced.

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## Status

Last Updated: August 27, 2026

For weekly progress and check-ins, see the project board or contact the advisor.
