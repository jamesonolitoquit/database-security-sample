import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const getPrisma = () => {
  globalForPrisma.prisma ??= new PrismaClient({
    log: ["error"],
  });
  return globalForPrisma.prisma;
};
