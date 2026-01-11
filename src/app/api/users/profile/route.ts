import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getOrCreateUserFromAuth0 } from '@/utilities/userSync';
import { prisma } from '@/lib/db';
import logger from '@/utilities/logger';

/**
 * PATCH /api/users/profile
 * Updates the current user's profile (firstName, lastName)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get or create the user in the database
    const dbUser = await getOrCreateUserFromAuth0(session.user);
    
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName } = body;

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        firstName: firstName !== undefined ? firstName : null,
        lastName: lastName !== undefined ? lastName : null,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user profile', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
