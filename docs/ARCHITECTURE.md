# University MVP architecture

Browser -> Next.js App Router -> Better Auth / authorization -> validated Server Actions -> server-only services -> Prisma 7.10 (PostgreSQL adapter, relation joins) -> Neon PostgreSQL.

## Boundaries and authorization

Server Components fetch real database data. Client Components own forms, filters, quiz navigation and interactions; no runtime mock fallback replaces database failures. Plain CSS/Tailwind and the existing dark/red design remain.

Better Auth verifies credentials and loads DB sessions/current users together. Cookie caching and secondary session storage are not enabled. Registration forces STUDENT and disallows role input. Every Admin action independently calls requireAdmin. Student ownership comes from the session. Safe projections omit hashes/accounts/tokens.

Pre-submit quiz payloads omit correctness/explanations. The server validates membership, calculates scores and atomically stores attempts/answers. Idempotency prevents duplicate submissions; retries preserve history. Results require completed-attempt ownership. Answer Review uses Question.order ASC.

## Learning and progress

Enrollment -> LessonProgress -> QuizAttempt -> linear roadmap unlock -> badge evaluation -> current course completion.

The shared learningProgress helper counts completed PUBLISHED lessons plus distinct passed PUBLISHED quizzes, divided by all required published units. Three completed lessons and a pending quiz give 75%; passing gives 100%. Incomplete percentages are capped at 99; empty courses are 0% and incomplete. Dashboard, Course Detail/cards, Profile, Roadmap and Admin student progress use this model. Explicit lesson counters still count lessons; aggregate counters are labeled learning units.

Only PUBLISHED courses/content appear to students. Derived course state filters modules with neither a published lesson nor a published quiz, preserving stored order/numbers. Quiz-only modules remain visible. Admin manages draft/empty modules. All published content counts as requirements even if not configured in the roadmap; Admin must add nodes before students can access it.

The roadmap follows stored linear order, visually zig-zag. Locked/unconfigured content fails closed. Reward nodes never deadlock learning. Earlier passes remain valid after failed retries. Seed checkpoints require >=80%; Admin can configure thresholds before attempts. Streaks use distinct UTC activity days.

## Completion and badge reconciliation

Enrollment.completedAt reflects current requirements, not a permanent certificate. Set missing dates on completion, retain valid dates, clear stale dates after new requirements. Draft additions leave requirements unchanged; published additions change them. Removing requirements can restore completion. Publication changes never erase history.

Student lesson/quiz actions reuse loaded snapshots after writes for badges/completion. Admin curriculum edits reconcile affected enrollments in the same transaction: batched progress/attempt reads, at most two grouped completion updateMany calls, then two joined reads for learners/active badges and a batch insert of new awards with skipDuplicates. No per-user query loop is introduced.

Active badge creation, activation or eligibility-condition changes reconcile relevant existing learners for that badge ID. Name/icon-only edits and deactivation skip whole-cohort evaluation. Awards are monotonic: requirements never revoke earned badges, including inactive earned badges.

Student writes lock the user then enrolled courses in ID order. Curriculum edits lock the affected Course, then an existing Quiz where necessary. Transaction failures roll back edits/reconciliation. Direct SQL/seed writes bypass these service invariants and require explicitly authorized repair if needed.

## Admin and history

Admin UI -> requireAdmin -> Zod-validated action -> service/transaction -> PostgreSQL.

Admin lists/selectors use current DB entities and stable IDs. Titles are display/search text, not unique filter values. Impossible selections explain prerequisites and prevent submission. Shared pending guards/toasts report mutations; action revalidation refreshes data without duplicate router.refresh.

Existing lesson/module/quiz parents cannot be moved. Attempted quiz questions/options/pass thresholds are protected. History-bearing deletion is restricted; Draft/Inactive is the alternative. Roadmap titles may be edited; destructive retarget/removal is restricted where history depends on the path. Branching/versioning is future work.

## Images and videos

