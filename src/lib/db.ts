import { PrismaClient } from "@prisma/client";

// Augment globalThis type for prisma in dev to avoid type errors
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  ...(process.env.NODE_ENV === 'production' && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20',
      },
    },
  }),
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown (only in Node.js environment, not Edge Runtime)
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
  });
}

// Edge Runtime compatible Prisma client (for future use if needed)
export const createEdgePrismaClient = () => {
  // Note: This requires Prisma Accelerate or a similar service for Edge Runtime
  // For now, we'll use the regular client and handle Edge Runtime issues differently
  return prisma;
};