# Phase 2 / Step 1: Database Foundation

The database code is implemented; provisioning, migration and seed execution are pending. No DATABASE_URL was configured during this task. The UI continues to use existing mock data; no routes, authentication, CRUD, scoring, unlocking or integrations are implemented here.

## Setup

Use Node compatible with the existing Next.js and Prisma 7 installation (validated with Node 24.13.0). Packages: prisma, @prisma/client and @prisma/adapter-pg **7.10.0**; pg **8.23.0**; @types/pg **8.23.1**; tsx **4.23.15**; dotenv **18.0.4** installed. Prisma 8 was not installed.

1. Run `npm install` (generates the ignored Prisma client).
2. Copy `.env.example` to `.env` and replace every placeholder with your PostgreSQL connection details. Never commit credentials. CLI config loads `.env` with dotenv; Next.js loads environment variables itself. Do not use a NEXT_PUBLIC variable for credentials.
3. Use a development database. Prisma migrate dev needs permission to create/use its shadow database.
4. Run these commands from the repository root:

```bash
npm run db:format
npm run db:validate
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run db:studio
```

The migration command creates the initial SQL migration under `prisma/migrations`; review and commit it when a database is configured. No migration file or successful database execution is claimed yet. Prisma 7 seeding is explicit. Never run the development seed on production; it rejects NODE_ENV=production. Back up any nonempty database before using demo fixtures.

`postinstall` and `prebuild` generate the client without a database connection. Schema validation and generation also work without DATABASE_URL. Database operations require a real URL. Client generation targets `src/generated/prisma`; that directory is ignored by Git and ESLint. `src/lib/prisma.ts` exports lazy `getPrisma()` using PrismaPg and a global singleton, avoiding hot-reload client duplication. It is for server-side callers only and is not imported by UI components.

Configuration follows [Prisma 7 configuration conventions](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).

## Schema

Models: User, Course, Module, Lesson, Enrollment, LessonProgress, Quiz, Question, AnswerOption, QuizAttempt, QuizAnswer, Badge, UserBadge, RoadmapNode, YouTubeConnection.

Enums: UserRole, CourseLevel, CourseStatus, LessonStatus, LessonProgressStatus, QuizStatus, BadgeStatus, RoadmapNodeType.

- Course owns modules, lessons belong to modules. Quizzes always belong to a course and optionally to a module. Questions and options are ordered.
- Users enroll in courses, track individual lessons, make repeatable quiz attempts, and earn badges. Quiz answers link an attempt, question and chosen option.
- RoadmapNode is an ordered course node with LESSON, QUIZ or REWARD type and optional target relations. No RoadmapEdge, branching or persisted current/completed/locked flags exist.
- YouTubeConnection is optional and unique per user. Counts use BigInt; future APIs must serialize them explicitly. Token fields are reserved for encrypted values; no encryption, OAuth, API requests or seeded tokens exist.
- Unique email and slugs prevent identity/content duplicates. Composite uniqueness covers module/course order, lesson/module order, question/quiz order, option/question order, roadmap/course order, user/course enrollment, user/lesson progress, user/badge awards and attempt/question answers. Attempts deliberately allow retries. Foreign-key indexes support reverse lookups; composite unique indexes cover their leading foreign key.
- Mutable entities have createdAt/updatedAt where appropriate. Progress, enrollment, attempts and awards use their specific started/completed/enrolled/earned timestamps. Course duration is minutes; lesson duration is seconds. Unfinished attempt score/passed/completedAt are nullable.

## Deletion and validation decisions

Enrollment, lesson progress, quiz attempts, quiz answers and earned badges use Restrict on their referenced records to preserve history. Content ownership uses Cascade where appropriate; module deletion sets an optional quiz module to null. Roadmap targets use Restrict. A content cascade can therefore be blocked by history or roadmap references; this is intentional. User deletion also removes the optional YouTube connection, but learning history can block the overall deletion. No automatic history purge exists.

Foreign keys do not enforce every business invariant. Before real writes are introduced, enforce exactly one matching roadmap target, course consistency between nodes/lessons/quizzes/modules, answer-to-question and question-to-attempt consistency, one correct option per single-choice question, score/passScore ranges, positive order/duration and consistent completion timestamps. Decide content versioning before editing questions used by historical attempts. These are documented future service/constraint requirements, not implemented functionality.

## Development seed

`prisma/seed-data.ts` stores fixtures separately from the executable `prisma/seed.ts`. A transaction uses upserts with stable keys and empty updates: reruns avoid duplicates without overwriting existing content/history. This is an initial demo fixture, not a synchronization tool for an edited database.

On a fresh database the seed creates:

| Records | Count |
| --- | ---: |
| Users: admin@frc.academy / student@frc.academy | 2 |
| YouTube Creator Mastery course (slug youtube) | 1 |
| Modules | 6 |
| Lessons | 18 |
| Quizzes, each with passScore 80 | 6 |
| Questions / answer options | 18 / 72 |
| Ordered roadmap nodes: 18 lessons, 6 quizzes, 2 rewards | 26 |
| Badge definitions | 4 |
| Enrollment | 1 |
| Lesson progress: 3 completed, 1 in progress | 4 |
| Completed quiz attempt / answers | 1 / 3 |
| Earned user badge | 1 |

Modules: YouTube Basics, Audience & Niche, Content Strategy, Video Production, Analytics & Growth, Monetization. Each has three lessons then a checkpoint. The seeded score of 100 is a fixture, not computed scoring logic. Password hashes are null; these users cannot authenticate. Video URLs at example.com are placeholders, not playable lessons. No YouTube connections are seeded. Seed values do not replace current UI statistics.

## Verification and remaining work

Prisma format, validate and generate passed without credentials. Application lint, production build and TypeScript checks passed, including seed code type checking. Database migration, foreign-key behavior in a running database, transactional seed execution and rerun behavior still need verification against PostgreSQL. Configure DATABASE_URL and run migration/seed before Phase 2 Step 2. Authentication and UI data integration require separate tasks.

Dependency audit reports four high-severity entries in the Prisma CLI development dependency tree (prisma, @prisma/config, deepmerge-ts and mysql2). npm proposes a Prisma downgrade, conflicting with the requested 7.10.0 version. No forced fixes, unrelated upgrades or unverified overrides were applied. Review upstream fixes before deployment; this application uses PostgreSQL, not MySQL.
