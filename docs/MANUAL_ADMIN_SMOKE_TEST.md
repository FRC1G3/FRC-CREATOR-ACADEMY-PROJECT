# Admin university manual smoke test

Use a development Admin account and temporary records only. Do not delete real learner history.

## Shared mutation feedback

1. Open each Admin list: Courses, Lessons, Quizzes, Roadmap and Badges.
2. Trigger one successful safe mutation. Confirm one toast appears, does not shift a row/card, has `aria-live` status behavior and disappears after about five seconds.
3. Trigger a protected Quiz, Roadmap node and Badge delete. Confirm the concise error appears in the same toast and no long text appears beside action buttons.

## Quizzes

1. Open `/admin/quizzes/new`; confirm `← Back to Quizzes` is visible.
2. Submit invalid data; confirm the page stays open, entered values remain and validation is useful.
3. Create a valid Draft quiz. Confirm `Quiz created successfully.` and navigation to `/admin/quizzes`.
4. Edit it. Confirm `Quiz updated successfully.` and return to the list.
5. Use Publish, then Unpublish. Confirm status and toast update without deleting attempts.
6. Delete an unused quiz after confirmation. For a quiz with attempts, confirm deletion is blocked and Draft is suggested.

## Roadmap

1. Select a course and each type (Lesson, Quiz, Reward). Confirm only published/active targets belonging to that course and not already in its roadmap appear.
2. For an empty course, confirm explanatory text and Create Lesson/Create Quiz/Manage Badges link appears instead of an empty select.
3. Add a node; confirm `Roadmap node added successfully.`, immediate list appearance and persistence after refresh.
4. Confirm the just-used target disappears from available targets and a duplicate cannot be submitted.
5. Edit title; confirm type/target cannot be changed and the renamed title persists after refresh.
6. Move nodes up/down; confirm order remains unique and persists after refresh.
7. Remove an unused node after confirmation. For a path with enrollment/history, confirm removal is blocked by toast and the card layout stays unchanged.

## Badges

1. Create and edit a badge. Confirm specific created/updated toast messages.
2. Give three badges different icons; edit only the middle icon and confirm the other two remain unchanged after refresh.
3. Delete an unused badge after confirmation. For an earned badge, confirm deletion is blocked, Inactive is suggested and the card does not expand with error text.

## Students

1. Open `/admin/students`; confirm the Course filter includes every Admin course, including a course with zero enrollments.
2. Confirm the table heading says `Quiz Attempts`; its number counts all stored attempts, including retries.
3. Select a course, then test Not Started, In Progress and Completed. Confirm progress is evaluated for that selected enrollment. Without a selected course, confirm it reflects the student's enrolled courses collectively.
4. Open a student. Confirm header identity/join date, Back to Students, four summary cards, course progress, completed lessons, quiz history with score/status/date and earned badges.
5. Confirm empty sections use explanatory empty states and no password, session, account or credential data appears.

Browser automation was not performed in the implementation session because the installed browser connector's required JavaScript runtime tool was unavailable. Production HTTP rendering and real Neon data behavior were verified separately by `scripts/verify-admin-university.ts`.
