# Live student-flow verification — 2026-09-27

The running Next.js production build used the configured Neon PostgreSQL database. Verification used real HTTP requests, session cookies, Next Server Actions and direct Prisma reads. Browser automation was unavailable: this is not a claim of browser click, hydration, animation or video-playback testing. No UI, architecture, schema, Admin CRUD or YouTube OAuth changes were required.

## Authentication and configuration

The local auth secret was missing. A random secret was generated only in ignored `.env`, and the local auth origin was configured for `http://localhost:3000`. No secrets/hashes were logged or committed; `.env.example` retains empty placeholders. Existing credential hashes were not reset. Seeded student login redirected to `/dashboard`; admin login redirected to `/admin`. Sessions persisted across all student page requests. The student's direct `/admin` request redirected to `/dashboard`, while the admin received the admin page. Logout prevented subsequent dashboard access.

## Real learning mutations

- Completed all three lessons in Audience & Niche and all three in Content Strategy. Five previously absent progress rows became IN_PROGRESS and then COMPLETED; the existing Finding Your Niche row moved from IN_PROGRESS to COMPLETED. Reopening each completed lesson left the entire stored progress row unchanged.
- For each module, submitted three separate attempts: 0% fail, 100% pass, then 0% fail. Each stored three answers. Before a pass, the next module's lesson was locked and a direct completion action was rejected. After passing it became accessible; the later failed retry did not relock it.
- Server submission rejected forged `score`, `passed`, `isCorrect` and `userId` fields without creating an attempt. The actual pre-submit HTML/RSC quiz response had no `isCorrect` field. The page's explicit projection also omits explanations. Question/option ownership and quiz membership are checked by server grading and covered by domain/action tests.
- Each attempt's result page showed the appropriate real pass/fail result and 80% threshold. The admin could not read the student's result by attempt ID. Reusing a submission ID did not create another attempt. Duration remains honestly shown as Not tracked; attempts start on submission, not when the quiz opens.
- Quiz Master was earned after the third distinct passed quiz, including the original seeded fundamentals pass. Re-evaluating the condition preserved the same award row and earnedAt; only one award exists.
- Original seeded attempt, original earned badge and enrollment were compared with their pre-run records and remained unchanged.

Dashboard, course detail, roadmap, profile and achievements returned authenticated DB-backed pages before and after mutations. Their shared course calculations derive progress from published lessons and recorded completion; there is no student mock import. Roadmap states derive from ordered RoadmapNode rows plus progress, successful attempts and earned badges; they are not stored as user state columns. Published-content filtering and module/lesson ordering were also inspected in the Prisma query definitions.

Profile save was exercised using the existing name/bio/avatar values and verified in PostgreSQL without altering the user's identity. Profile showed the actual email and Not Connected. Achievements uses real badge definitions, earnedAt and user awards. Marketing content and intentionally mocked admin screens were retained.

## Persisted development state

| Student records | Before | After |
| --- | ---: | ---: |
| Enrollment | 1 | 1 |
| LessonProgress | 4 | 9 |
| Completed lessons | 3 | 9 |
| QuizAttempt | 1 | 7 |
| QuizAnswer | 3 | 21 |
| UserBadge | 1 | 2 |

The additional six attempts, eighteen answers, five progress rows, completion changes and Quiz Master award are intentionally retained as verification history. Removing these would roll back the student's now-valid progression. No reset, broad deletion or seed-history modification was performed. Lesson completion is 9/18 (50%), with three distinct passed quizzes.

## Verification tools and remaining limits

`prisma/verify-student-flow.ts --allow-progress` is an explicit opt-in development mutation check, using the current production build's action IDs. `--inspect` reads current DB state without logging in or mutating learning records. Reruns create new retry attempts and skip an initial-lock assertion when that checkpoint already has a historical pass. It never selects password hashes. `tests/lesson-action.test.ts` adds completion, no-regression, prerequisite bypass and safe-error/revalidation checks.

No primary student mock dependency remained to remove. Seed videos still use example.com placeholders, so real playback requires actual media. Browser interaction testing, concurrent-load/rollback fault injection and a new-user enrollment journey remain separate verification work. The pg SSL-mode warning remains; the working database URL was not changed. Admin CRUD and YouTube integration remain outside this task.

Final read-only Neon inspection confirmed 9/18 completed lessons (50%) and roadmap counts of 13 completed, 1 available and 12 locked nodes. Final validation passed: Prisma 7.10.0 format/validate/generate, TypeScript, ESLint, all 79 tests across 7 files, and the Next.js production build. No seed/auth tests were repeated after the continuation request; only read-only DB inspection and final static/build checks ran.

The server also emitted a pg deprecation warning about queries queued on an already-busy client, relevant to a future pg 9 upgrade. The current pinned pg 8 runtime completed all learning transactions successfully; no driver upgrade or unrelated transaction rewrite was made. No concurrent-load guarantees are inferred from this sequential verification.
