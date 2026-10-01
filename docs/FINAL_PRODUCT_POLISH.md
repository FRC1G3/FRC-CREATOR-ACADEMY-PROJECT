# Final product polish and Google / YouTube pass - 2026-10-01

## A. Inactive UI cleanup

| Location | Hidden/removed inactive product controls |
| --- | --- |
| Student Menu | Standalone Progress, Community, Creator Tools, Notes, Settings, Library; real navigation/Admin entry retained |
| Admin Dashboard | Fake notification bell; actual search/avatar and management links retained |
| ProfileHero / RecentActivity | Share Profile and nonfunctional activity View All; actual editing/badges/roadmap retained |
| LessonHeader / invalid-source LessonPlayer | Download Notes and fake preview play/volume/captions/settings/theater/fullscreen controls; real media controls retained |
| AuthForm | Nonfunctional Forgot password; Google action now functional only when configured |
| Footer | Inactive Features/Pricing/FAQ, About/Blog/Contact, Terms/Privacy/Cookie destinations; YouTube/Instagram/TikTok/X social buttons and newsletter; replaced with real academy navigation in the existing grid |
| CourseCard | Unreachable Coming Soon/lock branch (isActive was always true); published-course navigation retained |
| Landing QuizPreview copy | Removed promises of unimplemented community/exclusive-support access; same markup/styles/CTA now describe real courses/quizzes/roadmap |
| Profile YouTube | Fake Manage Connection, hardcoded F.R.C channel photo and mock/unproven connection presentation replaced by owned stored channel data |

Global runtime audit found no dead href="#", Coming Soon, unfinished demo controls, TODO/FIXME or ordinary console.log. The existing opt-in performance logger remains intentionally. CSS selectors for older unrendered controls remain harmless; real pending/invalid/locked controls and internal answer-review anchors remain. Static marketing visuals are not used as DB-backed user data.

## B. Google authentication

Better Auth 1.7.6 provider is enabled only with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Only names were added to .env.example; actual .env values/credentials were not changed. Password flows remain. Existing split-screen layout, animation and content swap remain. Pending/ref guards avoid duplicate Google requests; pageshow resets pending after browser Back. Safe completion/error routes preserve an internal destination and Admin landing, without raw provider errors.

New users are forced to STUDENT by the existing extended hook. Client role input is disabled. Explicit authenticated Google linking is enabled, implicit email-based merging is disabled, existing roles are protected and edited local profile fields are not overwritten on sign-in/linking. Google linking cannot take over another user's existing provider identity.

## C. Optional YouTube flow

Profile -> linkSocial Google readonly/offline consent -> Better Auth /api/auth/callback/google -> HttpOnly exact-local-account selector -> session-protected /profile/youtube/complete -> ownership/provider/scope check -> server getAccessToken using local Account.id -> fixed authenticated channels.list(mine=true, part=snippet,statistics) -> validated unique metadata upsert -> Profile. More than one returned channel requires an actual choice; server re-fetches/revalidates membership. Successful callback reload is harmless.

Normal Profile reads only PostgreSQL. External fetch occurs only on explicit connection completion/selection and manual refresh. Invalid/missing/revoked grant, no channel, malformed response, network and quota/API failures return safe feedback without invented data. Refresh cannot resurrect a removed connection; older failed refresh cannot invalidate newer metadata. User locks guard metadata writes, while network calls stay outside transactions.

## D. OAuth scopes

- Sign-in: openid, email, profile; online, no forced consent, no YouTube request.
- Connection: those identity scopes plus https://www.googleapis.com/auth/youtube.readonly; call-specific offline/consent/account selection.
- No upload/edit/delete, Analytics, Gmail, Drive, Calendar or other new write permission.

## E. Database

Reused YouTubeConnection. Migration 20261001000100_youtube_channel_metadata adds only nullable googleAccountId (Account FK, SET NULL), nullable thumbnailUrl, nullable customUrl, hiddenSubscriberCount boolean default false. Existing userId uniqueness/channelId/channelTitle, subscriberCount/videoCount/viewCount BigInts, createdAt/lastSyncedAt/updatedAt remain. Metadata sync updates the validated fields and lastSyncedAt, preserving connected date unless the channel/provider account changes.

OAuth tokens/expiry/scope live in Better Auth Account; encryption enabled. Legacy YouTubeConnection token columns remain untouched and are never written by this integration. No db push/reset/history rewrite.

Migration was applied to the configured development Neon database. A final read of _prisma_migrations confirmed the file checksum matches, no pending local migration and no failed migration. Intermittent CLI P1001 required a longer connection timeout in one subprocess; the persisted environment was unchanged.

The opt-in verify-youtube-metadata.ts script passed on real PostgreSQL: additive fields, counts above Number's safe integer range, unique upsert, public projection, hidden subscribers, owned removal and retained user/credential/Google Account records. Only its isolated fixtures were removed and cleanup was verified. No Google API was contacted by that check.

## F. Security

Sessions authorize all mutations/callbacks; no client userId authority. Local account ID is ownership-checked before token retrieval and again before persistence. Only metadata reaches client props, with decimal-string counts and ISO dates. Browser access-token/refresh-token endpoints are blocked, internal Better Auth methods remain. Provider errors/logging are sanitized; no OAuth secret/token is printed. Removal confirmation accurately describes local-only behavior; it does not unlink login methods/revoke Google consent/delete a user or learning history.

## G. Profile UI

Configured/disconnected: Not Connected and Connect YouTube. Unconfigured: unavailable controls hidden. Connected: real title/photo/handle, channel URL, counts/hidden state, connected and last-synced dates; manual Refresh, View on YouTube, confirmed Remove Connection. No fake zero for hidden/missing subscribers. Focus/status/pending feedback and minimal wrapping CSS reuse the current design. Desktop/tablet/mobile CSS rules were inspected; hydrated geometry/focus/interaction has not been browser-verified in this session.

## H. Automated tests

339 total; 338 passed; 1 existing opt-in performance test skipped; 0 failed. 72 new tests in google-auth.test.ts, youtube.test.ts, youtube-actions.test.ts and product-polish.test.ts cover provider availability/scopes, STUDENT creation/role-preserving link policy, safe callbacks, exact account/token ownership, validation/errors, manual refresh/idempotency, multiple-channel membership, safe projections/hidden counts/removal, protected HTTP endpoints and rendered inactive/real UI. All external provider/API behavior is mocked. Existing learning/Admin/performance regressions remain green.

## I. Final validation

Prisma format/validate/generate, TypeScript, lint, Vitest, production build and git diff --check pass on the final tree. Build used network permission for existing next/font downloads. No dependencies, environment files, deployment or previous performance architecture were changed. Existing unrelated dirty work was preserved.

## J. Manual Google Cloud setup

Project, consent/audience/test users, enabled YouTube Data API v3, OAuth Web client, exact local/production callback URIs and readonly scope. See GOOGLE_YOUTUBE_SETUP.md for private environment configuration and restart instructions.

## K. Manual OAuth test still required

Real Google sign-in/linking, actual consent/channel selection, offline token renewal/revocation and browser responsive/keyboard interaction were not verified interactively. The browser execution tool was unavailable. Mocked tests/build/DB metadata checks do not establish those outcomes. Follow MANUAL_GOOGLE_YOUTUBE_SMOKE_TEST.md. No public OAuth verification or deployment is claimed.

## L. Verdict

READY FOR GOOGLE CONFIGURATION. Stop after this pass; no further feature, performance refactor or deployment is included.
