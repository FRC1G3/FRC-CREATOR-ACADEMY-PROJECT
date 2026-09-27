# Real latency audit — 2026-09-28

## Conclusion

The measured cause is **E: application/query architecture plus remote database latency (A + B)**. The original completion action emitted 35 SQL statements, repeatedly fetching related course data over an approximately 185–200 ms hot database round trip. After changes it emits 7 statements for the measured non-milestone completion. The hot median action fell from **8,975 ms to 1,784 ms**; full action + refreshed lesson response fell from **13,808 ms to 2,756 ms**.

**The <1 s / <1.5 s mutation targets were not achieved.** The optimization is real, but the remaining transaction and subsequent lesson render still cross the remote connection repeatedly. Quiz submit also remains slower (one post-change sample: 4,065 ms action / 5,028 ms full HTTP).

## Method and evidence

- `npm run build`, `npm run start -- --port 3100`, real local production HTTP and remote Neon, not dev-mode compilation.
- A new temporary STUDENT with the same published course was used in each run. Its own progress/badges were reset between four completion samples. Its sessions, account, answers, attempts, awards, progress and enrollment were cleaned up. Existing student/admin learning history was not modified.
- Baseline was the current repository after the preceding SSL/transaction-serialization fix, before this task's optimizations. This is not a comparison to an earlier deployment.
- Four sequential samples: initial, hot 1, hot 2, hot 3. Initial samples are **not proof of Neon compute cold start**: login and fixture setup already access the database.
- HTTP values include the complete response body and Next's action-triggered lesson refresh. They exclude browser JavaScript/rendering/images. A streamed loading response is not claimed as measured visible content.
- `PROFILE_PERFORMANCE=1` enables numeric timings and Prisma query event counters. It is off normally. No SQL, parameters, credentials, session tokens or password hashes are logged.
- Query counts are **emitted SQL statement counts**, a useful round-trip proxy, not packet captures. Driver BEGIN/connection setup can add time not represented by a query event. Nested spans overlap; summing them would double-count work. Overlapping pool reads can appear in nested counters (notably the Courses/auth span). The benchmark sends one HTTP request at a time, with no other traffic to its dedicated server.
- Data: [before HTTP](latency-before.json), [after HTTP](latency-after.json), [numeric action/service spans](action-timings.json), [SELECT 1 probe](database-latency.json). The intermediate iteration is retained in [latency-intermediate.json](latency-intermediate.json).

## Full-response samples (ms)

| Operation | Before initial / hot 1 / hot 2 / hot 3 | After initial / hot 1 / hot 2 / hot 3 | Hot median before → after |
|---|---|---|---|
| Mark Complete + lesson refresh | 9175 / 13808 / 11384 / 13861 | 5105 / 3320 / 2729 / 2756 | **13808 → 2756** |
| Dashboard | 2279 / 1299 / 1353 / 1330 | 635 / 599 / 608 / 423 | **1330 → 599** |
| Courses | 1194 / 1107 / 1090 / 2360 | 404 / 395 / 399 / 401 | **1107 → 399** |
| Course detail | 2130 / 1840 / 1373 / 1384 | 784 / 844 / 1173 / 1002 | **1384 → 1002** |
| Roadmap | 1334 / 2298 / 1316 / 1296 | 1017 / 438 / 495 / 465 | **1316 → 465** |
| Profile | 1321 / 1372 / 2361 / 2138 | 451 / 488 / 663 / 462 | **2138 → 488** |
| Achievements | 1145 / 973 / 1088 / 1051 | 415 / 437 / 439 / 427 | **1051 → 437** |

These small samples are not a controlled load benchmark. Network variance is visible, and the first after-completion HTTP sample includes considerably more refresh time than its action. Do not interpret every delta as pure CPU/query-plan improvement.

## Mark Complete breakdown

Exact instrumented first-sample values; remaining samples are in `action-timings.json`.

| Phase | Before ms / SQL | After ms / SQL |
|---|---:|---:|
| requireUser/session resolution | 540 / 3 | 188 / 1 |
| User + course row locks | 357 / 2 | 372 / 2 |
| Access lookup + course state | 2365 / 12 | Reused snapshot; access check 0 / 0 |
| Reusable student snapshot | Not reused | 556 / 2 |
| Progress upsert | 604 / 3 | 184 / 1 |
| Additional progress update | 203 / 1 | Removed |
| Course progress/roadmap derivation after write | Inside repeated overview fetch | 0 / 0 (rounded, in memory) |
| Badge evaluation including overview/reconciliation | 2684 / 13 | 0 / 0 for this non-milestone |
| revalidatePath calls | 1 / 0 | 1 / 0 |
| **Action total, including transaction overhead** | **7118 / 35** | **1668 / 7** |

