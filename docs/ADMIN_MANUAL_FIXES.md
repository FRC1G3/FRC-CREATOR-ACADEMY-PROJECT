# Admin manual-testing fixes

Scope: reported Admin sidebar, badges, course and lesson management issues only.

## Causes and behavior

- Badge cards hardcoded Trophy rather than rendering the stored icon. Each card now resolves its own icon, including older capitalized values. Updates already targeted the correct badge ID; regression checks cover independent rendering and DB updates.
- New lessons defaulted to order 1, conflicting with the unique module/order constraint. This failure was reproduced against Neon. Blank order now selects the next position under the existing course transaction lock. An empty module dropdown now prevents submission. Historical manual attempts cannot be reconstructed without their logs; no draft-excluding list query or incorrect relation was found.
- The Lessons course filter was derived from existing lesson rows, hiding empty courses. It now uses the complete course catalog, as does the create form.
- RoadmapNode's restrictive relation blocked deletion even without learners. Structural nodes may now be removed transactionally only when that course has no enrollments, lesson progress or quiz attempts. Any progress on the lesson blocks deletion. History is never cascade-deleted by these actions.
- Course/Lesson saves show named success feedback and return to their lists. Errors retain form values. Lesson forms have Back to Lessons.
- Course/Lesson rows expose Publish/Unpublish and confirmed Delete. Blocked deletes use the existing toast instead of stretching table rows. Publishing a lesson requires a valid video source.
- Course and Lesson thumbnails use a preview/file picker, reusing avatar validation, resize/compression and server normalization. Images are stored as bounded DB data URLs; existing local/HTTPS images still render. No runtime public-directory writes.
- Sidebar logo links home; direct logout reuses existing session logic, pending state and toast, closes the sidebar and clears its identity display.
- Shared Admin search focus remains visible without a duplicate inner outline. Lesson search, course, module, status and sorting compose together.

## Changed files

- `src/actions/admin.ts`
- `src/app/admin/lessons/page.tsx`
- `src/components/admin/`: AdminEditor, AdminSidebar, AdminBadgeIcon (new), AdminImageField (new), BadgesManagement, CourseForm, CourseModuleFields, CoursesManagement, LessonForm, LessonsManagement
- `src/lib/admin-validation.ts`, `src/lib/admin-lesson-filters.ts` (new)
- `src/services/admin.ts`, `src/services/admin-queries.ts`
- `src/styles/admin/admin.css`
- `tests/admin-actions.test.ts`, `tests/admin-fields.test.ts`, `tests/admin-service.test.ts`, `tests/admin-lesson-filters.test.ts` (new)
- `scripts/verify-admin-fixes.ts` (new)
- This report.

## Verification

- Prisma validate and generate: passed; no schema migration/reset.
- TypeScript and ESLint: passed.
- Vitest: 223 tests across 23 files passed.
- Production build: passed with network access for the existing Google Fonts dependencies.
- Real Neon + authenticated production HTTP: course/image persistence; empty-course dropdown/filter visibility; lesson insert/relation/automatic order; reproduced duplicate-order rejection; list visibility on repeated requests; combined filters and both alphabetical sorts; edit persistence; course/lesson publish/unpublish; safe structural deletion; protected progress; independent badge updates. All run-owned fixtures were removed.
- HTTP/rendering and automated checks do not replace a visual browser check of focus, file selection and toast placement; no browser visual pass was performed.

To repeat the opt-in integration check against a running local server, set `RUN_ADMIN_FIX_CHECK=1` and optionally `ADMIN_CHECK_ORIGIN`, then run `node --conditions=react-server --import tsx scripts/verify-admin-fixes.ts`. It creates an isolated temporary Admin account and content and removes only its own records in finally.

No Student feature implementation, deployment or broader Admin audit was performed.
