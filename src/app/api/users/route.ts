import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import logger from '@/utilities/logger'

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)
  } catch (error) {
    logger.error('Error fetching users', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      },
    })
    return NextResponse.json(user)
  } catch (error) {
    logger.error('Error creating user', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
} 