Before, `accessible` contained a 1,761 ms / 9-SQL `courseState` span; its remaining approximately 604 ms / 3 SQL was the nested lesson→module→course lookup. It was not separately timed as an independent span. Badge evaluation contained a 2,495 ms / 12-SQL overview and a 187 ms / 1-SQL completion reconciliation. CPU-only roadmap derivation was not isolated in the baseline. No invented baseline CPU timing is supplied.

Action totals: before **7118, 8975, 7317, 9519**; after **1668, 2300, 1739, 1784**. On a milestone, badge inserts and a completion update add SQL; 7 is not a universal upper bound.

## Query architecture changes

1. Enabled Prisma 7.10's `relationJoins` generator preview feature. Existing nested reads now use database-side joins instead of one remote query per related table. No migration or dependency upgrade. This is a preview feature and the full verification suite is retained as a regression guard. See [Prisma 7 relation strategy documentation](https://docs.prisma.io/docs/orm/v7/prisma-client/queries/relation-queries).
2. `studentOverview` fetches the user's enrollments/course graph, progress and attempts in one joined, selected user read; badge definitions/earned dates are a second query. User credential/account/session relations are not selected. These two independent reads use the pool in parallel on routes and are serialized inside a single transaction connection.
3. Completion takes this snapshot once after the existing locks, validates the lesson and roadmap node against it, writes progress once, and derives the post-write state in memory. It no longer runs `accessible → courseState`, then loads the learning graph again for badges.
4. Progress uses a native upsert with an update branch. If the snapshot already marks the lesson complete, it skips the write, preserving the original completion timestamp. User and curriculum locks are unchanged.
5. Badge rules are evaluated in memory across all enrolled published courses. Only ACTIVE, not-yet-earned, newly eligible badges are inserted; no empty insert. Existing inactive earned badges remain visible.
6. Completion reconciliation writes only when the derived completion status differs from the enrollment's `completedAt` state. This removes unnecessary per-course writes without deleting history or changing lesson/quiz requirements.
7. Existing independent catalog queries and Profile channel/overview reads remain parallel. No Promise.all was added to a shared transaction connection. No global user-state cache, Redis, background mutation or infrastructure layer was added.

| Operation | Before SQL count | After SQL count | Evidence |
|---|---:|---:|---|
| Completion action, no new milestone | 35 | 7 | Measured action spans |
| Dashboard | 15 | 3 | Before auth 3 + overview 12; after route span 3 |
| Roadmap default course | 15 | 3 | Same overview path; after route span |
| Profile | 16 | 4 | Overview + channel; after route span |
| Course detail | 12 | 6 | Auth + courseState spans |
| Quiz submit | At least ~36 + nested attempt/answer writes | 19 | Before source-derived estimate, **not measured**; after actual action span |

Quiz still has an access snapshot and a post-write overview; nested attempt/answer inserts also remain. This is a remaining application bottleneck. Quiz scoring/atomic history writes/idempotency were deliberately preserved. It is not reported as a sub-second operation.

## Authentication and revalidation

- Better Auth 1.7.6's installed types expose joins under **`advanced.database.joins`**, not the older `experimental.joins` example. Session + current user are now fetched together. The [Better Auth database guide](https://better-auth.com/docs/concepts/database) describes adapter joins; local installed API types determined the exact configuration.
- `getSession` explicitly requests `disableCookieCache: true`; no secondary session store is configured. `getCurrentUser` projects safe fields from that fresh database user instead of querying the same User a second time. `bio` is a read-only additional auth field, not signup-controlled role data.
- React `cache()` remains request-scoped. The isolated route logs show one auth resolution shared by page/navbar. Action and subsequent server render may have separate auth scopes; no unsafe cross-request memoization was introduced.
- Live test: promote the temporary logged-in student to ADMIN → `/admin` works; demote it in the same session → admin sidebar is denied. This verifies fresh role resolution, not just a mocked session assumption.
- Completion/quiz invalidate learning-dependent dashboard, profile, roadmap, achievements, course catalog/detail and lesson pages. These really depend on progress, badges or unlocks, so their invalidation was retained. Calling invalidation took 0–1 ms, not seconds. The current lesson render after it is real additional work, accounted for in HTTP timings.
- Profile save now invalidates Profile and Dashboard instead of every learning view. Other dynamic routes fetch fresh navigation data when visited.
- Admin retains curriculum-dependent invalidation. Removed redundant client `router.refresh()` after the server action already revalidates those paths; creation/edit navigation still uses `router.push`.

