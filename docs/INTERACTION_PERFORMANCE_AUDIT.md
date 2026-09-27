# P0 interaction and performance audit — 2026-09-27

## Verification labels

WORKING means the source has a real handler, native interaction or valid navigation; the Verification column says what was actually exercised. INTENTIONALLY DISABLED means out-of-scope/unavailable UI is visibly faded and non-operational. BROKEN and MISLEADING STATIC UI are before-state findings, not claimed final functionality.

No browser automation tool was available. No hydrated clicks, visual overlay geometry, keyboard traversal or real video playback are claimed as browser-verified. Unit/SSR tests and production HTTP/Server Action checks are the evidence here. Follow [MANUAL_SMOKE_TEST.md](MANUAL_SMOKE_TEST.md) for exact remaining clicks.

## Full visible-control inventory

| Control / page | Before | After | Verification |
| --- | --- | --- | --- |
| All public/student pages: logo, navbar Login/Profile/Get Started | WORKING links | WORKING; session reads no longer block root shell | Source, public/student HTTP |
| Main hamburger/menu close/Escape/route links/logout | WORKING state, inert closed panel, automatic close | WORKING; preserved | Source; login/logout HTTP; clicks manual |
| `/`: Start Learning CTAs and scroll dots | WORKING links/scroll handler | WORKING; preserved | Source, landing HTTP; scrolling manual |
| Sidebar future entries; footer socials/legal/company/newsletter | INTENTIONALLY DISABLED but insufficient visual distinction | Clearly faded/disabled, unavailable titles; newsletter explains demo limitation | Source/CSS; visual check manual |
| `/login`, `/register`: fields, submit, password visibility, remember checkbox, mode links | WORKING | WORKING; shared animated form retained, isolated Suspense boundary | Auth tests/HTTP; animation and toggles manual |
| Auth Google/Forgot password | INTENTIONALLY DISABLED but active-looking | Faded, unavailable tooltip | Source/CSS |
| `/courses`: search and All/Beginner/Intermediate/Advanced | Already WORKING from previous stabilization (request's readOnly observation was stale) | WORKING, combined search/levels/empty state preserved | 7 filter tests, HTTP enabled-input markup |
| `/courses`: View Course/card CTA | WORKING | WORKING; thumbnails now lazy | Source/HTTP |
| `/courses/[course]`: module header/chevrons | MISLEADING STATIC UI, permanently expanded | Real controlled accordion, native button keyboard behavior, aria-expanded/controls | Toggle logic + SSR tests, HTTP markup; clicks manual |
| Course Detail: Expand All | MISLEADING STATIC UI | Coordinated Expand All/Collapse All with individual module state | Unit tests + HTTP markup |
| Course Detail: enrollment/continue/roadmap and lesson links | WORKING; locked rows have no link | WORKING; access logic unchanged | Existing action/security tests, route HTTP |
| Course Detail: Your Progress chevron | MISLEADING STATIC UI | Removed navigation cue; informational progress remains | Source |
| Course Detail bookmark | INTENTIONALLY DISABLED | Visibly faded with unavailable title | Source/CSS |
| `/dashboard`: View Course, Continue, Next, Roadmap, Achievements, latest quiz | WORKING links | WORKING; preserved | Source, HTTP |
| Dashboard bookmark | INTENTIONALLY DISABLED | Faded/unavailable | Source/CSS |
| `/roadmap`: course title and accessible node title | WORKING links | WORKING | Source/HTTP |
| Roadmap circular play/check/reward node | MISLEADING STATIC UI; title alone clickable | Accessible circle also links to the same target; locked circle remains a labeled lock | Source/HTTP; clicks manual |
| `/learn/[lesson]`: active/collapsed module headers | MISLEADING STATIC UI, chevrons without handlers | Native details/summary disclosures for every module; current module initially open | SSR tests/HTTP markup; native clicks manual |
| Lesson player, previous/next, Mark as Complete, checkpoint links | WORKING (or prerequisite-disabled) | WORKING; unchanged scoring/access; pending and unavailable states retained | Existing tests + HTTP iframe; real playback manual |
| Lesson Download Notes and unavailable player preview controls | INTENTIONALLY DISABLED | Clearly faded/unavailable | Source/CSS |
| `/quizzes/[quiz]`: answers, Previous, Next, Submit | WORKING with pending state | WORKING plus synchronous submission guard; errors shown | Quiz action tests; questionnaire source; browser/mobile clicks manual |
| `/quizzes/[quiz]/result`: review anchor, review lessons, retry, continue | WORKING links | WORKING; static recommendation chevron removed | Result HTTP + source |
| `/achievements`: next milestone chevron | MISLEADING STATIC UI | Removed cue; milestone/badges remain informational | Source/HTTP |
| `/profile`: Edit/Close/Save | WORKING, but uncontrolled fields could reset on action errors | Controlled draft retained; errors/success/pending visible; real persistence retained | Profile validation and same-value save through HTTP/DB, source |
| Profile Share/photo upload/Manage YouTube/View All Activity | INTENTIONALLY DISABLED but active-looking | Faded/unavailable titles | Source/CSS |
| `/admin`: sidebar open/close/Escape/focus trap/backdrop/active links | WORKING | WORKING; auth/focus behavior preserved | Source and all admin route HTTP; focus clicks manual |
| Admin header search, Quick Actions, recent Edit/View All, top courses View All | WORKING | WORKING; search aria-label now accurately says courses | Source/HTTP |
| Admin notification icon | INTENTIONALLY DISABLED | Visibly faded | Source/CSS |
| `/admin/courses`: search, status tabs, New, Edit, Delete | WORKING | WORKING; pending/error/confirmation retained | CRUD HTTP + source |
| `/admin/courses/new`, `[course]/edit`: inputs, level/status selects, Save/Cancel | WORKING | WORKING; synchronous double-save guard, server-rendered outer form | CRUD HTTP + source; native selects manual |
| Course Edit: module create/edit/order/delete | WORKING | WORKING; outer wrapper server-rendered | CRUD HTTP + source |
| `/admin/lessons`: search/course/module filters/New/Edit/Delete | BROKEN combination: old module selection survived course change | Course change resets module filter; other actions WORKING | Source; CRUD HTTP; filter click manual |
| `/admin/lessons/new`, `[lesson]/edit`: course/module/status/video/save | Parent edit selects looked changeable although server forbids reparenting | Edit parents visibly disabled with hidden submitted IDs; new selects work; empty prerequisites explained | SSR hidden-field tests, CRUD HTTP |
| `/admin/quizzes`: search/course filter/New/Edit/Delete | WORKING | WORKING | Source/CRUD HTTP |
| `/admin/quizzes/new`, `[quiz]/edit`: fields/selects/Add/Remove/correct answer/Save | WORKING; attempted-question fieldset intentionally locked | WORKING; protected parent selectors clarified; attempted content still locked with explanation | Source/CRUD HTTP; selects/add/remove manual |
| `/admin/roadmap`: course/type/target selects/Add/Move/Remove | WORKING with server error feedback | WORKING; no dropdown library added | Source/CRUD HTTP; selects manual |
| `/admin/badges`: New/Edit dialog, selects, X/Escape, Save/Delete | WORKING native dialog and selectors | WORKING; pending/error retained | Source/CRUD HTTP; modal clicks manual |
| `/admin/students`: search/course/status filters/View | WORKING | WORKING | Source/HTTP |
| `/admin/students/[student]`: Back to Students | WORKING | WORKING; safe information/empty states retained | Source/HTTP |
| Global error boundary Retry | WORKING reset handler | WORKING | Source |

Intentionally disabled future controls: Google sign-in, password recovery, sidebar Progress/Community/Creator Tools/Notes/Bookmarks/Settings/Library, course/lesson bookmarks, Download Notes, photo upload, Share Profile, extended activity list, YouTube connection management, notifications, footer social/company/legal/marketing links and newsletter signup. Disabled player-preview controls are unavailable because there is no valid video. Quiz Previous/Next/Submit and protected Admin fields are state/permission-disabled, not future features.

No href="#" placeholders, empty click handlers or fake ellipsis action menus were found in runtime source. Decorative landing statistics and dashboard progress diagrams remain non-interactive informational/marketing content, with explicit navigation links where relevant.

## Overlay/client boundary audit

- Closed sidebars are translated offscreen and inert; Admin backdrop is mounted only while open. Root navbar is hidden on Admin/auth pages by existing CSS. No static evidence of a permanently mounted invisible backdrop covering selects was found.
- Badge dialog uses showModal/native top-layer behavior and a proper backdrop. Attempted-quiz disabled fieldsets are deliberate, with a visible protection explanation. Empty/fixed parent selectors are now explained/disabled rather than deceptively editable.
- Admin decorative header and quiz confetti already use pointer-events:none. No blanket pointer-events change was made. Browser hit-testing/stacking still requires the manual smoke test.
- CourseCurriculum is the small new stateful client boundary; Course Detail remains server-fetched. Lesson module disclosures use native HTML with no new client JS.
- Removed unnecessary client directives from CourseForm, LessonForm and ModulesManagement; their interactive AdminEditor/select children stay client-side. Remaining client components own real state/effects/events, forms or error handling.
- Profile keeps controlled input values across action errors. Quiz/admin submissions have immediate ref guards in addition to visible pending state.

## Confirmed performance findings and changes

### Assets (measured file sizes)

Nine CSS backgrounds bypassed Next/Image and totaled **11,038,222 bytes**. Same-dimension WebP quality 85 variants total **380,496 bytes**, a **96.55% reduction (10,657,726 bytes)**. All 16 CSS background references resolve to existing files. Every new asset returned HTTP 200 with the expected byte size. Hero/auth converted images were visually inspected as standalone assets, not as rendered pages.

| Asset | Before bytes | After bytes |
| --- | ---: | ---: |
| hero | 1,428,183 | 68,882 |
| auth/auth-background | 1,612,640 | 70,076 |
| dashboard/dashboardbottom | 1,602,220 | 59,520 |
| dashboard/dashboard-hero | 376,845 | 27,376 |
| sectionBackgrounds/section2 | 1,344,383 | 30,746 |
| sectionBackgrounds/section3 | 1,294,010 | 60,462 |
| sectionBackgrounds/section4 | 1,230,347 | 24,434 |
| sectionBackgrounds/section5 | 1,242,915 | 27,540 |
| footer-background | 906,679 | 11,460 |

Reproduce with scripts/optimize-backgrounds.mjs using already-installed Sharp; no package was installed. Raw measurements: asset-performance.json. Original PNGs are retained because stored/seed image paths and recovery may still use them; transfer savings concern updated CSS references, not repository disk size. Logos, transparent assets, screenshots and portraits were not lossy-converted.

Other large assets audited: lesson thumbnail 1,702,696 B, dashboard section2 1,394,908 B, frc.PNG avatar 1,282,105 B, logo 448,553 B, skills 400,115 B. These are Next/Image sources rather than CSS backgrounds. Previous stabilization already fixed local unoptimized image misuse: **zero additional unoptimized removals in this pass**. Only valid external HTTPS sources retain unoptimized browser loading. Catalog thumbnails changed eager -> lazy. Landing still keeps its full-screen structure; compressed backgrounds avoid adding risky virtualization/deferred section logic. Actual browser request scheduling was not measured.

### DB/rendering

| Area | Before | After |
| --- | --- | --- |
| Catalog | Auth -> parallel enrollment/progress -> catalog query; nested Course slug projections; repeated array filtering | Catalog starts alongside cached auth/personal queries; courseId-only enrollment and smaller progress projection; sets/count map |
| Catalog query count | 3 application-level Prisma reads for signed-in user | Still 3; less serial waiting and relation payload, no claimed SQL round-trip count |
| Achievements | Full studentOverview: 4 top-level reads plus course graph relations/progress/attempt processing | studentBadges: 1 top-level read; same earned/inactive badge rules |
| Profile | Overview followed by independent stored-channel read | Overview/channel reads in parallel |
| courseState | Course lookup then 4 independent parallel reads | Retained; prerequisite/security dependency and readable shared graph justify this shape at MVP scale |
| Root shell | Awaited current-user lookup before returning shell | AccountNavigation in Suspense; cached session helper shared per request; protected pages still await guards |
| Loading | No route loading boundaries | Lightweight loading UI for dashboard, catalog/detail, lesson, roadmap, profile, achievements, quiz/result and admin |

No security check was removed. No Redis, cross-user auth cache, new DB schema or caching service. Prisma relation includes can issue several SQL statements, so application-level read counts above are **not** claimed network round-trip measurements.

### HTTP timings (measured, limited)

Local production Next server with remote Neon, existing demo student, three sequential full-HTML responses per route before/after. No asset downloads, browser paint, client navigation or controlled cold/warm cache isolation. Raw samples: performance-before.json / performance-after.json; reproduce via prisma/measure-routes.ts. Medians:

| Route | Before ms | After ms |
| --- | ---: | ---: |
| /courses | 1,893 | 1,223 |
| /dashboard | 1,694 | 1,777 |
| /courses/youtube | 2,244 | 1,454 |
| /profile | 1,844 | 1,440 |
| /achievements | 1,562 | 998 |

Dashboard did not improve; its first after sample was 3,317 ms. Course Detail's lower samples do not prove a query optimization (courseState was unchanged). Network/cache variance prevents attributing all differences to code changes. Loading feedback improves perceived responsiveness, but no browser TTFB/LCP/INP claim is made.

### Neon decision

The existing endpoint is direct (not -pooler); credentials/hostname were not printed. PrismaPg already uses a process-shared client and driver-managed pool. Official [Prisma 7 guidance](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) places pool settings in the driver adapter and migration datasource configuration in prisma.config.ts; [Neon](https://neon.com/blog/prisma-dx-improvements) documents its separate pooled endpoint.

No connection URL, SSL setting or migration configuration was changed. No measured evidence establishes that switching endpoint would fix this demo's latency. One Admin verification request encountered a real transient connection-terminated/session-timeout error; this is a remaining reliability concern, not concealed as UI success. Before production/serverless scale, evaluate the official pooled endpoint under representative concurrency and keep migration configuration appropriate to Prisma 7. Do not blindly rewrite a working private connection string.

## Verification status

Full suite: **165 tests passed, 0 failures, 16 files**. Includes 6 new accordion/SSR tests and 2 parent-selector tests; existing search/filter, learning, scoring, completion and authorization tests remain. TypeScript, ESLint, production build and Prisma validate passed. No dependencies or migration changed.

Production HTTP checks passed public/student/admin core routes, guarded redirects (including streamed redirect metadata after adding loading boundaries), correct quiz payload boundaries, accordion/native disclosure markup, result navigation, profile validation and same-value save, and all 9 optimized assets. Actual browser clicks remain explicitly unverified.

The first extended Admin verification stopped on a Neon connection error before creating any fixtures. The retry passed all Admin/student route and mutation-protection checks, course/module/lesson/quiz/badge CRUD, unique ordering and history protection. Temporary fixtures were cleaned up; existing history remained unchanged. All 18 current lessons retained the supplied demonstration video URL. Profile verification saved the existing values. This successful retry does not remove the observed transient database reliability concern.
