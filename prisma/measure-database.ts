import "dotenv/config";
import { writeFileSync } from "node:fs";
import { getPrisma } from "../src/lib/prisma";

async function main() {
  const db = getPrisma();
  const config = new URL(process.env.DATABASE_URL!);
  const samples: { label: string; ms: number }[] = [];
  async function sample(label: string) {
    const start = performance.now();
    await db.$queryRaw`SELECT 1`;
    const result = { label, ms: Math.round(performance.now() - start) };
    samples.push(result); console.log(result);
  }
  try {
    await sample("fresh connection (not proven compute-cold)");
    for (let i = 1; i <= 3; i++) await sample(`hot ${i}`);
    // This audit stops DB traffic for 330s. Other clients may still keep Neon awake.
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 55_000));
      console.log(`Idle observation: ${(i + 1) * 55}s; no audit query sent.`);
    }
    await sample("first after 330s audit idle");
    for (let i = 1; i <= 3; i++) await sample(`post-idle hot ${i}`);
    writeFileSync("docs/database-latency.json", JSON.stringify({
      pooled: config.hostname.includes("-pooler"),
      region: config.hostname.includes("us-east-2") ? "us-east-2" : "not inferred",
      sslmode: config.searchParams.get("sslmode"),
      note: "Read-only SELECT 1. Idle applies to this audit, not proof of provider scale-to-zero; another development client may remain active.",
      samples,
    }, null, 2));
  } finally { await db.$disconnect(); }
}
main().catch(() => { console.error("Database probe failed; private connection details omitted."); process.exitCode = 1; });
