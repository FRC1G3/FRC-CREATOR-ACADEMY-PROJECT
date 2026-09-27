# University MVP architecture

Browser -> Next.js App Router -> Better Auth / authorization -> Server Actions and services -> Prisma 7.10.0 -> Neon PostgreSQL.

## Boundaries

- Server Components fetch database data. Client Components handle forms, quiz navigation, catalog filtering and existing UI interactions. No runtime mock fallback replaces failed database reads.
- Better Auth owns credential verification and database sessions. Public registration forces STUDENT. The request-scoped current-user helper selects safe display fields and reloads the database role. AdminLayout passes only name, avatarUrl and role to its sidebar.
- Every Admin mutation calls requireAdmin before validation or database work. Server Actions validate with Zod and call server-only services inside Prisma transactions. Admin CRUD is database-backed for courses, modules, lessons, quizzes, roadmap nodes and badges. Student list/detail projections exclude credentials and sessions.
- Student actions derive userId from the session. Quiz pages select only public question/option fields; correctness and explanations are absent before submission. The server validates question/option membership and computes scores. Results require attempt ownership. Idempotency keys prevent duplicate submissions; fresh retry attempts preserve history.

## Student flow

Enrollment -> LessonProgress -> QuizAttempt -> linear roadmap unlock -> badge evaluation -> current course completion.

Progress percentage counts completed published lessons. Course/module completion additionally requires every applicable published quiz to have a completed passing attempt. Seed checkpoints require >=80%; admins may configure the threshold before any attempts. An earlier pass remains valid after a failed retry. Empty courses are not complete. Reward nodes do not block learning. Lessons/quizzes missing from the configured path fail closed; admins must add their roadmap nodes.

The roadmap is linear in this university MVP. Branching is future work, not implemented behavior. Streaks use distinct UTC activity days; awards are unique per user/badge. Deactivating a badge prevents new awards while preserving previously earned badges.

## Current completion policy

Enrollment.completedAt represents current published curriculum requirements, not an immutable certificate. The shared deriveCourseState rule feeds syncEnrollmentCompletion: set a missing date when complete, retain an existing valid date, clear a stale date when incomplete. Removing requirements can restore completion. Course visibility itself does not erase learning history.

Student completion/quiz submissions synchronize enrolled published courses after progress writes. Enrollment synchronizes its own course. Admin course/module/lesson/quiz saves and deletes reconcile the affected course in the same transaction, including Draft/Published changes. Draft additions leave valid dates unchanged. Reconciliation only writes Enrollment.completedAt; LessonProgress, QuizAttempt, QuizAnswer and UserBadge are untouched.

Student writes lock the user then enrolled Course rows in ID order. Curriculum edits lock the affected Course before mutation/reconciliation, then an existing Quiz when required. This serializes concurrent learning and curriculum changes. Reconciliation batches progress/attempt reads then iterates enrollments; appropriate for university scale, not a large-scale background processing system. Transaction failure rolls back both edit and reconciliation. Direct SQL/seed changes bypass actions; the opt-in reconciliation command can repair historical completion dates.

## Images and video

DatabaseImage validates a local /images/ path or credential-free HTTPS URL. Local assets retain Next/Image optimization. Remote sources use unoptimized Next/Image, so only the browser fetches them; no wildcard optimizer hosts are configured. Empty/invalid sources and failed image loads use local fallback assets. Admin/profile validation shares the source policy. Browser requests omit the referrer; external availability remains controlled by the image host. No uploads are implemented.

Lesson.videoUrl -> LessonPlayer -> recognized YouTube iframe or native direct video. Empty/invalid sources show the safe preview. The temporary video is stored in lesson rows and seed defaults, never hardcoded into React. Embedded lesson videos are implemented; YouTube OAuth, Data API and channel analytics sync are not.

## Verification and scope

Vitest exercises rules, actions, authorization, reconciliation, images and filters. TypeScript, ESLint, Prisma validation/generation and production builds are checked separately. HTTP verification exercises the running app; it does not establish browser hydration, keyboard behavior or actual third-party video playback. See UNIVERSITY_STABILIZATION.md for this pass's results.

Production email/password recovery, deployment hardening, large-scale pagination, course versioning, branching, YouTube account integration, community, payments, AI and certificates remain future work.
