# University demo — manual interaction smoke test

Browser automation was not available in the audit session. These clicks are **not** claimed as browser-verified. Use a production build (`npm run build`, `npm run start`), your seeded student/admin credentials from the local environment, a desktop browser, then repeat key checks at about 390px width. Do not reset the database.

## Public navigation and authentication

1. Open `/`. Open the hamburger menu; Tab through its links; press Escape. Reopen, click Courses, and confirm the menu closes and `/courses` loads.
2. Click the logo to return home. Click each left scroll-indicator dot; confirm the corresponding visible landing section is reached and the number changes. Scroll normally and repeat on desktop. Mobile may hide this indicator.
3. Click Start Learning/Get Started. Confirm course navigation. Future sidebar/footer items and social icons must appear faded and have no enabled hover treatment. Newsletter text explains unavailability.
4. Open `/login`; click Show/Hide password. Toggle Keep me signed in. Submit invalid credentials and confirm an error. Google/Forgot password are visibly disabled, not functional features.
5. Switch Login -> Create Account -> Login. Check sliding panels and content swap; no footer/navbar should appear on these pages. On registration, enter invalid name/password/confirmation and check visible errors without lost input. Only create a new account if wanted; successful registration goes to login.
6. Log in as student. Check name in navigation. During DB navigation, a loading message should appear instead of an unresponsive blank area.

## Catalog and curriculum

1. On `/courses`, type part of a course title, then part of its short description; clear search with the browser clear icon.
2. Click Beginner, Intermediate, Advanced, All. Combine each with search. An unmatched search must say “No courses match your search.” The current seed may contain only a Beginner course; empty other levels are expected.
3. Open a course using View Course. Click each module header. Lessons and chevron must toggle together. Tab to a module header and press Enter, then Space. Verify focus remains visible.
4. Click Expand All. All module lists should open and label become Collapse All. Collapse one module, then Expand All again. Click Collapse All and verify every list closes.
5. A locked lesson must not navigate. Open an accessible lesson link. If unenrolled, Log In to Enroll / Enroll in Course should lead to login or create an enrollment and show the roadmap. Enrollment is a real persistent change.

## Dashboard, roadmap, lesson and quiz

1. `/dashboard`: use View Course, Continue Learning, Next Lesson, View Roadmap, View All Achievements and the latest quiz result link. Each must navigate to the expected content. Bookmark is faded/unavailable.
2. `/roadmap`: click both a current/completed node's circle and its title. They must reach the same lesson/quiz/reward. Locked nodes show a lock and do not navigate. Course title returns to Course Detail.
3. On a lesson, expand/collapse every sidebar module with mouse and keyboard. Current module starts open. Locked lesson links remain unavailable, even inside an expanded module.
4. Play/pause the embedded YouTube video; test sound/fullscreen. Third-party restrictions/network can affect playback. If an admin configured a direct MP4, native controls should appear. Invalid/empty videos show an unavailable preview, not active-looking playback controls.
5. Click Mark as Complete on an accessible incomplete lesson only if you want real progress recorded. It should display Saving, then Completed; next step should unlock according to the existing rules. Repeating should not duplicate progress. Previous/Next links must work; Download Notes remains faded/unavailable.
6. Open an accessible checkpoint quiz. Next must be disabled until an answer is selected; selection must be clearly highlighted. Advance, go Previous and confirm the previous selection remains. Finish all questions and click Submit; pending state must appear and repeated rapid clicks must not create duplicate submissions.
7. Result page: test Review Answers anchor (passed), Review Lessons (failed), Retry Quiz and Continue to Next Stage. Retry must start a fresh questionnaire. Passing requires the configured threshold (seed: 80%). These submissions create real history, so use a demo student deliberately.
8. Repeat quiz and sidebar interactions on mobile: no control may be covered by invisible overlays, and option text must remain readable.

## Achievements and profile

