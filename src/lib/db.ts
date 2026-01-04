/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'
import { logDebug } from '@/utilities/logger'
import logger from '@/utilities/logger'

// Create Prisma client with connection pooling for production
// Prisma automatically reads DATABASE_URL from environment based on schema.prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Only test connection in development
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => logDebug('Successfully connected to database'))
    .catch((e: any) => logger.error('Failed to connect to database', { error: e }))
}

export { prisma } 