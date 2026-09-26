# F.R.C Creator Academy

An online learning platform for content creators, beginning with YouTube creation.

## PHASE 1 — UI PROTOTYPE COMPLETE

All current data is **mock/static**. This demonstrates the interface, not a working learning or administration backend. Routes are public and no credentials are required.

Student/public UI:

- Landing, Dashboard, Courses Catalog and Course Detail
- Vertical Learning Roadmap, Lesson / Video Player preview
- Checkpoint Quiz and passed/failed Quiz Result previews
- Achievements and Profile
- Login/Register with shared sliding panels

Admin UI:

- Overview, Courses and Course Create/Edit
- Lessons and Lesson Create
- Quizzes and Quiz Builder
- Roadmap, Badges and Students

Admin filters, badge dialogs, question fields, navigation and password visibility use local UI state only. Save, publish and other unavailable operations do not persist anything. The lesson player and quiz results are visual previews.

## Local setup

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). Admin starts at [/admin](http://localhost:3000/admin).

Useful demo URLs:

- `/courses/youtube`
- `/learn/thumbnail-psychology`
- `/quizzes/content-strategy`
- `/quizzes/content-strategy/result` (passed)
- `/quizzes/content-strategy/result?preview=failed`
- `/admin/courses/1/edit`

```bash
npm run lint
npm run build
npm run start
```

## Stack and next phase

Next.js App Router, React, TypeScript, Tailwind CSS, plain CSS and Lucide React. The UI uses Inter/Manrope, dark cards and the F.R.C red accent. `next/font` may need network access during the build.

**Phase 2: PostgreSQL + Prisma + functionality.** Database, persistence, real authentication, quiz scoring, roadmap unlocking, badge persistence, Admin CRUD and YouTube API integration are **not implemented**. No environment variables or external service credentials are needed for Phase 1.

See [Implementation Status](docs/IMPLEMENTATION_STATUS.md) for routes and the Phase 2 plan.
