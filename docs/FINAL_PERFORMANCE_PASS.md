# Final performance pass - 2026-10-01

## A. Baseline and final measurements

Production Next build/start, dedicated local port, real configured Neon. Two complete sequential runs, 68 samples each: first use + three hot samples for each path. One isolated signed-session user, four published lessons in two modules, ten-question quiz, ordered roadmap and one course bookmark per run. Fixture shape/reset is identical before/after. No existing learner history or environment changed.

Instrumentation-only spans/wrappers were added before baseline; functional optimizations followed it. Source: [before JSON](final-performance-before.json), [after JSON](final-performance-after.json). Both files are intentionally retained as numeric/label-only evidence.

Server/action timing ends when the action or server page function returns its React tree. Full HTTP waits for the complete response body, including streamed/rendered content. Quiz Submit includes Next's refreshed quiz page; the separate Result GET approximates the subsequent navigation. GET samples use full HTML/RSC responses, not isolated RSC navigation requests. No hydrated browser click/paint timing was measured.

| Operation | Before hot server/action ms | Before full HTTP ms | After hot server/action ms | After full HTTP ms | Emitted SQL before -> after |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mark Complete | 3799 | 5919 | 1732 | 2799 | 18 -> 15 |
| Quiz Submit | 2647 | 3624 | 2602 | 3633 | 21 -> 17 |
| Quiz Result | 373 | 383 | 390 | 401 | 2 -> 2 |
| Dashboard | 385 | 394 | 404 | 412 | 4 -> 4 |
| Courses | 368 | 374 | 374 | 381 | 6 -> 6 |
| Course Detail | 559 | 566 | 555 | 562 | 7 -> 4 |
| Roadmap | 565 | 571 | 602 | 608 | 6 -> 3 |
| Roadmap Default | 402 | 408 | 747 | 754 | 3 -> 3 |
| Profile | 616 | 622 | 393 | 400 | 4 -> 4 |
| Achievements | 452 | 458 | 384 | 390 | 2 -> 2 |
| Bookmarks | 519 | 523 | 372 | 377 | 3 -> 3 |
| Lesson | 1173 | 1180 | 1215 | 1221 | 11 -> 8 |
| Admin Dashboard | 391 | 399 | 430 | 438 | 7 -> 6 |
| Admin Courses | 372 | 378 | 442 | 448 | 2 -> 2 |
| Admin Lessons | 383 | 390 | 438 | 443 | 3 -> 3 |
| Admin Quizzes | 388 | 393 | 434 | 439 | 3 -> 3 |
| Admin Students | 388 | 394 | 555 | 560 | 3 -> 3 |

Quiz HTTP Submit + Result, paired by sample: **4007 -> 4035 ms** hot median. This is not a material speed improvement. SQL for that full flow: **23 -> 19**.

### Before: all samples (milliseconds)

| Operation | Initial server / HTTP | Hot 1 server / HTTP | Hot 2 server / HTTP | Hot 3 server / HTTP | Hot median server / HTTP |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mark Complete | 16269 / 39004 | 6572 / 11411 | 2787 / 4578 | 3799 / 5919 | 3799 / 5919 |
| Quiz Submit | 3747 / 4711 | 2670 / 3624 | 2638 / 3591 | 2647 / 3626 | 2647 / 3624 |
| Quiz Result | 390 / 408 | 373 / 383 | 376 / 384 | 373 / 381 | 373 / 383 |
| Dashboard | 451 / 463 | 389 / 398 | 385 / 394 | 378 / 385 | 385 / 394 |
| Courses | 1449 / 1462 | 368 / 374 | 381 / 387 | 365 / 372 | 368 / 374 |
| Course Detail | 581 / 593 | 559 / 566 | 598 / 603 | 556 / 562 | 559 / 566 |
| Roadmap | 549 / 557 | 564 / 569 | 570 / 576 | 565 / 571 | 565 / 571 |
| Roadmap Default | 453 / 458 | 453 / 459 | 392 / 397 | 402 / 408 | 402 / 408 |
| Profile | 438 / 448 | 419 / 425 | 706 / 711 | 616 / 622 | 616 / 622 |
| Achievements | 600 / 611 | 844 / 850 | 432 / 438 | 452 / 458 | 452 / 458 |
| Bookmarks | 418 / 425 | 430 / 433 | 519 / 523 | 585 / 589 | 519 / 523 |
| Lesson | 1210 / 1217 | 1426 / 1432 | 1173 / 1180 | 942 / 950 | 1173 / 1180 |
| Admin Dashboard | 1620 / 1633 | 391 / 399 | 380 / 389 | 392 / 399 | 391 / 399 |
| Admin Courses | 399 / 410 | 370 / 376 | 379 / 384 | 372 / 378 | 372 / 378 |
| Admin Lessons | 379 / 390 | 394 / 401 | 375 / 382 | 383 / 390 | 383 / 390 |
| Admin Quizzes | 385 / 395 | 388 / 393 | 377 / 383 | 389 / 394 | 388 / 393 |
| Admin Students | 376 / 385 | 397 / 403 | 388 / 394 | 384 / 388 | 388 / 394 |

