# Student UX / interaction polish — 2026-09-28

Scope: student application only. No Admin page edits, deployment, progression rewrite or database reset. The pre-existing change in `src/app/admin/students/page.tsx` was left untouched (including its existing trailing blank-line diff warning).

## Requested final report

| # | Request | Result |
|---|---|---|
| 1 | Course-card interaction | Existing semantic View Course link covers the card with a CSS pseudo-element. Keyboard works through that link; bookmark remains a separate control above the link hit area. No nested links. |
| 2 | Breadcrumb | Courses, actual course slug and module anchor are links. The target module opens from the hash. |
| 3 | Lesson row navigation | Available title link covers row and video icon. Locked rows have no link. Also applied to lesson-sidebar rows/checkpoints. |
| 4 | Completed lesson rewatch | Existing access rules retained; completed lesson remains linked and accessible. Confirmed by service tests and production HTTP. |
| 5 | Next Checkpoint height | Lesson action buttons/links use equal 48px height, with existing responsive single-column wrapping. |
| 6 | Locked lesson UI | Generic themed card, View Roadmap and Back to Course. Only published course slug is fetched for context; no protected player or lesson content is rendered. |
| 7 | Module progress | Published lessons plus published module quizzes form the denominator. Three lessons with quiz pending = 75%; passing quiz = 100%. Global progress/scoring rules unchanged. |
| 8 | Quiz row states | Checkpoint required, Not passed - Retry required, Passed. Pass takes precedence over historical failures. |
| 9 | Quiz navigation | Course breadcrumb, Back to Course, visible unsaved-answer notice; result adds Course/Roadmap links. Existing failed retry and passed continuation retained. |
| 10 | Answer review | Separate bordered cards, success/error status icons, labeled selected/correct answers, explanation where present. Correctness remains server-projected after a user-owned submitted attempt. |
| 11 | Avatar UX | Raw URL removed from normal form. Current preview and labeled file picker; camera opens the same editor. |
| 12 | Upload/storage | JPEG/PNG/WebP original up to 5 MB, client resize to maximum 512px, compressed JPEG/WebP data URL limited to 280,000 characters. Server Sharp decodes, validates dimensions/format and re-encodes WebP before saving existing `User.avatarUrl` text. No filesystem upload. |
| 13 | Profile auto-close | Successful action updates layout/profile, closes editor and emits a short status toast. Validation/network errors keep draft fields and editor. |
| 14 | Sidebar outside click | Fixed backdrop outside navbar's backdrop-filter containing block closes menu. |
| 15 | Sidebar Escape | Document Escape listener, focus trap, focus restoration and body-scroll restoration. Hidden menu remains inert. |
| 16 | Sidebar logo | Semantic home link; normal menu navigation closes immediately. |
| 17 | Logout | Pending/disabled control; provider sign-out, layout identity revalidation, local identity clear, sidebar close, landing redirect and status feedback. Provider/transport errors are reported. Existing Admin logout action retained. |
| 18 | Bookmarks schema/feature | Separate CourseBookmark/LessonBookmark, unique user+target and user/date indexes, FK cascading on owner/target deletion. Bookmark deletion never deletes content. Action derives ownership exclusively from live session. Save is idempotent and lesson access is validated server-side. |
| 19 | Bookmarks page | Protected `/bookmarks`, Saved Courses/Saved Lessons, links, metadata, remove controls, empty state. Catalog/detail/dashboard/lesson icons now persist optimistic save/remove. |
| 20 | Landing mobile | Practical Lessons phone was embedded in desktop background. Below 900px it now occupies a separate normal-flow pseudo-element after text; same artwork and desktop composition retained. Roadmap can grow at small widths; navbar long names truncate. Source audit covered all five landing sections/footer and 320/375/390/430/768 breakpoints. Visual browser checks remain manual. |
| 21 | Dead controls | Student links/forms/accordions/player/progression retained; bookmarks and avatar camera enabled. Future controls remain truly disabled. See list below. |
| 22 | Files | Full inventory below. No existing class names renamed. |
| 23 | Migration | `20260928000100_student_bookmarks` created and applied with `prisma migrate deploy`. It was the only pending migration. Existing records/history preserved. |
| 24 | Tests | 204 tests across 22 files, zero failures. Existing 171 tests retained; 33 focused tests added. |
| 25 | Prisma | Format, validate and generate passed. |
| 26 | TypeScript | `npx tsc --noEmit` passed. |
| 27 | Lint | `npm run lint` passed. |
| 28 | Build | `npm run build` passed; final CSS changes verified by a subsequent final build. |
| 29 | Runtime | Real Neon bookmark creation, uniqueness, user isolation, deletion and target preservation; production HTTP public/student routes, completed rewatch, locked UI, module breadcrumb, avatar persistence/render, sign-out revocation and login redirect. No browser clicks claimed. Temporary fixtures cleaned. |
| 30 | Remaining student blockers | No functional blocker observed in automated/HTTP checks. Browser-only interaction and viewport sign-off remain pending: sidebar clicks/focus, animation, optimistic rendering, profile auto-close/toast and five-width visual comparison. Exact steps in `MANUAL_STUDENT_SMOKE_TEST.md`. |