## Loading and images

- Mark Complete has a React `useOptimistic` button label while saving, disables duplicate submission, rolls back on error and displays the error. It does not prematurely unlock lessons or persist fake progress. Framework redirect errors are rethrown.
- Existing Login, Quiz Submit and Admin Save pending states and route `loading.tsx` boundaries remain. Actual browser paint/rollback animation timing is not measured by the HTTP harness.
- Completed/in-progress lessons no longer unnecessarily mount the automatic StartLesson action on every visit. New/unstarted lessons still record their start.
- Previous nine WebP backgrounds remain: **11,038,222 → 380,496 bytes (96.55% smaller)**. Local avatars/thumbnails use Next Image. No additional image re-encoding was needed; database/action latency received priority. Images cannot explain the measured server-only completion spans.

## Neon configuration and region

The runtime remains the existing **direct endpoint**, `@prisma/adapter-pg`, a process-shared Prisma client, `sslmode=verify-full`. No URL/region migration was made in this task. The previous SSL fix was already part of the baseline.

For deployed/serverless concurrency, use the exact **pooled connection string from Neon's Connect dialog** as `DATABASE_URL` (hostname contains `-pooler`), with verified TLS. Keep the direct URL as `DIRECT_URL` for CLI tasks, then change `prisma.config.ts` datasource to `process.env.DIRECT_URL ?? process.env.DATABASE_URL`. Runtime `PrismaPg` continues using `DATABASE_URL`; seed remains compatible. Do not blindly append legacy Prisma v6 pool parameters to a v7 driver URL. See [Prisma connection guidance](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections) and [Neon's Prisma guide source](https://github.com/neondatabase/website/blob/main/content/docs/guides/prisma.md).

Pooling helps connection lifecycle/concurrency; it does not remove Azerbaijan→Ohio network travel for each sequential SQL statement. The present local single-process workload did not justify changing a working endpoint automatically.

**A closer Neon region such as Europe/Frankfurt is worthwhile to evaluate.** Prefer placing the deployed Next.js server near its database as well. From a local Azerbaijani developer machine, compare Frankfurt's hot `SELECT 1` latency before migration. At ~185 ms per hot trip, ten serialized trips alone cost ~1.85 s, before rendering/connection setup. Region reduction could materially improve the remaining ~1.8 s action, but no specific Frankfurt speedup is claimed without measurement.

## Cold versus hot

The read-only `measure-database.ts` probe records a fresh connection and three hot `SELECT 1` queries, waits 330 seconds without audit DB traffic, then repeats. The first fresh connection was **1397 ms**; hot samples **185 / 185 / 188 ms**. Connection establishment is included in the first value, so it must not be labeled purely compute wake-up.

After 330 seconds without audit DB queries, the first SELECT 1 took **1988 ms**; subsequent hot queries took **190 / 191 / 194 ms**. This establishes an idle/fresh-connection penalty, but does not separate TLS/connection setup from compute wake-up. Another development client could keep the shared database awake; provider scale-to-zero was not observed directly. Slow hot completions prove cold start is not the sole explanation. No database suspension or region change was forced. Full data is in `database-latency.json`.

## Verification

- Full suite: **171 tests / 17 files passed**, including completion snapshot reuse, timestamp preservation, locked/un-enrolled lesson rejection, existing badge suppression, completion reconciliation, quiz correctness/idempotency and authorization.
- TypeScript and ESLint pass; production build passes. The generator feature was tested with installed Prisma 7.10. No package installed.
- Production HTTP: real completion, routes, live role promotion/demotion, quiz submit, first-section badge and locked lesson rejection passed. Temporary fixtures were removed.
- No browser automation was available; actual clicking/paint/keyboard optimism remains a manual verification boundary. Existing manual smoke checklist still applies.
- Profiler is opt-in. For reliable counts, use a dedicated local server and sequential requests. Do not enable it as a public production telemetry endpoint.

Remaining bottlenecks: remote hot trip latency, transaction begin/commit and row locks, current-page render after mutations, quiz nested writes/repeated state, and possible connection setup/wake-up on idle requests. Targets are reported honestly rather than treating the loading indicator as completed database work.