### After: all samples (milliseconds)

| Operation | Initial server / HTTP | Hot 1 server / HTTP | Hot 2 server / HTTP | Hot 3 server / HTTP | Hot median server / HTTP |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mark Complete | 3573 / 6327 | 1667 / 2799 | 1732 / 2970 | 1738 / 2709 | 1732 / 2799 |
| Quiz Submit | 2448 / 3432 | 2991 / 3918 | 2602 / 3633 | 2570 / 3548 | 2602 / 3633 |
| Quiz Result | 388 / 402 | 378 / 387 | 393 / 402 | 390 / 401 | 390 / 401 |
| Dashboard | 1625 / 1637 | 380 / 387 | 412 / 421 | 404 / 412 | 404 / 412 |
| Courses | 1558 / 1572 | 1600 / 1606 | 374 / 381 | 372 / 379 | 374 / 381 |
| Course Detail | 563 / 574 | 555 / 562 | 553 / 561 | 562 / 568 | 555 / 562 |
| Roadmap | 568 / 577 | 615 / 621 | 602 / 608 | 567 / 575 | 602 / 608 |
| Roadmap Default | 382 / 388 | 377 / 382 | 1219 / 1226 | 747 / 754 | 747 / 754 |
| Profile | 396 / 408 | 381 / 389 | 393 / 400 | 396 / 403 | 393 / 400 |
| Achievements | 403 / 412 | 395 / 403 | 382 / 389 | 384 / 390 | 384 / 390 |
| Bookmarks | 379 / 387 | 372 / 377 | 372 / 376 | 371 / 378 | 372 / 377 |
| Lesson | 2036 / 2045 | 1215 / 1221 | 1683 / 1691 | 1050 / 1059 | 1215 / 1221 |
| Admin Dashboard | 1715 / 1727 | 429 / 436 | 430 / 438 | 516 / 522 | 430 / 438 |
| Admin Courses | 497 / 507 | 541 / 547 | 442 / 448 | 420 / 425 | 442 / 448 |
| Admin Lessons | 462 / 472 | 420 / 426 | 438 / 443 | 452 / 458 | 438 / 443 |
| Admin Quizzes | 468 / 478 | 416 / 421 | 518 / 523 | 434 / 439 | 434 / 439 |
| Admin Students | 440 / 449 | 506 / 512 | 555 / 560 | 734 / 740 | 555 / 560 |

Initial means first process/route/action use, not a proven Neon cold start. Keep all outliers: initial Mark Complete was 39 seconds; first hot was 11.4 seconds. They are not representative steady-state or evidence of an application CPU bottleneck. Baseline and after are sequential runs rather than interleaved statistical experiments. Small differences are not reliable wins.

## B. Confirmed root causes, ranked

1. Remote query latency dominates: SELECT 1 samples before [186, 185, 184, 185] ms, after [202, 202, 225, 189] ms. These include network, adapter and DB work; they do not isolate geographical RTT or DB execution time.
2. Required serial transaction work: auth, user/course/quiz locks, snapshot, idempotency, questions and atomic history writes. CPU scoring/derivation is under profiler millisecond resolution. Removing required locks would compromise curriculum/attempt consistency.
3. Action response refresh: quiz renders the current quiz again before result navigation; Mark Complete renders the updated lesson. This is real RSC work, not time in revalidatePath itself.
4. First-use connection/pool/request variability: large outliers are observed. No idle-wake/region experiment was run; exact causes cannot be assigned to Neon cold start.

## C. Changes and measured effects

- Quiz attempt + bulk answers are two explicit writes inside the same existing transaction. A narrow returning projection replaces the nested create's extra result read. quiz.write **549 -> 397 ms**, **3 -> 2 SQL**; complete action **2647 -> 2602 ms**, **13 -> 12 SQL**. Total Submit+Result did not improve materially.
- courseState uses one selected, joined, course-scoped User read for enrollment/progress/finished attempts/earned badge IDs after the existing published course read. No profile/credential/image/answer fields. Four student queries become one; state derivation/security remain unchanged. Course Detail **7 -> 4 SQL**, practically unchanged **566 -> 562 ms HTTP**. Course-specific Roadmap **6 -> 3 SQL**, slower in this run **571 -> 608 ms**. Lesson **11 -> 8 SQL**, no measured latency win.
- Admin dashboard reuses adminCourses' titles/images/enrollment counts and groups completed enrollments rather than reloading all courses/images/enrollment rows. Passed/failed attempt aggregate groups replace two count calls. Admin Courses selects only displayed fields and module lesson counts. Admin dashboard **7 -> 6 SQL**, HTTP **399 -> 438 ms**: no latency improvement claimed. Courses list SQL/payload unchanged, while unused DB columns are no longer fetched.
- Lesson iframe gains loading="lazy". No HTML/RSC payload or measured server latency reduction is claimed; heavy third-party browser transfer scheduling was not measured. Playback attributes/source handling are preserved.
- Existing opt-in timing instrumentation gains quiz subspans, route wrappers and numeric query counter endpoints so nested spans are not double-counted when collecting a sequential full response. No second profiler, SQL text, parameters, identities or public endpoint.