File picker -> original validation -> browser resize/compression -> server decode/validate/re-encode with Sharp -> DB-backed compressed WebP data URL/text in User.avatarUrl or Course/Lesson.thumbnailUrl.

Original JPEG/PNG/WebP input is limited to 5 MB. Browser output has maximum 512px dimensions and 280,000 data-URL characters. Server checks real bytes/format/dimensions, rejects invalid/animated input, and re-encodes WebP. This image processing is implemented; external object storage and persistent filesystem uploads are not. S3/R2/Blob-style storage is the future production recommendation.

DatabaseImage validates data URLs, local /images/ paths and credential-free HTTPS URLs with fallback assets. Local sources use Next/Image optimization; remote/data sources bypass it. Learning graphs, Admin catalog/lesson/roadmap selectors and student projections avoid unneeded image blobs. The lesson player loads only its current thumbnail. CSS backgrounds retain optimized WebP; referenced originals remain for documented reproduction/fallbacks.

Lesson.videoUrl supports HTTPS YouTube embeds and native HTTPS/local MP4/WebM/OGV/OGG/M4V. Remote HTTP/disguised relative URLs are rejected; invalid sources use an unavailable preview without fake controls. Temporary video defaults live in DB/seed configuration, not React. Embedded playback is separate from optional account connection.

## Google and optional YouTube

Both private Google credentials enable the Better Auth provider. Sign-in uses identity scopes only, safe internal completion redirects and forced STUDENT creation. Explicit authenticated linking is supported; implicit email merging is disabled. OAuth does not overwrite intentionally edited local profile fields or existing roles.

Profile linkSocial separately requests youtube.readonly, offline access and consent. Better Auth owns state/PKCE and encrypted Account tokens. An HttpOnly 10-minute callback cookie identifies the exact local Account record; completion, choice and refresh revalidate current-session ownership/provider/scope server-side. Provider token HTTP endpoints are blocked; internal getAccessToken handles refresh. No tokens or sensitive Account records are returned to client/Admin projections.

The server-only YouTube service calls authenticated channels.list(mine=true) with snippet/statistics, no-store and a 10-second timeout. It validates bounded response data, persists one channel per user, requires a choice for multiple results and creates no invented channel on errors. Network I/O occurs outside the user-locked metadata transaction. Normal Profile reads stored metadata only. Invalid authorization is no longer advertised as connected. Refresh does not resurrect a concurrently removed connection. Local removal deletes only owned channel metadata and does not revoke/unlink login methods.

The additive channel migration adds provider-account provenance, thumbnail, custom handle and hidden-subscriber state; legacy token fields are retained but never written by the integration. No Analytics/write scopes, imports or API key. See GOOGLE_YOUTUBE_SETUP.md and MANUAL_GOOGLE_YOUTUBE_SMOKE_TEST.md. External OAuth and responsive browser checks remain manual. Unfinished product controls are hidden; functional navigation and legitimate pending/locked controls remain.

## Security, performance and evidence

Response headers: nosniff, strict-origin-when-cross-origin, disabled camera/microphone/geolocation, SAMEORIGIN framing. Outbound YouTube/fullscreen is not disabled. Strict CSP is deferred until compatibility with Next/Auth, embeds and data images is verified.

Relation joins, request-scoped auth reuse, action snapshots, batched reconciliation and WebP remain. PROFILE_PERFORMANCE=1 logs timing/counts without SQL/parameters/identities; default runs do not emit profiler logs. Historical benchmark results are dated evidence, not a current speed guarantee.

See FINAL_CODE_AUDIT.md. Vitest covers rules/actions/security/regressions; an isolated opt-in PostgreSQL script verifies actual relation ordering/reconciliation. Unit tests mock DB I/O where stated. Build/HTTP checks do not prove hydrated browser behavior, focus/mobile geometry or real third-party playback; manual smoke checks remain.

No deployment/environment/credential changes are part of this pass. YouTube Analytics/write access/video import, branching/versioning, object storage, payments/community/AI/certificates, password recovery/email delivery and commercial scaling remain future scope.
