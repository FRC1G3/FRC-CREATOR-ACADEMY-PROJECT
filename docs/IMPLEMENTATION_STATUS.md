# Implementation Status

The Technical Documentation (v1.1) describes the **target v1 system**. This repository is currently a **Phase 1 UI prototype**, prepared for the first university/PM review. Routes are not protected and learning data is static/mock.

## IMPLEMENTED UI

- Landing (`/`): introduction, roadmap/checkpoint messaging, lessons, progress, community and CTA.
- Dashboard (`/dashboard`): continue learning, mock progress/streak, next lesson, roadmap preview, achievements and last quiz result.
- Courses (`/courses`): catalog, course links, visual-only search and filters.
- Course Detail (`/courses/youtube`): outcomes, instructor, static curriculum and progress. The dynamic route currently displays the same demo course for any ID.
- Shared navbar, responsive toggleable sidebar and footer; implemented routes have active menu states.

## IN PROGRESS / NEXT

- Lesson page / video player (`/learn/[lessonId]` is an intentional placeholder).
- Gamified Roadmap (`/roadmap` is an intentional placeholder).
- Quiz UI and checkpoint experience.
- Achievements.
- Profile (`/profile` is an intentional placeholder).
- Login/Register.

Unavailable navigation/actions are disabled or marked Coming Soon. Curriculum expansion, bookmarks, catalog search/filtering and learning actions have no application logic yet. Dashboard totals, dates, quiz results and streaks are independent visual fixtures, not calculated progress.

## PLANNED BACKEND

- PostgreSQL and Prisma ORM.
- Authentication, sessions and protected routes.
- Lesson progress persistence.
- Quiz scoring and the 80% checkpoint gate (default: three lessons before a quiz).
- Badge persistence.
- YouTube OAuth/API integration.
- Admin/instructor management.

No backend, database, authentication or external service integration is implemented. These require a separate Phase 2 task.