## D. Database round trips / transactions / indexes

The table counts emitted Prisma SQL statements, a round-trip proxy rather than packets. Transaction statements are counted only when emitted by Prisma's event API. Parallel statement totals are not serial waits; nested spans overlap and must not be summed. The dedicated server has one sequential HTTP request at a time; counters are process-wide and inappropriate for per-request attribution under concurrent traffic. Query-duration totals include remote/adapter waits and can overlap.

Mark Complete action stays at **7 SQL**; its response drops **18 -> 15** due solely to the course-state read in the refreshed lesson. Quiz action **13 -> 12**, refreshed Quiz **8 -> 5**, Result **2 -> 2**. Dashboard **4**, Courses **6**, default Roadmap **3**, Profile **4**, Achievements **2**, Bookmarks **3** unchanged. Admin lists remain batched, **2-3 SQL** including auth. Existing curriculum/badge reconciliation uses batch reads/insert/update, not per-learner query loops.

Existing unique/index definitions cover enrollment and lesson progress user/target, quiz attempts user/quiz/start, roadmap course/order and bookmark user/target/time. No evidence of an expensive missing-index scan; **no schema, index or migration change**.

One lazy process-shared PrismaClient/PrismaPg pool remains. No client/pool recreation per action and no application lifecycle leak found.

## E. Quiz final breakdown

| Span | Hot median ms | Emitted SQL |
| --- | ---: | ---: |
| quiz.auth | 191 | 1 |
| quiz.locks | 377 | 2 |
| quiz.snapshot | 440 | 2 |
| quiz.access | 0 | 0 |
| quiz.quiz-lock | 197 | 1 |
| quiz.idempotency | 193 | 1 |
| quiz.questions | 203 | 1 |
| quiz.score | 0 | 0 |
| quiz.attempt | 190 | 1 |
| quiz.answers | 194 | 1 |
| quiz.write | 397 | 2 |
| quiz.derive | 0 | 0 |
| quiz.badges-completion | 190 | 1 |
| quiz.revalidation | 0 | 0 |
| quiz.total | 2602 | 12 |

Hot Result page: server **390 ms**, complete HTTP **401 ms**, **2 SQL**. Post-action quiz-page server median is 972 ms. Individual medians are not additive. Transaction acquisition/commit and any intervals outside the named spans remain within quiz.total; they are not isolated CPU time.

Access/scoring/derived post-write snapshot are memory work. Completion and badges share evaluateBadgesForUser and were timed together, not artificially separated. This fixture awarded a module badge (one batch insert) and retained an incomplete course because its last lesson remains unfinished; no course-completion write occurred in these HTTP samples. The opt-in regression separately exercises completion and previous-pass preservation.

Atomic history, server membership validation/scoring, >=80% boundary, ordered locks, own request ID checks, retries and prior passes remain. All answers are one createMany inside the same transaction, with no skipDuplicates hiding malformed history. No required transactional reads/locks were moved outside their consistency boundary.

## F. Mark Complete

Action logic/locks/snapshot/write/reconciliation unchanged. Existing single snapshot + in-memory post-write derivation remain. Refreshed lesson benefits from the shared course-state read. Hot measured action **3799 -> 1732 ms** and full HTTP **5919 -> 2799 ms**, but much of this difference is network/first-run variance: do not attribute it to an action optimization. The deterministic reduction is only three refreshed-page SQL statements.

## G. Route audit

Dashboard, Courses, default Roadmap, Profile, Achievements and Bookmarks required no new functional changes. Their server data remains projected/batched and independent reads remain parallel. Course state preserves all finished attempt summaries so a failed retry cannot erase earlier passes. Course Detail retains its parallel bookmark lookup; joining unrelated presentation into a larger query was not justified. Detailed current timings and unchanged-path controls are in A.

Admin Courses/Lessons/Quizzes/Students remain server pages with small interactive client tables. Student list never fetches account/password/session data; full historical details are confined to the student detail route. Admin list counts are not one query per row. Commercial pagination/history aggregation remains future scope.

## H. Client, payload, bundle, images/media

