# Final manual product / Google / YouTube check

Run after following GOOGLE_YOUTUBE_SETUP.md, applying committed migrations and restarting the app. Use dedicated demo accounts; never reset existing history. These interactive checks are not claimed as passed by the automated tests.

## Authentication

- Password registration: simple 8+ character password, useful field errors, inputs retained on failure, successful registration redirects to Login.
- Password login, Keep me signed in, logout; existing password accounts still work.
- Login/Register panels retain the sliding animation and halfway content swap. Navbar/footer stay hidden. Google appears only when configured, shows pending, and rapid repeated clicks start one flow.
- Continue with Google: consent requests only basic identity, successful callback stays within the app, new user is STUDENT, student goes to Dashboard and Admin to Admin.
- Cancel/deny OAuth: usable Login with safe feedback, no raw provider response.
- Password user: log in first, link Google through Profile; verify the same academy user, password login still works, edited name/avatar/bio and ADMIN/STUDENT role remain unchanged. A Google identity belonging to another user must not be merged.

## Optional YouTube

- Profile initially shows Not Connected and Connect YouTube when configured. Without Google variables, unavailable controls are hidden.
- Connect YouTube: consent adds only YouTube read-only, returns to Profile, real channel title/photo/handle/stats/connected date/last sync appear. Verify exact counts against API reality, allowing Google's subscriber rounding.
- No-channel Google account: friendly feedback and no invented row. If multiple channels are returned, a real choice is required.
- Refresh Channel: pending, no duplicate clicks, updated timestamp/statistics; expired access token refreshes when the grant remains valid. Revoked permission leads to reconnect rather than a false Connected label.
- Hidden subscribers say Hidden; missing statistics say Unavailable. View on YouTube opens the correct real channel in a new tab.
- Remove Connection: cancel leaves data intact; confirm removes only app metadata. Password/Google login, role, lessons/quizzes/bookmarks/badges remain intact. Reconnect works. Removing app metadata does not revoke Google's grant.
- Reload a successful completion callback: no duplicate channel connection or unnecessary external fetch.

## UI / responsive

- Check desktop around 1440px, tablet around 820px, mobile around 390px, including short viewport heights. Long channel titles/handles, actions and statistics must wrap with no horizontal overflow. Keyboard focus remains visible; status/errors are readable without relying on color.
- Menu contains Dashboard, Courses, Roadmap, Achievements, Bookmarks, Profile (plus Admin for Admin); no standalone Progress, Community, Creator Tools, Notes, Settings or Library. Menu closes on navigation; no permanent content-space shift.
- No fake notification bell, Share Profile, activity View All, Download Notes, Forgot password, social links, newsletter or inactive footer destinations. Footer retains real navigation.
- Pending forms, quiz selection/submission, locked content and Admin prerequisites remain legitimately disabled as appropriate.
- Lessons with invalid/empty videos show an unavailable preview without fake player controls. Actual embeds/direct media still have real controls.

## Regression

- Dashboard / catalog / course detail; lesson playback, Mark Complete, quiz scoring/retry/result/review, roadmap unlocking, badges and bookmarks.
- Profile editing/avatar; Admin course/module/lesson/quiz/roadmap/badge actions and safe student views.
- Google cancel, denied YouTube scope, network/API/quota failure and reconnect; no token in public props or browser error messages.

Production publishing, public OAuth verification and deployment remain separate tasks.
