import { PrismaClient } from '@prisma/client'

// below is done only for dev environment
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
//////