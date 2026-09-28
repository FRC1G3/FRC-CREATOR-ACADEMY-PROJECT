CREATE TABLE "CourseBookmark" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourseBookmark_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LessonBookmark" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LessonBookmark_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CourseBookmark_userId_courseId_key" ON "CourseBookmark"("userId", "courseId");
CREATE UNIQUE INDEX "LessonBookmark_userId_lessonId_key" ON "LessonBookmark"("userId", "lessonId");
CREATE INDEX "CourseBookmark_userId_createdAt_idx" ON "CourseBookmark"("userId", "createdAt");
CREATE INDEX "LessonBookmark_userId_createdAt_idx" ON "LessonBookmark"("userId", "createdAt");
ALTER TABLE "CourseBookmark" ADD CONSTRAINT "CourseBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseBookmark" ADD CONSTRAINT "CourseBookmark_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonBookmark" ADD CONSTRAINT "LessonBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonBookmark" ADD CONSTRAINT "LessonBookmark_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
