import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// Test the connection
prisma.$connect()
  .then(() => console.log('Successfully connected to database'))
  .catch((e: any) => console.error('Failed to connect to database:', e))

export { prisma } 