Complete response bytes remain essentially unchanged: Dashboard 53,880; Courses 45,668; Course Detail 51,656; Roadmap 46,144; Profile 59,376; Achievements 51,094; Admin Courses 44,537. SQL reduction is not a browser payload reduction. Mark/lesson/Admin dashboard differ only by small markup/serialization overhead.

All main route pages remain server components. Client tables, filters, accordions, editor/bookmark/quiz islands receive presentation props rather than credential/full student objects. Course lists need their compressed/local/HTTPS images; progress and selector queries exclude image blobs. No CSS background references an original PNG. DatabaseImage optimizes local sources, leaving validated remote/data images browser-fetched. No YouTube iframe occurs in course lists/layout; native video retains metadata preload.

Largest production chunks by gzip are about 94KB, 72KB, 45KB and 40KB. This is a quick per-file inventory, not downloaded per-route JS or a Lighthouse budget. No obvious high-impact dependency/layout boundary problem warranted a bundle refactor. No packages/re-encoding pipeline changed.

## I. Perceived UX / revalidation

Existing Mark Complete optimistic saving label, Quiz Submitting/disabled state, optimistic bookmark, Profile pending/image-processing state and Admin save/publish/delete pending guards remain. Existing loading.tsx routes cover Dashboard/Courses/Course Detail/Roadmap/Profile/Achievements/Bookmarks/Lesson/Quiz/Result/Admin. Default Next Links are retained; no mass prefetch introduced.

No duplicate router.refresh found. Existing learning revalidation refreshes affected aggregate progress, badge, streak and learning surfaces. The refreshed current lesson is required for unlocked Next/status; quiz's result navigation is separate. Revalidation itself rounds to 0ms; removing correct invalidation or changing redirect/action semantics solely to avoid the quiz rerender was not justified this late. No new artificial loading or CSS redesign. Hydrated pending, animations, prefetch transfer and third-party playback still need manual browser confirmation.

## J. Correctness and cleanup

Default regression covers auth/roles, locked roadmap resources, scoring/membership, quiz retries/idempotency, completion/badges, owned bookmarks, safe Admin mutation/history and Draft/Published filtering. Production profiling verifies same-session role promotion/demotion and ten stored answers per successful quiz sample.

Real opt-in quiz test verifies same request leaves 3 attempts/30 answers, exact 80% pass, separate failed retry, 50 retained answers, earlier-pass completion and retained completedAt. Real isolated consistency verification passes shared Student/Admin progress, draft-only module visibility, locked checkpoints, ordered answer review, completion transitions after curriculum edits, targeted badge reconciliation and preserved history.

One profiling run rejected its quiz action; detailed raw errors were intentionally not logged, so its cause is unconfirmed. It is not included in the successful 68-sample after dataset. A subsequent full run and the dedicated real quiz test passed. First blocked/aborted runs also left one temporary fixture; cleanup was corrected to remove its roadmap references before course deletion, ownership checked, and those own records removed. Final ownership-scoped count verifies no profiling users/courses remain. No existing learner records touched.

## K. Tests

Default: **267 tests total, 266 passed, 1 opt-in skipped, 0 failed**, 26 files passed/1 skipped. Separate real opt-in quiz test: **1 passed**. Separate isolated Neon consistency script: **passed and cleaned up**. Normal test execution does not connect to Neon.

## L. Validation

Current tree: Prisma format / validate / generate, TypeScript noEmit, ESLint, Vitest, production build and git diff --check **passed**. No environment/package/schema/deployment changes. Existing unrelated dirty worktree edits preserved.

## M. Remaining bottleneck

Primarily remote DB latency multiplied by required transactional/query ordering, plus connection/request variability and action-induced server rendering. CPU scoring/derivation and revalidation calls are negligible. Simple joined pages already require only auth plus data phases; fewer parallel statements do not necessarily shorten that critical path. No material quiz end-to-end speedup is claimed. Idle wake/geographical distance and hydrated browser rendering are not independently measured here. Deploy-region/DB-region proximity may matter, but infrastructure changes are outside this authorized task.

## N. Deployment verdict

**READY TO DEPLOY** for the university MVP code/performance scope; no actual code/check blocker identified. Deployment configuration, real course media, third-party playback and browser UX verification are separate operational/manual work, not claimed complete by HTTP tests.

**NO FURTHER PERFORMANCE REFACTOR IS RECOMMENDED BEFORE DEPLOYMENT.**

Reproduce only with explicit live-DB permission: production build, then node --conditions=react-server --import tsx prisma/profile-final-performance.ts --before or --after. This starts/stops its own hidden production server at local port 3019, uses existing environment without changing it, and creates/cleans only isolated fixtures. Avoid concurrent requests during these aggregate measurements. Keep PROFILE_PERFORMANCE disabled in normal runtime.
