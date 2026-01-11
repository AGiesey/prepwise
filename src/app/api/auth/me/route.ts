import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getOrCreateUserFromAuth0 } from '@/utilities/userSync';
import logger from '@/utilities/logger';

/**
 * GET /api/auth/me
 * Returns the current user from the database, synced with Auth0
 * Creates the user in the database if they don't exist
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await getOrCreateUserFromAuth0(session.user);
    
    return NextResponse.json(dbUser);
  } catch (error) {
    logger.error('Error getting current user', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    );
  }
}
