# Admin CRUD and lesson video verification

Implemented against the existing Next.js/Prisma 7.10.0 application and configured Neon database on 2026-09-27. No schema migration, package installation, DB reset, secret change or deployment was required. Existing Admin CSS/layout/sidebar and student presentation were retained; the video player gained a responsive iframe branch.

## Implemented management

- Overview: real courses, lessons, STUDENT count and pass rate across completed quiz attempts. Recent Activity is deliberately a recent-course-update list, not a fabricated audit trail. Top courses are ranked by enrollment count and show the percentage of enrollments completed.
- Courses: live lists, title search, Published/Draft filters, create/edit/status, generated or explicit unique slug, safe deletion. Course Edit includes module creation, rename, description and numeric order.
- Lessons: live course/module filters, module/lesson ordering, real dropdown options, create/edit/status, duration in seconds, thumbnail and video URL. Editing retains Lesson.id. Existing content cannot be reparented to avoid breaking learning paths.
- Quizzes: real list, course/search filtering, question/attempt counts, atomic quiz/question/option creation, single-answer validation, edit/status. Once any attempt exists, question/option changes and pass-score changes are refused; only metadata/status can change. Admin edits and student submission share a quiz row lock.
- Roadmap: live course selector, lesson/quiz/reward node creation, validated same-course targets, no duplicate target in a path, up/down ordering and guarded removal. Swaps use an unused temporary order under a course-row lock. No branching or drag-and-drop.
- Badges: create/edit/activate/deactivate with evaluator-supported conditions. Inactive earned awards stay visible and are not awarded again. Students: safe projected identity/progress list, search/filters and educational detail route; no credential/session fields.

Every admin mutation uses `requireAdmin()` before parsing or accessing the mutation service. Query helpers and sensitive detail routes also require ADMIN. Zod validates input server-side; Prisma uniqueness/foreign-key errors are translated into readable messages. Actions revalidate affected admin and student routes. The shared editor prevents duplicate pending submissions and retains fields on errors.

## Deletion and history decisions

Only empty courses and empty modules can be deleted. Existing restrictive foreign keys prevent deleting lessons with progress, quizzes with attempts, badges with awards, or any target referenced by roadmap nodes. Courses with enrollments/learning history cannot have roadmap nodes removed. Use Draft/Inactive for history-bearing content. Quiz versioning and moving existing lessons/modules/quizzes between parents were intentionally not introduced.

## Video update and source handling

All **18 existing lessons** were updated to `https://youtu.be/PHVuZ5I_Jb4?si=rd4zQjly3qfHKpOx`. Only videoUrl and Prisma's automatic updatedAt changed on lesson rows; IDs and all other lesson values were compared and preserved. The future seed create value uses one constant, while its empty upsert updates still preserve future Admin edits.

The player reads Lesson.videoUrl from the database. The parser accepts approved YouTube hostnames and valid 11-character IDs from youtu.be, watch?v= and embed URLs, normalizing this video to `https://www.youtube.com/embed/PHVuZ5I_Jb4`. Other hosts cannot impersonate YouTube. Direct MP4/WebM/OGV/OGG/M4V paths use native video controls. Invalid/empty/unsupported URLs retain the existing preview. Iframes include title, fullscreen, a restricted allow list and referrer policy. No YouTube OAuth/API or channel statistics integration was added.

## Live verification

`prisma/verify-admin-flow.ts --allow-fixtures` exercised the running production server on localhost:3100 with real seeded ADMIN/STUDENT sessions and Neon. This was HTTP/Server Action verification, not a browser click or actual playback test.

- All existing admin routes returned 200 for ADMIN, including the real course edit page. New lesson edit, quiz edit and student detail routes returned 200.
- STUDENT direct calls to course/lesson/quiz/badge mutations were redirected before writes.
- Student dashboard, courses/detail, quiz, roadmap, achievements and profile still rendered successfully.
- Three accessible lesson routes (`how-youtube-works`, `creator-mindset`, `thumbnail-psychology`) rendered an iframe with the supplied canonical embed URL.
- Created an isolated test course; rejected duplicate slug; published it and verified student access; unpublished it and verified student invisibility.
- Created/renamed a module; created/edited a lesson under the same ID, including an independently assigned MP4 URL; rejected an invalid module and deletion of the occupied module.
- Created/edited an isolated quiz; rejected zero-correct-option questions, structural editing of the seeded attempted quiz, and deletion of the seeded quiz/course.
- Created/edited a badge; rejected deletion of the already-earned Creator Starter badge.
- Added all three roadmap node types, moved a node up/down, verified exact order/unique positions, then removed only fixture nodes.
- Deleted only the isolated fixture lesson, quiz, empty module, empty course and unearned badge via the normal safe mutations. No test content remains. Before/after comparisons showed identical LessonProgress, QuizAttempt, QuizAnswer, Enrollment and UserBadge records.
- Final DB verification: 18 lessons, 18 with the supplied YouTube URL. Native MP4 rendering and canonical YouTube iframe generation are additionally tested using React server-rendered markup.

