# F.R.C Creator Academy

F.R.C Creator Academy is an online learning platform for content creators, beginning with a structured YouTube Creator course.

## Current development status

**UI Prototype / Phase 1.** Mock data is used during UI development. The technical documentation describes the target v1 product, not functionality already implemented in this repository.

Implemented UI:

- Landing Page
- Dashboard
- Courses Catalog
- Course Detail
- Responsive navigation/sidebar and shared footer

Planned / next: Lesson and Video Player, Gamified Roadmap, Quiz System, Achievements, Profile, Login/Register, Authentication, PostgreSQL + Prisma, and YouTube integration.

Core learning idea:

**Course → Lessons → Checkpoint Quiz → Roadmap Unlock → Badge / Progress**

The planned default checkpoint follows three lessons and requires **80%** to pass. Current progress, quiz results and achievements are static examples; they are not persisted or calculated. Search/filter controls are visual-only, and unavailable actions are disabled or marked Coming Soon.

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS, plain/custom CSS and Lucide React. The existing visual system uses Inter + Manrope, dark backgrounds, a red accent and shared app-card styling.

Planned backend: PostgreSQL, Prisma ORM and authentication. None is required for the current prototype; no environment variables or external service credentials are needed.

## Local setup

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). Review routes: /, /dashboard, /courses, /courses/youtube.

```bash
npm run lint
npm run build
```

The build uses next/font to obtain Inter and Manrope and may require network access.

See [Implementation Status](docs/IMPLEMENTATION_STATUS.md) for the current-versus-planned breakdown.
