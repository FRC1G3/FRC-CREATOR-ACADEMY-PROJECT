import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Optional for offline generate/validate; database commands require a real URL.
  datasource: { url: process.env.DATABASE_URL },
});
