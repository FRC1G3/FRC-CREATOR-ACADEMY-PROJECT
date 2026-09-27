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
npm run db:migrate -- --name init
npm run db:seed
```

The current development database is Neon; the initial migration has already been applied. For an existing database, inspect its migration history before creating further migrations and do not accept a destructive reset. Review and commit generated SQL. `migrate dev` needs shadow-database permissions.

Prisma formatting, validation and generation do not require a live connection in this configuration. A successful build does not prove database connectivity.

## Schema

Learning models: User, Course, Module, Lesson, Enrollment, LessonProgress, Quiz, Question, AnswerOption, QuizAttempt, QuizAnswer, Badge, UserBadge, RoadmapNode, YouTubeConnection.

Authentication adds Session, Account, Verification and AuthThrottle (19 models total), plus User.emailVerified. Better Auth maps its image field to User.avatarUrl. Credential bcrypt hashes are stored in Account.password. The earlier nullable User.passwordHash is unused and never selected for client UI. Verification is part of the auth provider schema; no email-verification delivery flow is enabled.

Enums: UserRole, CourseLevel, CourseStatus, LessonStatus, LessonProgressStatus, QuizStatus, BadgeStatus, RoadmapNodeType.

Course → ordered modules → ordered published lessons. Quizzes belong to a course and optionally a module. Questions/options are ordered. Roadmap nodes target lessons, quizzes or rewards; no RoadmapEdge exists.

Uniqueness protects email/slugs, module/course order, lesson/module order, question/quiz order, option/question order, roadmap/course order, enrollment, lesson progress, earned badges and one answer per attempt/question. Quiz attempts permit retries. Account provider/account identity and session token are unique. Foreign-key/composite indexes support related lookups.

Learning history relations use Restrict, including enrollment, progress, attempts, answers and earned badges. Ownership uses Cascade for content where appropriate. Optional quiz/module uses SetNull. Roadmap target references use Restrict. A cascade can be blocked by existing history/roadmap references intentionally. User-owned auth sessions/accounts and YouTube connection cascade on deletion, but learning history can block user deletion.

Future content editing must preserve historical quiz meaning (versioning/snapshots before Admin CRUD). Future admin validators must enforce one matching target per roadmap node, valid same-course references, positive order/duration, valid score ranges and single-choice questions with exactly one correct option. Current student mutations enforce their own access and answer consistency; the schema is not a generic content validation engine.

## Seed

Run only on a development database. `SEED_PASSWORD` is required and must fit bcrypt's 72-byte limit. The seed hashes it with the same cost-12 helper used by registration; no plaintext is stored. It creates credential accounts for admin@frc.academy and student@frc.academy. Existing credentials/users/history are preserved by upserts; rerunning does not reset passwords or promote an existing student to admin. No automatic reset/purge is provided.

Fresh database fixtures: 2 users and credential accounts, 1 YouTube Creator Mastery course, 6 modules, 18 lessons, 6 checkpoint quizzes (passScore 80), 18 questions, 72 options, 26 ordered roadmap nodes, 4 badges, 1 enrollment, 4 progress rows, 1 completed quiz attempt with 3 answers and 1 earned badge. No YouTube connections/tokens are seeded. Fixed seed learning history is demo content; video URLs at example.com are placeholders.

Remote seeding uses independently committed upserts, not a single interactive transaction. The previous transaction exceeded its 60-second lifetime on Neon. Only the fixed quiz attempt and its three answers share a short transaction, after their referenced content exists. A failed run may leave completed seed steps committed; rerunning resumes safely using stable identities and empty updates. Errors report the current stage and safe Prisma codes without raw connection details.

To verify fixtures and compare two runs, use `npx tsx prisma/verify-seed.ts --snapshot`, rerun the seed, then use `npx tsx prisma/verify-seed.ts --compare`. The temporary `.seed-verification.json` contains only counts and a content fingerprint; remove it after comparison. Password hashes are not queried or printed. Run this comparison without concurrent application writes.

The PostgreSQL driver currently warns about future `sslmode=require` semantics. This warning did not cause the seed timeout. The driver recommends explicit `sslmode=verify-full` to retain its current certificate-verification behavior across the future major upgrade. The working connection string was left unchanged; any SSL-mode change should be tested separately.

Verified on the configured Neon database on 2026-09-27: both seed runs succeeded. The comparison confirmed unchanged fixture counts, IDs, content and student history. Counts matched all fixtures listed above, including both credential accounts. Prisma format/validate/generate, TypeScript, ESLint and the production build passed. No reset or migration change was needed. This verifies seeding, not the unrelated runtime learning flows.

AuthThrottle atomically counts normalized-email hashes in PostgreSQL: at most 10 authentication attempts per account per 15-minute window. It applies through provider hooks to both Server Actions and auth HTTP endpoints. Better Auth additionally enables its HTTP limiter. Old throttle entries can be pruned operationally; no scheduler is implemented.

Lesson completion and quiz submission lock the current user row inside a transaction, then persist progress/results, evaluate badges and set completion. This serializes competing learning mutations for that user. Runtime locking/rollback/constraints remain to be verified with PostgreSQL.

## Dependency note

The existing audit reported four high-severity entries in the pinned Prisma CLI dependency tree (prisma, @prisma/config, deepmerge-ts, mysql2). Its proposed Prisma downgrade conflicts with the required 7.10.0 version. No forced fix or unverified override was applied. Review upstream updates before deployment; this project uses PostgreSQL, not MySQL.
