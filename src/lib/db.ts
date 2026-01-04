/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'

// Create Prisma client with connection pooling for production
// Prisma automatically reads DATABASE_URL from environment based on schema.prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Only test connection in development
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => console.log('Successfully connected to database'))
    .catch((e: any) => console.error('Failed to connect to database:', e))
}

export { prisma } 