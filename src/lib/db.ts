import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma_portfolio_v2: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma_portfolio_v2 ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_portfolio_v2 = prisma
