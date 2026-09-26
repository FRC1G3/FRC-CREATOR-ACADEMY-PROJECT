import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Server services and the development seed share this lazy client.
export function getPrisma() {
  if (typeof window !== "undefined") {
    throw new Error("Prisma is only available on the server.");
  }
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Set DATABASE_URL before using Prisma.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  globalForPrisma.prisma = prisma;
  return prisma;
}
