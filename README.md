# F.R.C Creator Academy

An online learning platform for content creators, with a dark/red UI, real student learning progress and database-backed Admin content management. The university MVP starts with YouTube Creator Mastery and supports additional courses.

## Core journey

Register -> log in -> browse/search published courses -> enroll -> watch lessons -> mark progress -> pass quiz checkpoints -> unlock the next linear roadmap stage -> earn badges and review your profile/dashboard.

Seed checkpoints require **80% or higher**. The server calculates scores; retry history remains intact and a later failure does not cancel an earlier pass. Course completion requires all published lessons and quizzes. If an admin changes those requirements, current completion is recalculated without deleting history.

Admins manage courses, modules, lessons, quizzes, roadmap nodes and badges, and inspect student progress. Every Admin route and mutation is server-authorized. Public registration cannot select ADMIN.

## Stack

Next.js 16 App Router, React 19, TypeScript, plain CSS/Tailwind, Lucide, Better Auth database sessions, Zod, Prisma 7.10.0 with PostgreSQL adapter, Neon PostgreSQL and Vitest.

## Setup

1. Run npm install.
2. Copy .env.example to .env and set the private values below.
3. Apply the committed migrations to your own database, generate the client and seed development data.

| Variable | Purpose |
| --- | --- |
| DATABASE_URL | Your PostgreSQL connection URL |
| BETTER_AUTH_SECRET | Private random secret, at least 32 characters |
| BETTER_AUTH_URL | App origin; http://localhost:3000 locally |
| SEED_PASSWORD | Your development seed password; 10-72 characters, at most 72 UTF-8 bytes |

Never commit .env or real credentials.

~~~bash
npm install
npx prisma generate
npx prisma validate
npx prisma migrate deploy
npm run db:seed
npm run dev
~~~

Use migrate deploy to apply existing checked-in migrations. Only when developing a schema change, use npx prisma migrate dev --name descriptive_change; it needs shadow database permissions. Do not reset an existing database. See [database setup](docs/DATABASE.md).

The development seed is idempotent and refuses production mode. It defines admin@frc.academy (ADMIN) and student@frc.academy (STUDENT), using your private SEED_PASSWORD. Existing passwords and edited lesson videos survive seed reruns. Registration accepts passwords of at least 8 characters; uppercase/special characters are not required. Successful registration leads to login.

## Routes and content

Public: /, /login, /register, /courses, /courses/[slug].

Authenticated: /dashboard, /roadmap, /learn/[slug], /quizzes/[slug], quiz results, /achievements, /profile. Admin-only management lives under /admin.

Course search matches titles/descriptions and combines with Beginner/Intermediate/Advanced filters. Data still comes from PostgreSQL. Outcomes use the course's real module descriptions/titles.

Lesson.videoUrl supports YouTube embeds and native MP4/WebM/OGV playback. The current temporary shared video is stored in the database; admin edits remain respected. This is **embedded lesson video support**, not YouTube account OAuth/API or analytics sync. Database images support local /images/ assets and browser-loaded HTTPS sources, with safe local fallbacks and no unrestricted remote image optimizer.

The roadmap is linear. Add a roadmap node after publishing a new lesson/quiz; direct access to unconfigured learning content stays locked. Attempted quiz questions/options/pass thresholds cannot be rewritten. History-bearing deletion is blocked; use Draft/Inactive. Enrollment.completedAt reflects current requirements and is reconciled during curriculum edits and student progress writes. No course versioning is implemented.

## Checks

~~~bash
npx prisma format
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm test
npm run build
~~~

A fresh build may need network access for next/font. See [architecture](docs/ARCHITECTURE.md), [implementation status](docs/IMPLEMENTATION_STATUS.md), [university stabilization](docs/UNIVERSITY_STABILIZATION.md), [student verification](docs/STUDENT_FLOW_VERIFICATION.md) and [Admin verification](docs/ADMIN_CRUD_VERIFICATION.md) for evidence and limitations. Service/action unit tests mock database I/O; HTTP checks are separate and do not prove actual browser video playback.

See also the [P0 interaction/performance audit](docs/INTERACTION_PERFORMANCE_AUDIT.md) for the control inventory, asset sizes, measured route timings and verification limits, and the [manual smoke checklist](docs/MANUAL_SMOKE_TEST.md) for browser checks still required.

The [real latency audit](docs/REAL_LATENCY_AUDIT.md) supersedes earlier performance estimates with instrumented production completion timings, SQL counts, region/idle findings and explicit target limitations. Profiling is opt-in with `PROFILE_PERFORMANCE=1`; ordinary runs do not emit timing/query logs.

## Future / post-university

YouTube OAuth/API, branching roadmap, production deployment hardening, password recovery/email verification, large-scale pagination, course versioning, community, payments, AI and certificates are outside this submission's implementation scope.
