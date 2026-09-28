# Student UX verification

Browser automation was not available in this session. These are **pending browser checks**, not claims of completed clicks or visual comparison. Run the production app (`npm run build`, `npm run start`) and use a student account with both completed and locked content.

## Navigation and learning

1. Open `/courses`. Click a card image, title, blank card area and View Course: all open that course. Tab to its link and press Enter. The bookmark button must save without navigating.
2. Open a course module. Click the title, blank row and video icon of an unlocked lesson. Each opens the same lesson. Completed lessons also open. Locked rows have no link and cannot be activated.
3. In a lesson breadcrumb, open Courses, the course title and Module. Module opens the matching course accordion at `#module-N`. Current lesson remains text.
4. Complete the final lesson before a quiz. Completed, Next Checkpoint and Download Notes have equal 48px height. Narrow screens wrap cleanly. Download Notes remains disabled.
5. Visit a future locked lesson URL directly. Expect a generic Lesson Locked card with View Roadmap and Back to Course. No player or protected lesson content appears.
6. For a module with three lessons and one required quiz, complete all three lessons: 75%, Checkpoint required. Continue Learning opens the quiz. Earlier lessons remain available for rewatching.
7. Fail the quiz: module remains incomplete; row says Not passed - Retry required. Retry from result. Pass with at least 80%: module reaches 100%, row says Passed and next stage unlocks. Historical failed attempts never revoke a pass.
8. On a quiz, check course breadcrumb and Back to Course. The visible warning explains unsubmitted answers are discarded. Returning starts a fresh unsaved attempt.
9. On both result variants, use Back to Course and View Roadmap. Failed result has Retry Quiz. Passed result offers Review Answers and Continue to Next Stage.
10. Inspect answer review: each question has Correct/Incorrect, your answer, correct answer and explanation where available. Check long text at 320px.

## Profile photo and save

1. Open `/profile`, click Edit Profile or the camera button. Raw Avatar URL is absent.
2. Choose JPEG, PNG and WebP files. Preview updates. Original limit is 5 MB; output is at most 512px per dimension and 280,000 data-URL characters. Crop is not required.
3. Try SVG, text, an empty file, a file larger than 5 MB and a corrupt image. Expect a clear error and unchanged previous preview. No save occurs while processing.
4. Change name/bio/photo and Save. Expect pending feedback, updated visible profile, closed panel and a short success message. Refresh: values and avatar persist, including navbar/sidebar avatar.
5. Simulate a network error while saving. The panel remains open; entered values are preserved; success is not displayed. Retry after reconnecting.

## Sidebar and logout

1. Open the hamburger menu. Click the backdrop: it closes. Open again and press Escape while focusing a menu link: it closes and restores focus to the opener.
2. Tab and Shift+Tab stay within the open dialog. Hidden menu links are not focusable. Page behind the menu does not scroll.
3. Open menu, click logo: navigate to `/` and close. Repeat for Dashboard, Courses, Roadmap, Achievements, Bookmarks and View Profile.
4. Log out from the menu. Expect pending feedback, closed sidebar, removed authenticated name/avatar, landing redirect and success toast. Protected pages now require login. Log back in: identity returns correctly.

## Bookmarks

1. Save a course from catalog, detail or Continue Learning. Icon fills immediately, pending prevents repeat submissions, and refresh preserves state.
2. Save an accessible lesson. Open `/bookmarks`: Saved Courses and Saved Lessons show titles, metadata, real destinations and remove controls.
3. Save an already saved target again through another page: only one row exists per user and target.
4. Remove each bookmark. It disappears from the list and remains absent after refresh. Course/lesson itself must remain intact.
5. Use another account: the first account's bookmarks are not visible or removable. Sign out and visit `/bookmarks`: redirected to login.
6. Simulate a save failure: optimistic icon returns to its original state and an error is shown.

## Landing viewport matrix

At **320, 375, 390, 430 and 768px**, inspect navbar, Hero, Roadmap, Practical Lessons, Growth, Community and footer. Use 812px height and also a short landscape height. At desktop, compare to the existing design.

- No horizontal scrollbar or cropped actionable content; long signed-in names truncate in navbar.
- Hero heading, profile strip and CTA fit.
- Roadmap features and checkpoint description fit; section can grow if content is tall.
- Practical Lessons: text comes first in normal flow, phone artwork has its own centered area below. No phone/text overlap. Full phone is visible; right decorative art may be cropped. Desktop background composition is unchanged.
- Growth cards stack without overflowing; Community heading and avatars fit.
- Footer columns and newsletter controls fit. Unavailable controls remain visibly disabled.
- Keyboard focus remains visible; enable reduced motion and check drawer/toast behavior.

## Intentionally disabled

Progress (no destination), Community, Creator Tools, Notes, Settings, Library, Download Notes, Share Profile, YouTube connection management, footer social destinations, unimplemented footer informational/legal destinations and newsletter signup. Do not expect these to navigate or mutate data.

## Automated runtime boundary

`scripts/verify-student-ux.ts` is an opt-in integration check, **not browser automation**. It uses two temporary users, the existing published curriculum, real bookmark services and HTTP requests. It removes its own dependent progress/enrollment rows and users afterward. It never resets the database or edits existing student history.

PowerShell:

```powershell
$env:RUN_STUDENT_UX_CHECK='1'
node --conditions=react-server --import tsx scripts/verify-student-ux.ts
```

Use only with the local production server on port 3000 and the intended database configured. An interrupted-run cleanup mode is limited to the script's temporary `ux-...@example.invalid` users created within the preceding hour.
