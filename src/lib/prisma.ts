import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const getPrisma = () => {
  globalForPrisma.prisma ??= new PrismaClient({
    log: ["error"],
  });
  return globalForPrisma.prisma;
};

export const safePrismaQuery = async (query: (prisma: PrismaClient) => Promise<any>) => {
  const prisma = getPrisma();
  try {
    return await query(prisma);
  } catch (error) {
    console.error("Prisma query error:", error);
    throw new Error("Database query failed");
  }
};
