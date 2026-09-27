# F.R.C Creator Academy

A learning platform for content creators. The existing dark/red student UI now calls database-backed services for courses, enrollment, lessons, progress, quizzes, roadmap progression and badges.

**Current verification:** The configured Neon database has been migrated and seeded twice successfully. Student/admin login, server-side authorization and the student learning flow have been exercised through the running application's HTTP endpoints and Server Actions. See [live verification](docs/STUDENT_FLOW_VERIFICATION.md) for evidence and remaining limits. There is no mock fallback for student data. Admin management screens still use mock data behind server-side ADMIN authorization.

## Stack

- Next.js 16.3.4 App Router, React 19, TypeScript
- Tailwind CSS, existing plain CSS and Lucide icons
- PostgreSQL, Prisma/client/adapter-pg 7.10.0, pg 8.23.0
- Better Auth 1.7.6 with database sessions; bcryptjs 3.0.3 with cost 12
- Zod 4.6.5 validation, Vitest 4.1.11 tests

## Local setup

```bash
npm install
```

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Your actual PostgreSQL connection URL; replace every example placeholder |
| `BETTER_AUTH_SECRET` | A private random secret, at least 32 characters |
| `BETTER_AUTH_URL` | App origin, normally `http://localhost:3000` locally |
| `SEED_PASSWORD` | Development-only password you choose for both seeded accounts; 10–72 characters and at most 72 UTF-8 bytes |

Generate a secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
npm run db:generate
npm run db:validate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

The current Neon development database already has the initial migration applied. `db:migrate` creates the initial migration for a new development database; review the resulting migration. For an existing database, inspect `npx prisma migrate status` and its migration history first. Do not reset a database to resolve drift. Prisma's development migration requires shadow-database permissions. See [Database setup](docs/DATABASE.md).

`npm install` and `npm run build` generate the Prisma client automatically. Never commit `.env` or real credentials. With configuration absent, public course pages explain that setup is pending and authentication returns a safe setup message; real connection failures are not replaced with demo records.

## Development seed accounts

The seed defines these accounts, but they **do not exist in a database until the seed succeeds**:

- `admin@frc.academy` — ADMIN
- `student@frc.academy` — STUDENT

Their initial password comes from your local `SEED_PASSWORD`; no shared hardcoded password is provided. The seed stores bcrypt hashes in Better Auth's `Account.password`, never plaintext. Existing accounts/passwords are preserved on rerun, so changing `SEED_PASSWORD` does not reset an existing password. Legacy `User.passwordHash` remains nullable and unused.

The seed creates YouTube Creator Mastery, six modules with three lessons and one quiz each, questions/options, roadmap nodes, badges and example student history. Seed video URLs are placeholders; replace them with playable video sources before testing playback. The seed refuses `NODE_ENV=production`.

## Authentication and learning journey

Register creates a STUDENT, then the user logs in. Users cannot choose ADMIN. Login defaults to `/dashboard` for students and `/admin` for admins, respecting a validated local callback. Better Auth manages session cookies and logout. Server helpers reload the current database role before authorizing admin access.

Public: `/`, `/login`, `/register`, published `/courses` and `/courses/[slug]`.

Protected: `/dashboard`, `/roadmap`, `/learn/[slug]`, `/quizzes/[slug]`, quiz results, `/achievements`, `/profile`. All `/admin/*` pages require ADMIN on the server.

The learning flow is:

1. Enroll in a published course.
2. Follow the linear roadmap; opening an accessible lesson records in-progress state.
3. Mark lessons complete. Reopening never downgrades a completed lesson.
4. Complete the checkpoint. The server validates questions/options and calculates the score using the quiz's pass requirement (seeded at 80%).
5. A passing attempt unlocks the next required step. Retrying preserves history, and a later failure does not invalidate an earlier pass.
6. Badge conditions and course completion are evaluated after learning mutations. Awards are unique per user/badge.

Lesson progress percentage counts completed published lessons. Module/course completion also requires all applicable published checkpoint quizzes. Streaks count distinct UTC activity days through today or yesterday. Correct answers and explanations are shown only for the current user's completed attempt. Quiz elapsed time is not tracked: attempts are created on submission.

The existing Login/Register sliding panels, page layouts, classes, images and theme are retained. Profile editing supports name, bio and avatar URL; email/role/password editing and uploads are not part of this implementation. Without a stored YouTube connection the profile displays Not Connected.

## Validation

```bash
npm run db:format
npm run db:validate
npm run db:generate
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Tests cover progress, quiz grading and input security, retries, linear prerequisites, badge conditions, role authorization, safe callbacks, account registration boundaries and password hashing. Database calls are mocked in service/action tests; these are not PostgreSQL integration tests. `next/font` can require network access during a fresh build.

For opt-in live verification, first build and run the local app on port 3000 (`npm run build`, then `npm run start`). With the matching local `BETTER_AUTH_URL`, private `BETTER_AUTH_SECRET` and existing demo `SEED_PASSWORD`, run `npx tsx prisma/verify-student-flow.ts --allow-progress`. This completes demo lessons and creates real quiz attempts/badges; it never resets or deletes history. A rerun preserves earlier records but intentionally creates new retry attempts. Use `npx tsx prisma/verify-student-flow.ts --inspect` for read-only database counts and derived roadmap states. The tool reads the current build's action manifest; rebuild after changing application code. Keep the real secret only in ignored `.env`, never in `.env.example`.

Full Admin CRUD, YouTube OAuth/API, Google sign-in, password recovery/email verification flows, payments, community and uploads remain outside scope. Admin's existing forms do not persist changes. Review the [implementation status](docs/IMPLEMENTATION_STATUS.md), [architecture](docs/ARCHITECTURE.md) and [continuation audit](docs/CORE_PLATFORM_AUDIT.md) before starting the next task.
