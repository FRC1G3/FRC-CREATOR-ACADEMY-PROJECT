# Core student platform

Browser → Next.js Server Components/Server Actions → Better Auth + current-user guards → learning services → Prisma → PostgreSQL.

- `src/lib/auth.ts`: maintained Better Auth provider, Prisma adapter, database sessions and Next.js cookie integration. Registration has an input-disabled role and server creation hook forcing STUDENT. Admins are provisioned separately through development seed, not public registration.
- `src/lib/current-user.ts`: request-scoped session lookup and safe user projection. `requireUser()` redirects guests; `requireAdmin()` checks the current database role.
- `src/actions/`: one mutation style, Server Actions, with Zod validation and session-derived user IDs. `/api/auth/[...all]` is the provider's required protocol handler, not a second learning API.
- `src/services/learning.ts`: published course lookup, enrollment/prerequisites, shared derived progress, batched overview reads and badge/completion side effects. No per-course progress-query loop in the overview.
- `src/lib/learning-rules.ts`: pure percentage, quiz grading, roadmap and badge/streak rules; tested independently.
- `src/services/presentation.ts` and `src/types/learning.ts`: safe presentation props for existing UI components. No password fields or pre-submission correctness fields in client DTOs.

Quiz pages explicitly select question/option IDs and text, omitting isCorrect/explanations. Submission validates every question/option association against the authorized published quiz; the server calculates score and pass status. Only completed attempts owned by the current session user can be reviewed. A UUID submission key makes retrying the same request idempotent; a new quiz attempt uses a fresh key. Transactions include answer rows, attempt completion, badges and course completion.

Progress percentage is completed published lessons / total published lessons, zero for an empty course. Module/course completion also requires all applicable published quizzes. Any completed passing attempt satisfies the checkpoint forever unless future content rules explicitly change. Roadmap states are derived in order. Reward nodes do not block learning, so an unrelated streak award cannot deadlock a course. Content missing from the configured roadmap fails closed for direct lesson/quiz access.

Streaks use unique UTC lesson-completion/quiz-completion days and tolerate the current day not being active yet. Badge evaluation runs after completion/submission, never as a full scan during ordinary page rendering. Database uniqueness prevents repeat awards; course completedAt is set only when null.

The existing UI is retained. Client components are limited to interaction (forms, quiz question selection, video/session-independent controls). Admin data remains explicitly mock. Full PostgreSQL integration and browser flow validation remain pending; unit tests mock database boundaries.

Provider references used: [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next), [Prisma adapter](https://better-auth.com/docs/adapters/prisma), [Prisma configuration](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).
