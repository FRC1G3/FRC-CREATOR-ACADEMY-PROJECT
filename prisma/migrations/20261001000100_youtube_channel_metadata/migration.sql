-- Additive only. Legacy channel/token columns and all learning history are preserved.
ALTER TABLE "YouTubeConnection"
  ADD COLUMN "googleAccountId" TEXT,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "customUrl" TEXT,
  ADD COLUMN "hiddenSubscriberCount" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "YouTubeConnection" ADD CONSTRAINT "YouTubeConnection_googleAccountId_fkey"
  FOREIGN KEY ("googleAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