**University MVP uses DB-backed compressed avatar data. Production version should use object storage.** Sharp was already installed transitively; the same version (0.35.4) is now explicitly declared as a production dependency. No external storage platform was added.

## Performance and security boundaries

- Existing joined student snapshot, live cached-per-render auth, optimized completion writes and badge evaluation were not rewritten.
- Catalog and dashboard each fetch bookmark IDs once in bulk; detail/lesson each add one selected lookup. Bookmark page uses two relation projections. No database calls per rendered card; no `router.refresh()` added.
- Profile save revalidates layout to refresh shared avatar/name; this is a profile mutation, not an added learning-completion query.
- `>=80%`, locks, completed timestamps, historical pass dominance, quiz-driven Continue Learning and badge/course completion rules remain intact.
- Runtime script uses isolated users and existing published curriculum; it does not change real learning history. Server-action correctness is unit-tested; HTTP checks of photo persistence use normalization + DB write, not simulated browser file input.
- Early integration harness iterations fixed fixture account linkage, dependent-row cleanup and Next.js streamed redirects. The final run passed and all temporary users were removed.

## Intentionally disabled student features

Progress destination (no page), Community, Creator Tools, Notes, Settings, Library, Download Notes, Share Profile, YouTube account connection/management, footer social links without configured destinations, unimplemented footer informational/legal links and newsletter signup. These were not expanded in this task.

## Files changed or created in this task

Data and actions:

- `package.json`, `package-lock.json`
- `prisma/schema.prisma`
- `prisma/migrations/20260928000100_student_bookmarks/migration.sql`
- `src/actions/auth.ts`, `src/actions/learning.ts`, `src/actions/bookmarks.ts`
- `src/lib/avatar.ts`, `src/lib/avatar-server.ts`, `src/lib/bookmark-validation.ts`, `src/lib/image-source.ts`, `src/lib/validation.ts`
- `src/services/bookmarks.ts`, `src/services/presentation.ts`, `src/types/learning.ts`

Routes:

- `src/app/layout.tsx`
- `src/app/bookmarks/page.tsx`, `src/app/bookmarks/loading.tsx`
- `src/app/courses/page.tsx`, `src/app/courses/[courseId]/page.tsx`
- `src/app/dashboard/page.tsx`, `src/app/learn/[lessonId]/page.tsx`
- `src/app/quizzes/[quizId]/page.tsx`, `src/app/quizzes/[quizId]/result/page.tsx`

Components and styling:

- `src/components/course/CourseCard.tsx`, `CourseCurriculum.tsx`, `CourseDetailHero.tsx`, `CourseModule.tsx`
- `src/components/dashboard/ContinueLearning.tsx`
- `src/components/landing/Menu.tsx`
- `src/components/layout/AccountNavigation.tsx`, `Navbar.tsx`
- `src/components/profile/ProfileEdit.tsx`, `ProfileHero.tsx`
- `src/components/quiz/QuizResult.tsx`
- `src/components/learn/LockedLesson.tsx`
- `src/components/learning/BookmarkButton.tsx`, `StatusToast.tsx`
- `src/styles/student-ux.css`
- `src/styles/landing/lessons-preview.css`, `roadmap-preview.css`

Verification:

- `tests/learning-service.test.ts`, `tests/avatar.test.ts`, `tests/profile-action.test.ts`
- `tests/bookmarks.test.ts`, `tests/bookmark-action.test.ts`, `tests/student-logout.test.ts`
- `scripts/verify-student-ux.ts`
- `docs/MANUAL_STUDENT_SMOKE_TEST.md`, `docs/STUDENT_UX_REPORT.md`
