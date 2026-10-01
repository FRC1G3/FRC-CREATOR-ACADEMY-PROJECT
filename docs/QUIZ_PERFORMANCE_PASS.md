# Bounded quiz performance pass

Real Neon measurements, isolated temporary account/course/10-question quiz. The real submit action and Better Auth DB session lookup ran through an opt-in Vitest harness. Next request headers and revalidation were stubbed; this measures server action/data work, not browser navigation or complete React streaming. All fixture records were cleaned. No existing learner history was changed.

| Submit sample | Before | After |
| --- | --- | --- |
| First (cold) | 5220 ms / 19 SQL | 8852 ms / 13 SQL |
| Warm 1 | 4704 ms / 18 SQL | 4699 ms / 12 SQL |
| Warm 2 | 4183 ms / 18 SQL | 4232 ms / 12 SQL |

Warm mean: 4444 ms -> 4466 ms. Six fewer SQL statements (33%), but **no demonstrated wall-clock speedup** in this small, network-variable sample. Cold auth alone took 2298 ms after the change; warm auth was 199–476 ms. Timings are not a production benchmark.

Changes:
- One transaction-scoped student overview replaces the six-query access path plus a second post-write overview. Access is checked in memory against published enrolled courses and unlocked quiz nodes.
- The saved attempt is added immutably to that snapshot; badge/completion reconciliation reuses it. Historical passes remain satisfied after failed retries; streak includes the new attempt.
- Quiz questions/options use one explicitly joined, narrowly selected read. Correct answers remain server-only.
- Answer writes explicitly use nested createMany within the existing atomic transaction. Existing Prisma nested create was already batching this fixture; no extra query-count reduction is claimed for that change.
- Course/user/quiz locks, request-ID idempotency, server scoring, retry history and authorization are preserved.

After-change warm breakdown: locks 462–641 ms / 2 SQL; snapshot 732–964 ms / 2 SQL; access 0 ms / 0 SQL; question read 209–214 ms / 1 SQL; write 1074–1227 ms / 3 SQL; post-write derivation and badge evaluation 0 ms / 0 SQL for this fixture (no new award/completion). Other users can legitimately require award/completion writes.

Route component data measurements (not full browser renders): result before 370–480 ms, after 578–1457 ms, both 2 SQL; course detail before 697–2108 ms, after 817–4059 ms, both 7 SQL; Admin Lessons before 392 ms, after 549 ms, both 2 SQL. No route changes were justified in this bounded pass. Course detail already parallelizes independent reads; current user is request-cached in React. No N+1 was found in these paths.

No redundant router.refresh was present in quiz submission. Revalidation stayed unchanged. Pending text, synchronous double-submit guard and route loading UI already exist and stayed unchanged.

Validation: 226 unit tests passed; opt-in real DB profile passed separately; TypeScript, ESLint and production build passed. The profile test is skipped by default. Run with RUN_QUIZ_PROFILE=1 and PROFILE_PERFORMANCE=1 using `npx vitest run tests/quiz-performance.test.ts --disableConsoleIntercept --reporter=verbose`.

Remaining bottleneck: variable remote Neon round-trip latency plus required serial transaction locks/writes. No schema, infrastructure, auth security, Admin CRUD, UI design or deployment changes.