The opt-in fixture script creates and removes isolated management records; never run it on production. It does not reset the DB or delete real history. It reads the current build's action manifest and requires a matching running build on port 3100 with its local auth origin configured. The video update script is separate: without `--apply` it only reads counts; do not repeat `--apply` after assigning custom lesson videos unless intentionally overwriting them.

## Files and remaining limits

New files: `src/actions/admin.ts`, `src/services/admin.ts`, `src/services/admin-queries.ts`, `src/lib/admin-validation.ts`, `src/lib/video.ts`, `src/types/admin.ts`; shared AdminEditor/CourseModuleFields/ModulesManagement components; lesson/quiz edit and student detail routes; video-default/update-lesson-videos/verify-admin-flow scripts; admin action/service, video-parser and player tests.

Updated: existing admin pages/components and mock-data file (now only static navigation/actions), LessonPlayer, seed video create defaults, student quiz lock/publication check, earned inactive badge queries, related tests, README, database/status documentation. No unrelated landing, auth or student CSS changes.

Remaining limits: no browser automation or actual YouTube playback check; embedding can depend on video-owner restrictions/browser policy/network. Admin lists load the MVP dataset without pagination. Course/module numeric ordering conflicts must be resolved explicitly. No uploads, bulk edits, audit subsystem, quiz versioning, automatic roadmap insertion, notifications, user-role editing or concurrent-load/fault-injection suite. New published lessons/quizzes must be added to their course roadmap to become accessible. SSL-mode and pg future-version warnings remain separate from successful current operations.

## Final checks

All 124 tests across 11 files passed, including existing student tests, Admin authorization/CRUD/history/order cases, URL parsing and native-video/iframe rendering. Prisma format/validate/generate, TypeScript, lint (no warnings), production build and git diff whitespace checks passed. No schema migration was needed.

## Exact change inventory

Modified files:

- `README.md`
- `docs/DATABASE.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `prisma/seed.ts`
- `src/actions/learning.ts`
- `src/app/admin/badges/page.tsx`
- `src/app/admin/courses/[courseId]/edit/page.tsx`
- `src/app/admin/courses/page.tsx`
- `src/app/admin/lessons/new/page.tsx`
- `src/app/admin/lessons/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/quizzes/new/page.tsx`
- `src/app/admin/quizzes/page.tsx`
- `src/app/admin/roadmap/page.tsx`
- `src/app/admin/students/page.tsx`
- `src/components/admin/AdminFilters.tsx`
- `src/components/admin/AdminStats.tsx`
- `src/components/admin/BadgesManagement.tsx`
- `src/components/admin/CourseForm.tsx`
- `src/components/admin/CoursesManagement.tsx`
- `src/components/admin/LessonForm.tsx`
- `src/components/admin/LessonsManagement.tsx`
- `src/components/admin/QuizForm.tsx`
- `src/components/admin/QuizzesManagement.tsx`
- `src/components/admin/RecentActivity.tsx`
- `src/components/admin/RecentCourses.tsx`
- `src/components/admin/RoadmapManagement.tsx`
- `src/components/admin/StudentsManagement.tsx`
- `src/components/admin/TopCourses.tsx`
- `src/components/learn/LessonPlayer.tsx`
- `src/data/admin-data.ts`
- `src/services/learning.ts`
- `tests/learning-service.test.ts`
- `tests/quiz-action.test.ts`

New files:

- `docs/ADMIN_CRUD_VERIFICATION.md`
- `prisma/update-lesson-videos.ts`
- `prisma/verify-admin-flow.ts`
- `prisma/video-default.ts`
- `src/actions/admin.ts`
- `src/app/admin/lessons/[lessonId]/edit/page.tsx`
- `src/app/admin/quizzes/[quizId]/edit/page.tsx`
- `src/app/admin/students/[userId]/page.tsx`
- `src/components/admin/AdminEditor.tsx`
- `src/components/admin/CourseModuleFields.tsx`
- `src/components/admin/ModulesManagement.tsx`
- `src/lib/admin-validation.ts`
- `src/lib/video.ts`
- `src/services/admin-queries.ts`
- `src/services/admin.ts`
- `src/types/admin.ts`
- `tests/admin-actions.test.ts`
- `tests/admin-service.test.ts`
- `tests/lesson-player.test.ts`
- `tests/video.test.ts`
