# Current implementation status

The university MVP uses real Neon PostgreSQL, Prisma and Better Auth. It is not UI-only. This supersedes stale feature descriptions in older dated reports; no deployment is claimed.

| Area | Implemented behavior |
| --- | --- |
| Auth/roles | Credential and conditional Google identity login, DB sessions, forced STUDENT signup, explicit account linking, current-role ADMIN authorization |
| Public courses | DB catalog/search/levels; published courses/content; empty/draft-only modules hidden |
| Learning | Enrollment, HTTPS YouTube/direct or local video, lesson progress, server quiz grading, preserved attempt/answer history |
| Progress/completion | One lesson-plus-passed-quiz model across Student/Admin; current completion reconciled after curriculum edits |
| Roadmap | DB-backed ordered linear path; locked/current/completed nodes; locked lesson/quiz recovery links |
| Badges | Unique active-condition awards; retained inactive earned history; batched curriculum/condition reconciliation |
| Bookmarks | Owned course/lesson saving/removal and authenticated saved page |
| Profile/images | Profile editing/avatar picker; browser compression, server re-encode, compressed DB-backed image text |
| YouTube channel | Optional incremental readonly linking, validated real metadata/basic statistics, manual refresh/view/local removal; Account token source; no external call on normal Profile render |
| Product polish | Unimplemented navigation/notifications/share/notes/forgot-password/footer/social/newsletter controls hidden; pending/locked controls retained |
| Admin CRUD | Courses/modules/lessons/quizzes/roadmap/badges; current DB selectors, stable IDs, prerequisites and feedback |
| Admin students | Safe list/detail; required-unit progress, published enrolled course filters, historical lesson/quiz/badge views |
| Media safety | Validated data/local/HTTPS images with fallbacks; projected queries; remote HTTP video rejected |
| Performance | Relation joins, request-scoped auth, action snapshots, batched reconciliation, WebP backgrounds, opt-in profiler |
| Headers | nosniff, referrer/permissions policy and SAMEORIGIN framing; strict CSP deferred |

Final validation and isolated PostgreSQL evidence: [FINAL_CODE_AUDIT.md](FINAL_CODE_AUDIT.md). Latest production HTTP performance measurements and deployment verdict: [FINAL_PERFORMANCE_PASS.md](FINAL_PERFORMANCE_PASS.md). README, architecture and database docs describe the same current model. Earlier latency results remain in dated reports; this pass does not claim a new multi-hour benchmark.

Current lessons use the temporary demonstration video unless edited by Admin. This is not a complete original content library. Browser animation/focus/mobile checks and actual third-party playback remain manual. Real Google consent, linking and renewal require private Google Cloud configuration and interactive testing; see GOOGLE_YOUTUBE_SETUP.md and MANUAL_GOOGLE_YOUTUBE_SMOKE_TEST.md. No public OAuth verification or deployment is claimed.

Future: YouTube Analytics/write access/video import, branching/versioned roadmap, external object storage, payments/community/AI/certificates, production password recovery/email delivery and commercial-scale pagination/monitoring. Environment/deployment work is handled separately. The prior performance pass remains closed; no further performance refactor was introduced.

Latest product validation: [FINAL_PRODUCT_POLISH.md](FINAL_PRODUCT_POLISH.md). 339 tests total: 338 passed, 1 existing opt-in skipped, 0 failed. Prisma/TypeScript/lint/build/diff checks passed; additive migration/checksum and isolated metadata DB verification passed. Real Google OAuth and browser geometry remain unverified until the manual smoke test.
