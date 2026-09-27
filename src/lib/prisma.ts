import { recordQuery } from "./performance";
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

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }), log: process.env.PROFILE_PERFORMANCE === "1" ? [{ emit: "event", level: "query" }] : [] });
  if (process.env.PROFILE_PERFORMANCE === "1") prisma.$on("query", event => recordQuery(event.duration));
  globalForPrisma.prisma = prisma;
  return prisma;
}