1. `/achievements`: earned and locked badges are informational cards. Next Milestone no longer displays a misleading navigation chevron.
2. `/profile`: click Edit Profile, change name/bio, then Close. Reopen and check the current draft is available. Enter an invalid avatar URL or too-short name and Save: an error must be visible and entered text retained.
3. Save a valid change; confirm success and reload to check persistence. Restore original values if the change was only a test. Name/avatar should reflect stored data after navigation/reload.
4. Share Profile, photo upload, View All Activity and Manage YouTube must be visibly disabled. No OAuth/account sync is part of this build.
5. Check a local avatar and, if desired, an HTTPS image you control. Invalid/missing remote image should fall back locally without crashing. Test image-error fallback in a real browser, not just HTML source.

## Admin navigation and filters

1. Student: try `/admin` directly. It must redirect to dashboard without showing Admin content. Guest: protected pages must redirect to login.
2. Log in as admin. Open/close the admin menu, press Escape, cycle Tab/Shift+Tab at its ends, and verify focus returns to the opener. Select each destination; menu closes and active route changes. Sidebar name/avatar must be your account's data.
3. `/admin`: type a course title in header search and press Enter. Courses list opens filtered. Test all four Quick Actions, View All Courses and Edit. Notifications are disabled.
4. `/admin/courses`: test search + All/Published/Draft together; clear search. New Course and every Edit button must open a form. Delete requests confirmation; history-bearing records must show a clear rejection without deleting history.
5. `/admin/lessons`: choose a course, then a module. Change course and confirm module resets to All modules. Search, clear, Edit and New Lesson must work.
6. `/admin/quizzes`: search/filter by course, open New Quiz/Edit. `/admin/students`: search name/email, combine course and Active/Inactive filters, then View. Student detail shows Back to Students and useful empty states.

## Admin form/native select checks

Use a temporary **Draft** course and uniquely named test content. Avoid changing attempted quizzes or real curriculum merely to test controls.

1. `/admin/courses/new`: fill title/instructor, choose level and Draft, save. You should reach Edit with success. Reload: values persist. On Edit change description, save; switch Published/Draft only for the test course and check public visibility.
2. Course Edit: create a module with unique order. Edit title/order. Duplicate order should show a safe error. Only an empty module/course may be deleted.
3. `/admin/lessons/new`: choose course then module using native dropdowns (mouse and keyboard arrows/Enter); save a draft lesson with valid video URL. On Edit, parent course/module selectors are intentionally disabled with an explanation; hidden IDs still allow title/status/video changes to save. If no module exists, an instruction tells you to add one first.
4. `/admin/quizzes/new`: choose course/module, add a question, fill options, select exactly one correct answer, remove the last extra question, then save. Correct-answer select must open. On an attempted quiz, question fields and pass threshold are intentionally protected, while metadata/status remain editable.
5. `/admin/roadmap`: choose a course, choose LESSON/QUIZ/REWARD, check target options update; enter title and add an unused target. Move up/down and confirm order persists after reload. A duplicate target or history-protected removal must show an error. Do not remove nodes with real learning history.
6. `/admin/badges`: New Badge opens a modal; all Condition/Icon/Status selects must open. Close with X and Escape. Reopen, save valid values, reopen Edit and confirm them. Cancel/delete only your temporary unused badge. If a badge was earned, deletion must be blocked.
7. Cleanup temporary content in dependency order: unreferenced roadmap nodes -> unused lesson/quiz -> empty module -> empty course; unused test badge. Never delete real attempts/answers/progress to force cleanup.

## Performance and visual checks

1. In browser Network, disable cache and reload `/`. CSS backgrounds should request `.webp`; the nine converted backgrounds total about 380 KB instead of 11 MB. Scroll all landing sections: no missing backgrounds or broken snap behavior.
2. Inspect tiny local avatars: requests should use Next/Image resized assets, not raw 1.28 MB frc.PNG. Remote HTTPS images intentionally bypass the server optimizer.
3. Compare landing/auth/dashboard/course/profile backgrounds on desktop/mobile. Dimensions and positioning should match the original design; inspect dark gradients for compression artifacts.
4. Navigate through DB pages; verify loading feedback. Remote Neon delays can remain. If a database connection drops, record the route/time and retry; do not treat a successful build as proof of runtime health.

Record browser/version, viewport, route, clicked control and observed result for any failure. The automated report distinguishes static/unit/HTTP checks from these outstanding real-browser clicks.
