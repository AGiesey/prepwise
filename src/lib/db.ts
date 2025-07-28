import { PrismaClient } from '@prisma/client'

// log: ['query', 'error', 'warn'],
const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

// Test the connection
prisma.$connect()
  .then(() => console.log('Successfully connected to database'))
  .catch((e: any) => console.error('Failed to connect to database:', e))

export { prisma } 