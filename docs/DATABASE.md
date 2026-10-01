# Database setup and decisions

PostgreSQL with Prisma/client/adapter-pg 7.10.0 is preserved. The lazy client in `src/lib/prisma.ts` uses PrismaPg and a global singleton. Services are server-only. The generator writes `src/generated/prisma`, ignored by Git and ESLint; install/build regenerate it.

## Configuration and migrations

Copy `.env.example` to `.env`; provide your own `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and development `SEED_PASSWORD`. Credentials are never committed. Prisma CLI reads `.env` through dotenv; Next.js loads its own environment.

```bash
npm install
npm run db:format
npm run db:validate
npm run db:generate
npx prisma migrate status
npx prisma migrate deploy
npm run db:seed
```

The current development database is Neon. Committed migrations: 20260927111705_init, 20260928000100_student_bookmarks and 20261001000100_youtube_channel_metadata. The final product feature pass added only the third, additive migration. Apply existing migrations with prisma migrate deploy; do not create a fresh init on an existing DB. For an existing database, inspect its migration history before creating further migrations and do not accept a destructive reset. Review and commit generated SQL. `migrate dev` needs shadow-database permissions.

The existing YouTubeConnection is reused with four added columns: nullable googleAccountId (Account FK, ON DELETE SET NULL), nullable thumbnailUrl/customUrl, and hiddenSubscriberCount boolean default false. User uniqueness, channel identity/title, BigInt statistics and timestamps remain. Better Auth Account owns encrypted Google access/refresh/id tokens and expiry/scope. Legacy YouTubeConnection token columns remain untouched and are never populated by the new integration. Local removal deletes only owned channel metadata; users, credential/Google Accounts and learning history are retained.

Opt-in metadata check: `RUN_YOUTUBE_DB_CHECK=1 node --conditions=react-server --import tsx scripts/verify-youtube-metadata.ts`. Creates isolated users/accounts/channel metadata, validates lossless counts/ownership/removal and cleans only its own fixture IDs. It never calls Google or establishes actual OAuth success. See FINAL_PRODUCT_POLISH.md for the actual migration/check result.

Prisma formatting, validation and generation do not require a live connection in this configuration. A successful build does not prove database connectivity.

## Schema

Learning models: User, Course, Module, Lesson, Enrollment, LessonProgress, Quiz, Question, AnswerOption, QuizAttempt, QuizAnswer, Badge, UserBadge, RoadmapNode, YouTubeConnection, CourseBookmark and LessonBookmark.

Authentication adds Session, Account, Verification and AuthThrottle (21 models total), plus User.emailVerified. Better Auth maps its image field to User.avatarUrl. Credential bcrypt hashes are stored in Account.password. The earlier nullable User.passwordHash is unused and never selected for client UI. Verification is part of the auth provider schema; no email-verification delivery flow is enabled.

Enums: UserRole, CourseLevel, CourseStatus, LessonStatus, LessonProgressStatus, QuizStatus, BadgeStatus, RoadmapNodeType.

Course → ordered modules → ordered published lessons. Quizzes belong to a course and optionally a module. Questions/options are ordered. Roadmap nodes target lessons, quizzes or rewards; no RoadmapEdge exists.

Uniqueness protects email/slugs, module/course order, lesson/module order, question/quiz order, option/question order, roadmap/course order, enrollment, lesson progress, earned badges and one answer per attempt/question. Quiz attempts permit retries. Account provider/account identity and session token are unique. Foreign-key/composite indexes support related lookups.

CourseBookmark and LessonBookmark have unique user/course and user/lesson ownership and cascade with their owner/target. Learning history relations use Restrict, including enrollment, progress, attempts, answers and earned badges. Ownership uses Cascade for content where appropriate. Optional quiz/module uses SetNull. Roadmap target references use Restrict. A cascade can be blocked by existing history/roadmap references intentionally. User-owned auth sessions/accounts and YouTube connection cascade on deletion, but learning history can block user deletion.

Admin validators enforce matching roadmap targets, same-course relations, positive order, nonnegative duration, valid pass scores and exactly one correct answer per question. Once attempts exist, quiz questions/options and the pass score cannot change. Existing lessons/modules/quizzes cannot be reparented; their history stays attached to stable IDs.

## Seed

Run only on a development database. `SEED_PASSWORD` is required and must fit bcrypt's 72-byte limit. The seed hashes it with the same cost-12 helper used by registration; no plaintext is stored. It creates credential accounts for admin@frc.academy and student@frc.academy. Existing credentials/users/history are preserved by upserts; rerunning does not reset passwords or promote an existing student to admin. No automatic reset/purge is provided.

Fresh database fixtures: 2 users and credential accounts, 1 YouTube Creator Mastery course, 6 modules, 18 lessons, 6 checkpoint quizzes (passScore 80), 18 questions, 72 options, 26 ordered roadmap nodes, 4 badges, 1 enrollment, 4 progress rows, 1 completed quiz attempt with 3 answers and 1 earned badge. No YouTube connections/tokens are seeded. Fixed seed learning history is demo content; new seed lessons use the shared temporary YouTube URL from `prisma/video-default.ts`.

Remote seeding uses independently committed upserts, not a single interactive transaction. The previous transaction exceeded its 60-second lifetime on Neon. Only the fixed quiz attempt and its three answers share a short transaction, after their referenced content exists. A failed run may leave completed seed steps committed; rerunning resumes safely using stable identities and empty updates. Errors report the current stage and safe Prisma codes without raw connection details.

To verify fixtures and compare two runs, use `npx tsx prisma/verify-seed.ts --snapshot`, rerun the seed, then use `npx tsx prisma/verify-seed.ts --compare`. The temporary `.seed-verification.json` contains only counts and a content fingerprint; remove it after comparison. Password hashes are not queried or printed. Run this comparison without concurrent application writes.

The PostgreSQL driver currently warns about future `sslmode=require` semantics. This warning did not cause the seed timeout. The driver recommends explicit `sslmode=verify-full` to retain its current certificate-verification behavior across the future major upgrade. The working connection string was left unchanged; any SSL-mode change should be tested separately.

Verified on the configured Neon database on 2026-09-27: both seed runs succeeded. The comparison confirmed unchanged fixture counts, IDs, content and student history. Counts matched all fixtures listed above, including both credential accounts. Prisma format/validate/generate, TypeScript, ESLint and the production build passed. No reset or migration change was needed. This verifies seeding, not the unrelated runtime learning flows.

AuthThrottle atomically counts normalized-email hashes in PostgreSQL: at most 10 authentication attempts per account per 15-minute window. It applies through provider hooks to both Server Actions and auth HTTP endpoints. Better Auth additionally enables its HTTP limiter. Old throttle entries can be pruned operationally; no scheduler is implemented.

Lesson completion and quiz submission lock the current user row inside a transaction, then persist progress/results, evaluate badges and set completion. This serializes competing learning mutations for that user. Real PostgreSQL verification is recorded in the dated student/Admin reports and FINAL_CODE_AUDIT.md. It does not establish heavy-load/fault-injection guarantees.

## Dependency note

The existing audit reported four high-severity entries in the pinned Prisma CLI dependency tree (prisma, @prisma/config, deepmerge-ts, mysql2). Its proposed Prisma downgrade conflicts with the required 7.10.0 version. No forced fix or unverified override was applied. Review upstream updates before deployment; this project uses PostgreSQL, not MySQL.

## Admin mutations and one-time video update

No schema migration was required. Course deletion is limited to empty courses; module deletion is limited to empty modules. Lesson/quiz/badge deletes rely on existing restrictive foreign keys to preserve progress, attempts, answers, awards and referenced roadmap targets. Roadmap removal is blocked for courses with enrollment or learning history. Draft/Inactive remains available instead. Earned inactive badges remain visible, but inactive badges are not newly awarded.

Admin quiz writes lock the quiz row; student submission uses the same lock and checks publication again before grading. Atomic nested question/option creation and bounded transactions protect consistency. Roadmap swaps lock the course and use a temporary order above the current maximum, then swap the two orders without a uniqueness collision. Numeric module/lesson ordering conflicts return readable errors.

`npx tsx prisma/update-lesson-videos.ts --apply` was a one-time development update of all 18 existing Lesson.videoUrl values to the supplied video (plus automatic updatedAt). It is not run by the app or seed. Do not rerun --apply after custom videos are assigned unless intentionally replacing them. Without --apply the script only verifies counts. No progress, enrollment, quiz or roadmap records are updated by this script.

## Current progress, images and reconciliation

Published lessons plus distinct passed published quizzes are required learning units. The shared learningProgress helper drives Student/Admin percentages and current completion. Empty courses are incomplete; draft-only modules are hidden publicly but remain manageable in Admin.

Admin curriculum edits batch-reconcile affected Enrollment.completedAt and badge eligibility transactionally. Active badge creation/activation/condition edits evaluate relevant existing learners with batched joined reads. Existing awards/history are retained.

Image pickers validate original JPEG/PNG/WebP files, resize/compress in the browser, validate/re-encode with Sharp on the server, then save WebP data URLs in existing User.avatarUrl and Course/Lesson.thumbnailUrl text fields. No new image table, filesystem storage or external object storage exists. Progress/selector projections avoid image blobs; displayed/edited images are selected deliberately. External object storage is recommended later.

Opt-in integration: RUN_FINAL_CONSISTENCY_CHECK=1 node --conditions=react-server --import tsx scripts/verify-final-consistency.ts. Uses the existing connection, creates isolated fixtures, checks progress/order/completion/badges, and cleans only its own records. Never rotates secrets or resets the DB.
