import { PrismaClient } from "@prisma/client";
import { config } from "../config/index";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (config.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
