import "server-only";
import { createHash } from "node:crypto";
import { getPrisma } from "./prisma";
// Account-keyed, database-backed limit applies to Server Actions and HTTP endpoints.
// No reliance on a spoofable forwarded IP header or a per-process memory counter.
export async function allowAuthAttempt(email: string) {
  const key = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  const rows = await getPrisma().$queryRaw<{ count: number }[]>`
    INSERT INTO "AuthThrottle" ("key", "count", "windowStart") VALUES (${key}, 1, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "AuthThrottle"."windowStart" < NOW() - INTERVAL '15 minutes' THEN 1 ELSE "AuthThrottle"."count" + 1 END,
      "windowStart" = CASE WHEN "AuthThrottle"."windowStart" < NOW() - INTERVAL '15 minutes' THEN NOW() ELSE "AuthThrottle"."windowStart" END
    RETURNING "count"`;
  return rows[0].count <= 10;
}
